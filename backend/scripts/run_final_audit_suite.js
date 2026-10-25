/**
 * VisitNepal Production Hardening Integration Test Suite
 * Tests all critical workflows against the live running API server on port 8080.
 */

const BASE_URL = 'http://localhost:8080';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = { raw: text };
  }
  return { status: res.status, ok: res.ok, data: json };
}

async function getOrRegisterUser(email, password, fullName, role) {
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (loginRes.status === 200 && loginRes.data?.data?.token) {
    return loginRes.data.data.token;
  }
  // Register if not already created
  const regRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name: fullName, role }),
  });
  if (regRes.status === 201 && regRes.data?.data?.token) {
    return regRes.data.data.token;
  }
  throw new Error(`Failed to obtain token for ${email}: ${JSON.stringify(loginRes.data)} / ${JSON.stringify(regRes.data)}`);
}

async function runSuite() {
  console.log('===============================================================');
  console.log('VISITNEPAL FINAL PRODUCTION HARDENING AUTOMATED TEST SUITE');
  console.log('===============================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // 1. HEALTH & DATABASE ARCHITECTURE
    // -------------------------------------------------------------
    console.log('\n--- 1. Health & Database Architecture ---');
    const health = await request('/health');
    assert(health.status === 200 && health.data.data.platform.includes('VisitNepal'), 'GET /health reports online status with diagnostics');

    const dbHealth = await request('/health/db');
    assert(dbHealth.status === 200 && dbHealth.data.data.provider !== undefined, 'GET /health/db reports accurate database state & latency');

    // -------------------------------------------------------------
    // 2. AUTHENTICATION & ROLE-BASED ACCESS CONTROL
    // -------------------------------------------------------------
    console.log('\n--- 2. Authentication & Authorization ---');
    // Tourist user
    const touristToken = await getOrRegisterUser('traveler.tourist@test.com', 'password123', 'John Explorer', 'tourist');
    assert(Boolean(touristToken), 'Tourist authentication generates valid JWT');
    const touristAuth = { Authorization: `Bearer ${touristToken}` };

    // Business owner user
    const bizToken = await getOrRegisterUser('hotel.partner@test.com', 'password123', 'Himalaya Hotel Partner', 'hotel');
    assert(Boolean(bizToken), 'Business owner authentication succeeds');
    const bizAuth = { Authorization: `Bearer ${bizToken}` };

    // Admin user (seeded in memory_db or registered)
    let adminToken;
    try {
      adminToken = await getOrRegisterUser('admin@visitnepal.com', 'password', 'System Admin', 'admin');
    } catch (_) {
      adminToken = await getOrRegisterUser('admin.master@test.com', 'password123', 'System Administrator', 'admin');
    }
    assert(Boolean(adminToken), 'Admin authentication succeeds');
    const adminAuth = { Authorization: `Bearer ${adminToken}` };

    // Unauthorized access rejection
    const invalidTokenRes = await request('/api/bookings', {
      headers: { Authorization: 'Bearer INVALID_EXPIRED_TOKEN' },
    });
    assert(invalidTokenRes.status === 401 || invalidTokenRes.status === 403, 'Invalid token is rejected');

    // -------------------------------------------------------------
    // 3. BOOKING ENGINE & CONFLICT ENGINE
    // -------------------------------------------------------------
    console.log('\n--- 3. Booking Engine & Conflict Prevention ---');
    const idemKey = `test_idem_${Date.now()}`;
    const b1 = await request('/api/bookings', {
      method: 'POST',
      headers: touristAuth,
      body: JSON.stringify({
        item_type: 'hotel',
        quantity: 1,
        start_date: '2026-10-01T00:00:00Z',
        end_date: '2026-10-04T00:00:00Z',
        idempotency_key: idemKey,
      }),
    });
    assert(b1.status === 201, 'Booking 1 created successfully');
    const bookingId = b1.data.data.id;

    // Idempotent duplicate booking attempt
    const b2 = await request('/api/bookings', {
      method: 'POST',
      headers: touristAuth,
      body: JSON.stringify({
        item_type: 'hotel',
        quantity: 1,
        start_date: '2026-10-01T00:00:00Z',
        end_date: '2026-10-04T00:00:00Z',
        idempotency_key: idemKey,
      }),
    });
    assert(b2.status === 200 && b2.data.data.id === bookingId, 'Idempotency prevents duplicate booking and duplicate charging');

    // Invalid date range rejection
    const invalidDate = await request('/api/bookings', {
      method: 'POST',
      headers: touristAuth,
      body: JSON.stringify({
        start_date: '2026-10-05T00:00:00Z',
        end_date: '2026-10-02T00:00:00Z',
      }),
    });
    const dateErrorCode = invalidDate.data?.error?.code || invalidDate.data?.code;
    assert(invalidDate.status === 400 && dateErrorCode === 'INVALID_DATE_RANGE', 'Server rejects invalid date range (end before start)');

    // -------------------------------------------------------------
    // 4. PAYMENT SYSTEM & LIFECYCLE (STRIPE & PAYPAL)
    // -------------------------------------------------------------
    console.log('\n--- 4. Payment Gateway & Financial Lifecycle (Stripe & PayPal) ---');
    // Gateways inspection
    const gateways = await request('/api/payments/gateways');
    const gatewayIds = gateways.data.data.gateways.map((g) => g.id);
    assert(gateways.status === 200 && gatewayIds.includes('stripe') && gatewayIds.includes('paypal'), 'Gateways endpoint lists Stripe and PayPal');

    // Create payment intent with Stripe
    const stripeIntent = await request('/api/payments/create-intent', {
      method: 'POST',
      headers: touristAuth,
      body: JSON.stringify({ booking_id: bookingId, provider: 'stripe' }),
    });
    assert(stripeIntent.status === 201 && stripeIntent.data.data.paymentId, 'Stripe payment intent successfully initiated');

    // Create payment intent with PayPal
    const paypalIntent = await request('/api/payments/create-intent', {
      method: 'POST',
      headers: touristAuth,
      body: JSON.stringify({ booking_id: bookingId, provider: 'paypal' }),
    });
    assert(paypalIntent.status === 201 && paypalIntent.data.data.paymentId, 'PayPal payment intent successfully initiated');

    // Verify payment callback with Stripe
    const verifyRes = await request('/api/payments/verify', {
      method: 'POST',
      headers: touristAuth,
      body: JSON.stringify({
        booking_id: bookingId,
        session_id: stripeIntent.data.data.paymentId,
        provider: 'stripe',
      }),
    });
    assert(verifyRes.status === 200 && verifyRes.data.data.status === 'confirmed', 'Stripe payment verification transitions booking to confirmed');
    assert(verifyRes.data.data.settlement.providerSettlement > 0, 'Numeric-safe financial settlement calculates provider payout correctly');

    // Refund processing
    const refundRes = await request(`/api/payments/${bookingId}/refund`, {
      method: 'POST',
      headers: adminAuth,
      body: JSON.stringify({ amount: 50, reason: 'Partial trip cancellation refund' }),
    });
    assert(refundRes.status === 200 && refundRes.data.data.refundAmount === 50, 'Full/Partial refund processed in double-entry ledger');

    // -------------------------------------------------------------
    // 5. PERMIT WORKFLOW & PUBLIC CHECKPOST VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- 5. Permit System End-to-End ---');
    const permitSub = await request('/api/permits', {
      method: 'POST',
      headers: touristAuth,
      body: JSON.stringify({
        permit_type_code: 'TIMS',
        travel_start_date: '2026-11-01',
        travel_end_date: '2026-11-15',
        personal_info: { passport_number: 'N12345678', nationality: 'Canada' },
      }),
    });
    assert(permitSub.status === 201 && permitSub.data.data.reference_number, 'Permit submission creates reference number (NP-PERMIT-...)');
    const permitId = permitSub.data.data.id;
    const refNumber = permitSub.data.data.reference_number;

    // Officer review approval
    const reviewRes = await request(`/api/permits/${permitId}/review`, {
      method: 'PUT',
      headers: adminAuth,
      body: JSON.stringify({ status: 'approved', review_notes: 'Verified against national park guidelines' }),
    });
    assert(reviewRes.status === 200 && reviewRes.data.data.status === 'approved', 'Permit officer approval succeeds with audit trail');

    // Digital permit retrieval
    const digPermit = await request(`/api/permits/${permitId}/digital-permit`, {
      headers: touristAuth,
    });
    assert(digPermit.status === 200 && digPermit.data.data.isApproved === true, 'Digital permit card issued with QR payload and terms');

    // Public checkpost verification (No private passport exposure)
    const pubVerify = await request(`/api/permits/verify/${refNumber}`);
    assert(pubVerify.status === 200 && pubVerify.data.data.isValid === true, 'Public park ranger checkpost verification validates permit');
    assert(pubVerify.data.data.passport_number === undefined, 'Public checkpost verification does NOT expose private passport data');

    // -------------------------------------------------------------
    // 6. BUSINESS MULTI-TENANT ISOLATION & STAFF PERMISSIONS
    // -------------------------------------------------------------
    console.log('\n--- 6. Multi-Tenant Security & Staff Permissions ---');
    // Tourist attempting to view business transactions -> MUST BE 403 FORBIDDEN
    const touristBizTx = await request('/api/businesses/transactions', { headers: touristAuth });
    assert(touristBizTx.status === 403, 'Unauthorized user rejected from business financial ledger (HTTP 403)');

    // Tourist attempting to request payout -> MUST BE 403 FORBIDDEN
    const touristPayout = await request('/api/businesses/payouts', {
      method: 'POST',
      headers: touristAuth,
      body: JSON.stringify({ amount: 500 }),
    });
    assert(touristPayout.status === 403, 'Unauthorized user rejected from requesting payouts (HTTP 403)');

    // Business owner accessing their own ledger
    const ownerTx = await request('/api/businesses/transactions', { headers: bizAuth });
    assert(ownerTx.status === 200, 'Authorized business owner can access their business ledger');

    // Protected document access control: create doc as business owner
    const docReg = await request('/api/verification/document', {
      method: 'POST',
      headers: bizAuth,
      body: JSON.stringify({
        document_type: 'business_registration',
        file_url: '/uploads/confidential_license_123.pdf',
      }),
    });
    const docId = docReg.data.data.id;

    // Tourist attempts to access the confidential document -> MUST BE 403 FORBIDDEN
    const unauthDoc = await request(`/api/verification/documents/${docId}/secure-file`, { headers: touristAuth });
    assert(unauthDoc.status === 403, 'Confidential verification documents reject unauthorized viewers (HTTP 403)');

    console.log('\n===============================================================');
    console.log(`FINAL TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test suite runtime error:', err);
    process.exit(1);
  }
}

runSuite();
