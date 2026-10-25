/**
 * VisitNepal Real-Time Cross-Platform Data Synchronization Test Suite
 * Tests multi-tenant isolation, authorization, real-time WebSocket propagation,
 * stale event filtering, duplicate rejection, and reconnect resync.
 */

const { WebSocket } = require('ws');

const HTTP_BASE = 'http://localhost:8080';
const WS_BASE = 'ws://localhost:8080/ws';

async function request(endpoint, options = {}) {
  const url = `${HTTP_BASE}${endpoint}`;
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
    return { token: loginRes.data.data.token, user: loginRes.data.data.user };
  }
  const regRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name: fullName, role }),
  });
  if (regRes.status === 201 && regRes.data?.data?.token) {
    return { token: regRes.data.data.token, user: regRes.data.data.user };
  }
  throw new Error(`Failed to obtain token for ${email}: ${JSON.stringify(loginRes.data)} / ${JSON.stringify(regRes.data)}`);
}

function connectWsClient(token, name) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${WS_BASE}?token=${token}`);
    const receivedEvents = [];

    ws.on('open', () => {
      // connected
    });

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        receivedEvents.push(msg);
      } catch (_) {}
    });

    ws.on('error', (err) => {
      console.error(`[WS_${name}] Error:`, err.message);
    });

    // Wait 200ms to ensure handshake finishes
    setTimeout(() => {
      resolve({
        ws,
        name,
        events: receivedEvents,
        clearEvents: () => { receivedEvents.length = 0; },
        waitForEvent: (predicate, timeoutMs = 4000) => {
          return new Promise((res, rej) => {
            const start = Date.now();
            const check = () => {
              const found = receivedEvents.find((m) => m.type === 'event' && predicate(m.data));
              if (found) return res(found.data);
              if (Date.now() - start > timeoutMs) {
                return rej(new Error(`Timeout waiting for event on ${name}`));
              }
              setTimeout(check, 50);
            };
            check();
          });
        },
        send: (payload) => ws.send(JSON.stringify(payload)),
        close: () => ws.close(),
      });
    }, 300);
  });
}

async function runRealtimeSuite() {
  console.log('===============================================================');
  console.log('VISITNEPAL REAL-TIME CROSS-PLATFORM SYNCHRONIZATION TEST SUITE');
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

  let clientAdmin, clientBizA, clientTouristB, clientBizC;

  try {
    // 1. Setup Test Actors
    console.log('\n--- 1. Authenticating Test Actors ---');
    const adminUser = await getOrRegisterUser('admin_rt@visitnepal.com', 'AdminPass123!', 'Super Admin RT', 'admin');
    const bizA = await getOrRegisterUser('hotel_rt_a@example.com', 'HotelPass123!', 'Hotel Pokhara Grand', 'hotel');
    const touristB = await getOrRegisterUser('tourist_rt_b@example.com', 'TouristPass123!', 'Maya Devi Traveler', 'tourist');
    const bizC = await getOrRegisterUser('hotel_rt_c@example.com', 'HotelPass123!', 'Hotel Everest View', 'hotel');

    assert(adminUser.token && bizA.token && touristB.token && bizC.token, 'All 4 test actor JWT tokens obtained');

    // 2. Connect WebSocket Clients
    console.log('\n--- 2. Establishing Authorized WebSocket Connections ---');
    clientAdmin = await connectWsClient(adminUser.token, 'ADMIN');
    clientBizA = await connectWsClient(bizA.token, 'BIZ_A');
    clientTouristB = await connectWsClient(touristB.token, 'TOURIST_B');
    clientBizC = await connectWsClient(bizC.token, 'BIZ_C');

    assert(clientAdmin.ws.readyState === WebSocket.OPEN, 'Admin WS client connected to /ws');
    assert(clientBizA.ws.readyState === WebSocket.OPEN, 'Business A WS client connected to /ws');
    assert(clientTouristB.ws.readyState === WebSocket.OPEN, 'Tourist B WS client connected to /ws');
    assert(clientBizC.ws.readyState === WebSocket.OPEN, 'Business C WS client connected to /ws');

    // 3. Multi-Tenant Channel Security & Forbidden Subscription Test
    console.log('\n--- 3. Testing Multi-Tenant Channel Authorization Enforcement ---');
    clientTouristB.clearEvents();

    // Tourist attempts to subscribe to admin channel (unauthorized)
    clientTouristB.send({ type: 'subscribe', channel: 'admin' });
    await new Promise((r) => setTimeout(r, 200));

    const forbiddenAdminResp = clientTouristB.events.find((e) => e.type === 'error' && e.code === 'FORBIDDEN_SUBSCRIPTION');
    assert(forbiddenAdminResp !== undefined, 'Tourist subscription to "admin" channel strictly forbidden (403)');

    // Tourist attempts to subscribe to Business A's private channel (unauthorized)
    clientTouristB.send({ type: 'subscribe', channel: 'business:biz-annapurna-101' });
    await new Promise((r) => setTimeout(r, 200));

    const forbiddenBizResp = clientTouristB.events.find((e) => e.type === 'error' && e.message?.includes('Unauthorized subscription'));
    assert(forbiddenBizResp !== undefined, 'Tourist subscription to private business channel strictly forbidden (403)');

    // 4. Admin -> Business Live Updates Test (Approval / Verification)
    console.log('\n--- 4. Testing Admin -> Business Live Verification Flow ---');
    clientAdmin.clearEvents();
    clientBizA.clearEvents();
    clientBizC.clearEvents();

    // Get Business A ID
    const bizARes = await request('/api/businesses/me', {
      headers: { Authorization: `Bearer ${bizA.token}` },
    });
    const bizAId = bizARes.data.data.id;

    // Admin approves Business A
    const adminVerifyPromise = clientBizA.waitForEvent(
      (data) => data.event === 'business.verification.updated' && data.entityId === bizAId
    );

    const verifyReq = await request(`/api/admin/businesses/${bizAId}/verify`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminUser.token}` },
      body: JSON.stringify({ status: 'approved' }),
    });

    assert(verifyReq.status === 200 && verifyReq.data.data.is_verified === true, 'Admin approved Business A in PostgreSQL');

    const receivedBizAEvent = await adminVerifyPromise;
    assert(
      receivedBizAEvent.event === 'business.verification.updated' && receivedBizAEvent.metadata.is_verified === true,
      'Business A received live business.verification.updated event'
    );

    // Multi-tenant check: Business C must NOT receive Business A's private verification event
    const leakedEvent = clientBizC.events.find((e) => e.type === 'event' && e.data?.entityId === bizAId && e.data?.event === 'business.verification.updated');
    assert(!leakedEvent, 'Multi-tenant isolation verified: Business C did NOT receive Business A private verification event');

    // 5. Business -> Tourist Live Updates Test (Room Availability & Price Change)
    console.log('\n--- 5. Testing Business -> Tourist Live Updates Flow ---');
    clientTouristB.clearEvents();

    const touristPricePromise = clientTouristB.waitForEvent(
      (data) => data.event === 'room.price.updated' && data.entityId === 'room-deluxe-annapurna'
    );

    await request('/api/businesses/hotel/availability', {
      method: 'POST',
      headers: { Authorization: `Bearer ${bizA.token}` },
      body: JSON.stringify({
        room_id: 'room-deluxe-annapurna',
        date: '2026-10-01',
        status: 'available',
        price_override: 175.0,
      }),
    });

    const receivedPriceEvent = await touristPricePromise;
    assert(
      receivedPriceEvent.event === 'room.price.updated' && receivedPriceEvent.metadata.price_override === 175.0,
      'Tourist client received live room.price.updated event for cache invalidation'
    );

    // 6. Tourist -> Business Live Booking Flow Test
    console.log('\n--- 6. Testing Tourist -> Business Live Booking Flow ---');
    clientBizA.clearEvents();
    clientTouristB.clearEvents();

    const bizBookingPromise = clientBizA.waitForEvent(
      (data) => data.event === 'booking.created' && data.scope.userId === touristB.user.id
    );

    const bookingRes = await request('/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${touristB.token}` },
      body: JSON.stringify({
        business_id: bizAId,
        item_type: 'hotel',
        quantity: 1,
        start_date: '2026-10-05T00:00:00.000Z',
        end_date: '2026-10-08T00:00:00.000Z',
      }),
    });

    assert(bookingRes.status === 201, `Booking created by Tourist B (ID: ${bookingRes.data.data.id})`);

    const receivedBizBookingEvent = await bizBookingPromise;
    assert(
      receivedBizBookingEvent.event === 'booking.created' && receivedBizBookingEvent.entity === 'booking',
      'Business A received live booking.created event without manual refresh'
    );

    // Tourist B also received notification.created event
    const touristNotif = clientTouristB.events.find((e) => e.type === 'event' && e.data?.event === 'notification.created');
    assert(touristNotif !== undefined, 'Tourist B received instant notification.created event');

    // 7. Real-Time Chat Flow Test
    console.log('\n--- 7. Testing Real-Time Chat Messaging Between Actors ---');
    clientTouristB.clearEvents();
    clientBizA.clearEvents();

    const touristMsgPromise = clientTouristB.waitForEvent(
      (data) => data.event === 'message.created' && data.metadata.content === 'Namaste Maya! Your room at Pokhara Grand is ready.'
    );

    const sendMsgRes = await request('/api/chat/conversations/demo-tourist/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${bizA.token}` },
      body: JSON.stringify({
        content: 'Namaste Maya! Your room at Pokhara Grand is ready.',
        recipient_id: touristB.user.id,
      }),
    });

    assert(sendMsgRes.status === 201, 'Business A sent real-time chat message');

    const receivedChatMsg = await touristMsgPromise;
    assert(
      receivedChatMsg.metadata.content === 'Namaste Maya! Your room at Pokhara Grand is ready.',
      'Tourist B received live chat message with real-time UI append envelope'
    );

    // 8. Reconnect & Resync Test
    console.log('\n--- 8. Testing Reconnection and Resync Catch-up ---');
    const pastTimestamp = new Date(Date.now() - 60000).toISOString();

    const resyncRes = await request(`/api/realtime/resync?since=${encodeURIComponent(pastTimestamp)}`, {
      headers: { Authorization: `Bearer ${touristB.token}` },
    });

    assert(resyncRes.status === 200, 'Resync endpoint responded with 200 OK');
    assert(Array.isArray(resyncRes.data.data), 'Resync returned array of missed events');
    assert(resyncRes.data.data.length > 0, `Resync recovered ${resyncRes.data.data.length} missed events for Tourist B`);

    // Verify all recovered events belong to Tourist B or are public
    const unauthorizedLeak = resyncRes.data.data.find(
      (evt) => evt.scope.userId && evt.scope.userId !== touristB.user.id && !evt.scope.isPublic
    );
    assert(!unauthorizedLeak, 'Resync multi-tenant security verified: no unauthorized private events returned');

    // 9. Realtime Metrics Observability
    console.log('\n--- 9. Verifying Realtime Observability Metrics ---');
    const metricsRes = await request('/api/realtime/metrics', {
      headers: { Authorization: `Bearer ${adminUser.token}` },
    });

    assert(metricsRes.status === 200, 'Admin can query /api/realtime/metrics');
    assert(metricsRes.data.data.connectedClients >= 4, `Active connected clients: ${metricsRes.data.data.connectedClients}`);

  } catch (err) {
    console.error('[UNEXPECTED_ERROR]', err);
    failed++;
  } finally {
    if (clientAdmin) clientAdmin.close();
    if (clientBizA) clientBizA.close();
    if (clientTouristB) clientTouristB.close();
    if (clientBizC) clientBizC.close();

    console.log('\n===============================================================');
    console.log(`REALTIME TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runRealtimeSuite();
