import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuthUser } from '../middleware/auth';
import { getPaymentProvider, listPaymentGateways } from '../services/payment.service';
import { calculateSettlement } from '../services/finance.service';
import { emitRealtimeEvent, EVENT_TYPES } from '../services/realtime.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly db: DatabaseService) {}

  getGateways() {
    const gateways = listPaymentGateways();
    const liveCount = gateways.filter((g) => g.isLiveConfigured && g.id !== 'sandbox').length;

    return {
      gateways,
      liveProductionReady: liveCount > 0,
      notice: 'Live fund settlement requires production API keys in STRIPE_SECRET_KEY / PAYPAL_CLIENT_SECRET',
    };
  }

  async createIntent(user: AuthUser, body: any) {
    const userId = user.id;
    const { booking_id, provider = 'stripe', return_url } = body;

    if (!booking_id) {
      throw new BadRequestException('booking_id is required');
    }

    const bRes = await this.db.query(
      `SELECT * FROM bookings WHERE id = $1 AND profile_id = $2`,
      [booking_id, userId]
    );

    if (bRes.rows.length === 0) {
      throw new NotFoundException('Booking not found or unauthorized');
    }

    const booking = bRes.rows[0];
    const amount = Number(booking.total_amount || 150);
    const currency = booking.currency || 'USD';

    const paymentProvider = getPaymentProvider(provider);
    const intent = await paymentProvider.createPaymentIntent({
      bookingId: booking.id,
      amount,
      currency,
      customerName: user.fullName || 'Tourist',
      customerEmail: user.email || 'tourist@visitnepal.gov.np',
      productName: `VisitNepal Booking #${booking.id.toString().substring(0, 8)}`,
      returnUrl: return_url || `${process.env.PUBLIC_APP_URL || 'http://localhost:8080'}/payment/callback`,
    });

    await this.db.query(
      `UPDATE bookings SET status = 'pending_payment', updated_at = now() WHERE id = $1`,
      [booking_id]
    );

    return intent;
  }

  async verify(user: AuthUser, body: any) {
    const userId = user.id;
    const { provider = 'stripe', booking_id, session_id, orderId, token, payment_id } = body;

    const paymentProvider = getPaymentProvider(provider);
    const verification = await paymentProvider.verifyPayment({
      paymentId: payment_id || session_id || orderId || token,
      session_id,
      orderId: orderId || token,
      ...body,
    });

    if (!verification.success) {
      throw new BadRequestException(verification.error || 'Payment verification failed');
    }

    const targetBookingId = booking_id || body.bookingId;
    if (!targetBookingId) {
      throw new BadRequestException('Could not associate payment with booking');
    }

    const bRes = await this.db.query(`SELECT * FROM bookings WHERE id = $1`, [targetBookingId]);
    if (bRes.rows.length === 0) {
      throw new NotFoundException('Booking not found');
    }

    const booking = bRes.rows[0];
    const grossAmount = Number(booking.base_amount || 150);
    const settlement = calculateSettlement({ grossAmount });

    await this.db.query(
      `UPDATE bookings SET status = 'confirmed', updated_at = now() WHERE id = $1 RETURNING *`,
      [booking.id]
    );

    const txRes = await this.db.query(
      `INSERT INTO transactions (
        booking_id, business_id, customer_id, customer_name, service_title,
        gross_amount, platform_fee, tax_amount, net_amount, currency,
        payment_method, payment_status, payout_status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'completed', 'pending')
       RETURNING *`,
      [
        booking.id,
        booking.business_id,
        userId,
        user.fullName || 'Tourist Customer',
        'Confirmed Booking Payment',
        settlement.grossAmount,
        settlement.platformFee,
        settlement.taxAmount,
        settlement.providerSettlement,
        booking.currency || 'USD',
        provider.toUpperCase(),
      ]
    );

    // Emit Realtime Event
    await emitRealtimeEvent({
      event: EVENT_TYPES.PAYMENT_SUCCEEDED,
      entity: 'payment',
      entityId: txRes.rows[0]?.id || String(booking.id),
      action: 'completed',
      scope: {
        userId,
        businessId: booking.business_id,
      },
      metadata: {
        bookingId: booking.id,
        amount: settlement.grossAmount,
        provider,
        status: 'confirmed',
      },
    });

    await emitRealtimeEvent({
      event: EVENT_TYPES.BOOKING_CONFIRMED,
      entity: 'booking',
      entityId: booking.id,
      action: 'confirmed',
      scope: {
        userId,
        businessId: booking.business_id,
        isPublic: true,
      },
      metadata: {
        bookingId: booking.id,
        status: 'confirmed',
        title: 'Booking Confirmed',
      },
    });

    return {
      status: 'confirmed',
      bookingId: booking.id,
      transaction: txRes.rows[0],
      settlement,
    };
  }

  async handleWebhook(provider: string, body: any) {
    const paymentProvider = getPaymentProvider(provider);
    const verification = await paymentProvider.verifyPayment(body);

    if (!verification.success) {
      throw new BadRequestException(verification.error);
    }

    return { status: 'success', received: true };
  }

  async refund(id: string, user: AuthUser, body: any) {
    const { amount, reason = 'Customer requested cancellation' } = body;
    const userRole = user.role;

    if (!['admin', 'super_admin', 'business_owner', 'hotel', 'trekking_agency'].includes(userRole)) {
      throw new ForbiddenException('Unauthorized to process refunds');
    }

    const txRes = await this.db.query(
      `SELECT * FROM transactions WHERE id = $1 OR booking_id = $1 LIMIT 1`,
      [id]
    );

    if (txRes.rows.length === 0) {
      throw new NotFoundException('Transaction not found');
    }

    const tx = txRes.rows[0];
    const refundAmount = amount ? Number(amount) : Number(tx.net_amount || tx.gross_amount);

    const refundTx = await this.db.query(
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

    if (tx.booking_id) {
      await this.db.query(
        `UPDATE bookings SET status = 'refunded', updated_at = now() WHERE id = $1`,
        [tx.booking_id]
      );
    }

    await this.db.query(
      `INSERT INTO notifications (recipient_id, type, title, message, related_entity_id)
       VALUES ($1, 'refund_issued', 'Refund Processed', $2, $3)`,
      [
        tx.customer_id,
        `A refund of $${refundAmount.toFixed(2)} ${tx.currency} has been processed for your booking.`,
        tx.booking_id,
      ]
    );

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

    return {
      refund: refundTx.rows[0],
      refundAmount,
      reason,
    };
  }
}
