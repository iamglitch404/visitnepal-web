import { Router, Response } from 'express';
import { query } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { authRequired, AuthenticatedRequest } from '../middleware/auth';
import { getPaymentProvider, listPaymentGateways } from '../services/payment.service';
import { calculateSettlement } from '../services/finance.service';
import { emitRealtimeEvent, EVENT_TYPES } from '../services/realtime.service';

const router = Router();

// GET /api/payments/gateways - Returns configured gateways (Stripe, PayPal, and future providers)
router.get('/gateways', (_req, res: Response) => {
  const gateways = listPaymentGateways();
  const liveCount = gateways.filter((g) => g.isLiveConfigured && g.id !== 'sandbox').length;

  return sendSuccess(res, {
    gateways,
    liveProductionReady: liveCount > 0,
    notice: 'Live fund settlement requires production API keys in STRIPE_SECRET_KEY / PAYPAL_CLIENT_SECRET',
  });
});

// POST /api/payments/create-intent - Initiate payment intent with Stripe or PayPal
router.post('/create-intent', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { booking_id, provider = 'stripe', return_url } = req.body;

    if (!booking_id) {
      return sendError(res, 'booking_id is required', 'BAD_REQUEST', 400);
    }

    const bRes = await query(`SELECT * FROM bookings WHERE id = $1 AND profile_id = $2`, [booking_id, userId]);
    if (bRes.rows.length === 0) {
      return sendError(res, 'Booking not found or unauthorized', 'NOT_FOUND', 404);
    }

    const booking = bRes.rows[0];
    const amount = Number(booking.total_amount || 150);
    const currency = booking.currency || 'USD';

    const paymentProvider = getPaymentProvider(provider);
    const intent = await paymentProvider.createPaymentIntent({
      bookingId: booking.id,
      amount,
      currency,
      customerName: req.user!.fullName || 'Tourist',
      customerEmail: req.user!.email || 'tourist@visitnepal.gov.np',
      productName: `VisitNepal Booking #${booking.id.toString().substring(0, 8)}`,
      returnUrl: return_url || `${process.env.PUBLIC_APP_URL || 'http://localhost:8080'}/payment/callback`,
    });

    // Mark booking status as pending_payment
    await query(`UPDATE bookings SET status = 'pending_payment', updated_at = now() WHERE id = $1`, [booking_id]);

    return sendSuccess(res, intent, 201);
  } catch (err: any) {
    console.error('Create payment intent error:', err);
    return sendError(res, err.message || 'Failed to create payment intent', 'SERVER_ERROR', 500);
  }
});

// POST /api/payments/verify - Reconciles Stripe/PayPal callback and confirms booking
router.post('/verify', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { provider = 'stripe', booking_id, session_id, orderId, token, payment_id } = req.body;

    const paymentProvider = getPaymentProvider(provider);
    const verification = await paymentProvider.verifyPayment({
      paymentId: payment_id || session_id || orderId || token,
      session_id,
      orderId: orderId || token,
      ...req.body,
    });

    if (!verification.success) {
      return sendError(res, verification.error || 'Payment verification failed', 'PAYMENT_FAILED', 400);
    }

    const targetBookingId = booking_id || req.body.bookingId;
    if (!targetBookingId) {
      return sendError(res, 'Could not associate payment with booking', 'BAD_REQUEST', 400);
    }

    const bRes = await query(`SELECT * FROM bookings WHERE id = $1`, [targetBookingId]);
    if (bRes.rows.length === 0) {
      return sendError(res, 'Booking not found', 'NOT_FOUND', 404);
    }

    const booking = bRes.rows[0];

    // Compute numeric-safe settlement
    const grossAmount = Number(booking.base_amount || 150);
    const settlement = calculateSettlement({ grossAmount });

    // Transition booking to confirmed
    await query(
      `UPDATE bookings SET status = 'confirmed', updated_at = now() WHERE id = $1 RETURNING *`,
      [booking.id]
    );

    // Resolve business ID
    let bizId = 'biz-ktm-marriott';
    const bizCheck = await query(`SELECT id FROM businesses WHERE owner_id = $1 LIMIT 1`, [userId]);
    if (bizCheck.rows.length > 0) {
      bizId = bizCheck.rows[0].id;
    }

    // Record verified transaction in double-entry ledger
    const txRes = await query(
      `INSERT INTO transactions (
        booking_id, business_id, customer_id, customer_name, service_title,
        gross_amount, platform_fee, tax_amount, net_amount, currency,
        payment_method, payment_status, payout_status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'paid', 'pending')
       RETURNING *`,
      [
        booking.id,
        bizId,
        booking.profile_id,
        req.user?.fullName || 'Verified Traveler',
        `Confirmed Booking #${booking.id.toString().substring(0, 6)}`,
        settlement.totalAmount,
        settlement.platformFee,
        settlement.taxAmount,
        settlement.providerSettlement,
        booking.currency || 'USD',
        provider.toUpperCase(),
      ]
    );

    // Schedule entry in master itinerary
    const now = new Date();
    await query(
      `INSERT INTO user_schedules (user_id, trip_id, booking_id, event_type, title, start_time, end_time, location, notes)
       VALUES ($1, NULL, $2, 'activity', $3, $4, $5, 'Nepal', 'Confirmed Paid Reservation')`,
      [
        booking.profile_id,
        booking.id,
        `Reservation #${booking.id.toString().substring(0, 6)}`,
        now.toISOString(),
        new Date(now.getTime() + 86400000 * 2).toISOString(),
      ]
    );

    // Notification
    await query(
      `INSERT INTO notifications (recipient_id, type, title, message, related_entity_id)
       VALUES ($1, 'payment_success', 'Payment Confirmed!', 'Your payment via ${provider.toUpperCase()} was successful and your reservation is confirmed.', $2)`,
      [booking.profile_id, booking.id]
    );

    // Emit Realtime Events (Strictly after DB write)
    await emitRealtimeEvent({
      event: EVENT_TYPES.PAYMENT_SUCCEEDED,
      entity: 'payment',
      entityId: txRes.rows[0]?.id || `tx-${Date.now()}`,
      action: 'succeeded',
      scope: {
        userId: booking.profile_id,
        businessId: txRes.rows[0]?.business_id || 'biz-ktm-marriott',
      },
      metadata: {
        booking_id: booking.id,
        amount: grossAmount,
        provider,
      },
    });

    await emitRealtimeEvent({
      event: EVENT_TYPES.BOOKING_CONFIRMED,
      entity: 'booking',
      entityId: booking.id,
      action: 'confirmed',
      scope: {
        userId: booking.profile_id,
        businessId: txRes.rows[0]?.business_id || 'biz-ktm-marriott',
      },
      metadata: { status: 'confirmed', totalAmount: grossAmount },
    });

    await emitRealtimeEvent({
      event: EVENT_TYPES.NOTIFICATION_CREATED,
      entity: 'notification',
      entityId: `notif-pay-${booking.id}`,
      action: 'created',
      scope: { userId: booking.profile_id },
      metadata: {
        title: 'Payment Confirmed!',
        message: `Your payment via ${provider.toUpperCase()} was successful and your reservation is confirmed.`,
        relatedEntityId: booking.id,
      },
    });

    return sendSuccess(res, {
      status: 'confirmed',
      bookingId: booking.id,
      transaction: txRes.rows[0],
      settlement,
    });
  } catch (err: any) {
    console.error('Payment verify error:', err);
    return sendError(res, err.message || 'Payment verification failed', 'SERVER_ERROR', 500);
  }
});

// POST /api/payments/webhook/:provider - Asynchronous Webhook from Stripe or PayPal
router.post('/webhook/:provider', async (req, res: Response) => {
  try {
    const { provider } = req.params;
    const paymentProvider = getPaymentProvider(provider);
    const verification = await paymentProvider.verifyPayment(req.body);

    if (!verification.success) {
      return res.status(400).json({ status: 'failed', error: verification.error });
    }

    return res.status(200).json({ status: 'success', received: true });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/payments/:id/refund - Process full or partial refund
router.post('/:id/refund', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { amount, reason = 'Customer requested cancellation' } = req.body;
    const userRole = req.user!.role;

    if (!['admin', 'super_admin', 'business_owner', 'hotel', 'trekking_agency'].includes(userRole)) {
      return sendError(res, 'Unauthorized to process refunds', 'FORBIDDEN', 403);
    }

    const txRes = await query(`SELECT * FROM transactions WHERE id = $1 OR booking_id = $1 LIMIT 1`, [id]);
    if (txRes.rows.length === 0) {
      return sendError(res, 'Transaction not found', 'NOT_FOUND', 404);
    }

    const tx = txRes.rows[0];
    const refundAmount = amount ? Number(amount) : Number(tx.net_amount || tx.gross_amount);

    // Record refund in double-entry ledger
    const refundTx = await query(
      `INSERT INTO transactions (
        booking_id, business_id, customer_id, customer_name, service_title,
        gross_amount, platform_fee, tax_amount, net_amount, currency,
        payment_method, payment_status, payout_status
       ) VALUES ($1, $2, $3, $4, $5, $6, 0, 0, $7, $8, $9, 'refunded', 'cancelled')
       RETURNING *`,
      [
        tx.booking_id,
        tx.business_id,
        tx.customer_id,
        tx.customer_name,
        `Refund: ${reason}`,
        -refundAmount,
        -refundAmount,
        tx.currency || 'USD',
        tx.payment_method || 'Refund',
      ]
    );

    // Update booking status
    if (tx.booking_id) {
      await query(`UPDATE bookings SET status = 'refunded', updated_at = now() WHERE id = $1`, [tx.booking_id]);
    }

    // Notify customer
    await query(
      `INSERT INTO notifications (recipient_id, type, title, message, related_entity_id)
       VALUES ($1, 'refund_issued', 'Refund Processed', $2, $3)`,
      [tx.customer_id, `A refund of $${refundAmount.toFixed(2)} ${tx.currency} has been processed for your booking.`, tx.booking_id]
    );

    // Emit Realtime Event
    await emitRealtimeEvent({
      event: EVENT_TYPES.PAYMENT_REFUNDED,
      entity: 'payment',
      entityId: id,
      action: 'refunded',
      scope: {
        userId: tx.customer_id,
        businessId: tx.business_id,
      },
      metadata: { refundAmount, booking_id: tx.booking_id, reason },
    });

    return sendSuccess(res, {
      refund: refundTx.rows[0],
      refundAmount,
      reason,
    });
  } catch (err: any) {
    console.error('Process refund error:', err);
    return sendError(res, err.message || 'Refund failed', 'SERVER_ERROR', 500);
  }
});

export default router;
