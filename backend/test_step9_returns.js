const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:5000/api';

async function runStep9Verification() {
  console.log('\n================================================================');
  console.log('PARTNEXA STEP 9 — SPARE-PART RETURN & REFUND FLOW END-TO-END TEST');
  console.log('================================================================\n');

  try {
    // ------------------------------------------------------------------------
    // ACTOR AUTHENTICATION
    // ------------------------------------------------------------------------
    console.log('🔐 [Auth] Authenticating actors...');
    const customerLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'demo@partsphere.in',
      password: 'Demo@1234',
    });
    const customerToken = customerLogin.data.data.accessToken;
    const customer = customerLogin.data.data.user;
    const customerHeaders = { Authorization: `Bearer ${customerToken}` };
    console.log(`   Customer: ${customer.firstName} ${customer.lastName} (${customer.email})`);

    const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@partsphere.in',
      password: 'Admin@1234',
    });
    const adminToken = adminLogin.data.data.accessToken;
    const admin = adminLogin.data.data.user;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    console.log(`   Admin: ${admin.firstName} ${admin.lastName} (${admin.email})`);

    const riderLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'rider.rajesh@partsphere.in',
      password: 'Rider@1234',
    });
    const riderToken = riderLogin.data.data.accessToken;
    const rider = riderLogin.data.data.user;
    const riderHeaders = { Authorization: `Bearer ${riderToken}` };
    console.log(`   Rider: ${rider.firstName} ${rider.lastName} (${rider.email})`);

    // Ensure customer has an address
    const addressesRes = await axios.get(`${API_BASE}/users/addresses`, { headers: customerHeaders });
    const addressId = addressesRes.data.data[0]?.id;
    if (!addressId) throw new Error('Customer does not have a saved address for testing');

    // Retrieve compatible product for ordering
    const garageRes = await axios.get(`${API_BASE}/vehicles/garage`, { headers: customerHeaders });
    const activeVehicle = garageRes.data.data.find((v) => v.isActive) || garageRes.data.data[0];
    const variantId = activeVehicle?.variantId;
    const catalogRes = await axios.get(`${API_BASE}/catalog/products?compatibleOnly=true&vehicleVariantId=${variantId}&limit=5`);
    const productsList = Array.isArray(catalogRes.data.data) ? catalogRes.data.data : (catalogRes.data.data?.products || catalogRes.data.products || []);
    const testProduct = productsList[0];
    console.log(`   Test Product: ${testProduct.name} (ID: ${testProduct.id}, Price: ₹${testProduct.price})`);

    // Ensure test product has ample inventory and customer cart is clean for repeatable test runs
    await prisma.inventory.updateMany({
      where: { productId: testProduct.id },
      data: { quantity: 50, reservedQty: 0, isAvailable: true },
    });
    await prisma.cartItem.deleteMany({ where: { cart: { userId: customer.id } } });

    // ------------------------------------------------------------------------
    // TEST 1: UNDELIVERED ORDER — RETURN NOT ALLOWED
    // ------------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('TEST 1: Undelivered Order — Return button & request MUST be blocked');
    console.log('----------------------------------------------------------------');

    // Place an order
    await axios.post(`${API_BASE}/cart/items`, { productId: testProduct.id, quantity: 2 }, { headers: customerHeaders });
    const order1Res = await axios.post(`${API_BASE}/orders`, {
      addressId,
      paymentMethod: 'CASH_ON_DELIVERY',
      notes: 'Test Step 9 undelivered order',
    }, { headers: customerHeaders });
    const order1 = order1Res.data.data;
    const item1 = order1.items[0];
    console.log(`   Created order: #${order1.orderNumber} (Status: ${order1.status})`);

    // Check order details eligibility
    const order1Details = await axios.get(`${API_BASE}/orders/${order1.id}`, { headers: customerHeaders });
    const item1Eligibility = order1Details.data.data.items[0].returnEligibility;
    console.log('   Item eligibility on undelivered order:', item1Eligibility);

    if (item1Eligibility.eligible !== false || item1Eligibility.isDelivered !== false) {
      throw new Error(`FAIL: Undelivered order item was marked eligible!`);
    }
    console.log('✅ PASS: Undelivered order item correctly marked NOT eligible.');

    // Attempt return request via API
    try {
      await axios.post(`${API_BASE}/returns`, {
        orderId: order1.id,
        orderItemId: item1.id,
        quantity: 1,
        reason: 'WRONG_PART',
        details: 'Trying to return undelivered order',
      }, { headers: customerHeaders });
      throw new Error('FAIL: Server accepted return request for undelivered order!');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log(`✅ PASS: Server blocked return on undelivered order (${err.response.data.message})`);
      } else {
        throw err;
      }
    }

    // ------------------------------------------------------------------------
    // TEST 2: ORDER DELIVERED 6 DAYS AGO — WINDOW EXPIRED (Default window = 5)
    // ------------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('TEST 2: Order Delivered 6 Days Ago — Return window expired (> 5 days)');
    console.log('----------------------------------------------------------------');

    // Simulate order delivered 6 days ago in PostgreSQL
    const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
    await prisma.order.update({
      where: { id: order1.id },
      data: {
        status: 'DELIVERED',
        deliveredAt: sixDaysAgo,
      },
    });

    const orderExpiredDetails = await axios.get(`${API_BASE}/orders/${order1.id}`, { headers: customerHeaders });
    const expiredEligibility = orderExpiredDetails.data.data.items[0].returnEligibility;
    console.log('   Item eligibility after 6 days:', expiredEligibility);

    if (expiredEligibility.eligible !== false || expiredEligibility.isWithinWindow !== false) {
      throw new Error('FAIL: Expired order item was marked eligible!');
    }
    if (expiredEligibility.message !== 'Return window ended') {
      throw new Error(`FAIL: Expected "Return window ended" but received "${expiredEligibility.message}"`);
    }
    console.log(`✅ PASS: UI message shows "${expiredEligibility.message}"`);

    // Attempt return request on expired item
    try {
      await axios.post(`${API_BASE}/returns`, {
        orderId: order1.id,
        orderItemId: item1.id,
        quantity: 1,
        reason: 'DEFECTIVE_PART',
        details: 'Trying to return expired order',
      }, { headers: customerHeaders });
      throw new Error('FAIL: Server accepted return request for expired order!');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log(`✅ PASS: Server blocked return on expired order (${err.response.data.message})`);
      } else {
        throw err;
      }
    }

    // ------------------------------------------------------------------------
    // TEST 3: ORDER DELIVERED TODAY — ELIGIBLE WITH DISPLAY DATE
    // ------------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('TEST 3: Order Delivered Today — Eligible with countdown message');
    console.log('----------------------------------------------------------------');

    // Place a new clean order for return lifecycle testing
    await axios.post(`${API_BASE}/cart/items`, { productId: testProduct.id, quantity: 2 }, { headers: customerHeaders });
    const order2Res = await axios.post(`${API_BASE}/orders`, {
      addressId,
      paymentMethod: 'CASH_ON_DELIVERY',
      notes: 'Test Step 9 delivered today order',
    }, { headers: customerHeaders });
    const order2 = order2Res.data.data;
    const item2 = order2.items[0];

    // Mark as DELIVERED right now
    const now = new Date();
    await prisma.order.update({
      where: { id: order2.id },
      data: {
        status: 'DELIVERED',
        deliveredAt: now,
      },
    });

    const order2Details = await axios.get(`${API_BASE}/orders/${order2.id}`, { headers: customerHeaders });
    const eligibleItem = order2Details.data.data.items[0].returnEligibility;
    console.log('   Item eligibility delivered today:', eligibleItem);

    if (eligibleItem.eligible !== true || eligibleItem.isWithinWindow !== true || eligibleItem.isDelivered !== true) {
      throw new Error('FAIL: Delivered today order item is not marked eligible!');
    }
    if (!eligibleItem.message.startsWith('Return available until')) {
      throw new Error(`FAIL: Expected message starting with "Return available until", got "${eligibleItem.message}"`);
    }
    console.log(`✅ PASS: Item eligible! Message: "${eligibleItem.message}"`);

    // ------------------------------------------------------------------------
    // TEST 4: ITEM-LEVEL PARTIAL RETURN CREATION & VALIDATION
    // ------------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('TEST 4: Item-Level Partial Return Request Creation');
    console.log('----------------------------------------------------------------');

    // Attempting quantity > purchased quantity
    try {
      await axios.post(`${API_BASE}/returns`, {
        orderId: order2.id,
        orderItemId: item2.id,
        quantity: 5, // purchased only 2
        reason: 'WRONG_PART',
        details: 'Trying to return more than purchased',
      }, { headers: customerHeaders });
      throw new Error('FAIL: Server allowed returning quantity greater than purchased!');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log(`✅ PASS: Server validated quantity limit (${err.response.data.message})`);
      } else {
        throw err;
      }
    }

    // Create partial return for 1 item
    const createReturnRes = await axios.post(`${API_BASE}/returns`, {
      orderId: order2.id,
      orderItemId: item2.id,
      quantity: 1,
      reason: 'WRONG_PART',
      details: 'Product did not match vehicle spec requirements',
      photos: ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600'],
      pickupAddress: 'Customer Doorstep Residence, Bengaluru',
    }, { headers: customerHeaders });

    const returnRequest = createReturnRes.data.data;
    console.log(`   ReturnRequest created: ID: ${returnRequest.id}`);
    console.log(`   Status: ${returnRequest.status}`);
    console.log(`   Calculated Refund Amount: ₹${returnRequest.refundAmount}`);

    const expectedRefund = Number(item2.unitPrice) * 1;
    if (Number(returnRequest.refundAmount) !== expectedRefund) {
      throw new Error(`FAIL: Server refund amount ₹${returnRequest.refundAmount} does not match expected unitPrice ₹${expectedRefund}`);
    }
    if (returnRequest.status !== 'REQUESTED') {
      throw new Error(`FAIL: Expected status REQUESTED, got ${returnRequest.status}`);
    }
    console.log('✅ PASS: Server-calculated refund amount matches unitPrice * quantity.');

    // Verify duplicate return request on same item is blocked
    try {
      await axios.post(`${API_BASE}/returns`, {
        orderId: order2.id,
        orderItemId: item2.id,
        quantity: 1,
        reason: 'OTHER',
        details: 'Second return attempt',
      }, { headers: customerHeaders });
      throw new Error('FAIL: Server allowed duplicate active return request on same item!');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log(`✅ PASS: Duplicate return on same item blocked (${err.response.data.message})`);
      } else {
        throw err;
      }
    }

    // Verify customer received "Return Requested" notification
    const customerNotifs1 = await axios.get(`${API_BASE}/notifications`, { headers: customerHeaders });
    const reqNotif = customerNotifs1.data.data.find(n => n.title.includes('Return Requested') || n.body.includes('Return request'));
    if (!reqNotif) throw new Error('FAIL: Customer did not receive "Return Requested" notification!');
    console.log(`✅ PASS: Customer received notification: "${reqNotif.title}" — ${reqNotif.body}`);

    // ------------------------------------------------------------------------
    // TEST 5: ADMIN REJECTION FLOW
    // ------------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('TEST 5: Admin Rejection Flow');
    console.log('----------------------------------------------------------------');

    // Reject without reason should fail
    try {
      await axios.patch(`${API_BASE}/admin/returns/${returnRequest.id}/review`, {
        decision: 'REJECT',
      }, { headers: adminHeaders });
      throw new Error('FAIL: Server allowed rejection without rejectionReason!');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log(`✅ PASS: Rejection without reason blocked (${err.response.data.message})`);
      } else {
        throw err;
      }
    }

    // Reject with reason
    const rejectRes = await axios.patch(`${API_BASE}/admin/returns/${returnRequest.id}/review`, {
      decision: 'REJECT',
      rejectionReason: 'Item shows signs of improper DIY installation attempt',
    }, { headers: adminHeaders });

    const rejectedReturn = rejectRes.data.data;
    if (rejectedReturn.status !== 'REJECTED') {
      throw new Error(`FAIL: Expected status REJECTED, got ${rejectedReturn.status}`);
    }
    console.log(`✅ PASS: ReturnRequest status updated to REJECTED with reason: "${rejectedReturn.rejectionReason}"`);

    // Verify customer received "Return Rejected" notification
    const customerNotifs2 = await axios.get(`${API_BASE}/notifications`, { headers: customerHeaders });
    const rejNotif = customerNotifs2.data.data.find(n => n.title.includes('Rejected'));
    if (!rejNotif) throw new Error('FAIL: Customer did not receive "Return Request Rejected" notification!');
    console.log(`✅ PASS: Customer received rejection notification: "${rejNotif.title}"`);

    // ------------------------------------------------------------------------
    // TEST 6: ADMIN APPROVAL FLOW & REVERSE LOGISTICS (RETURN_PICKUP)
    // ------------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('TEST 6: Admin Approval Flow & Reverse Logistics Dispatch');
    console.log('----------------------------------------------------------------');

    // Since the previous request was REJECTED, create a fresh return request for full progression
    // To do that, we can use the second item or create another delivered order
    await axios.post(`${API_BASE}/cart/items`, { productId: testProduct.id, quantity: 1 }, { headers: customerHeaders });
    const order3Res = await axios.post(`${API_BASE}/orders`, {
      addressId,
      paymentMethod: 'CASH_ON_DELIVERY',
      notes: 'Test Step 9 approval lifecycle order',
    }, { headers: customerHeaders });
    const order3 = order3Res.data.data;
    const item3 = order3.items[0];

    // Mark as delivered
    await prisma.order.update({
      where: { id: order3.id },
      data: { status: 'DELIVERED', deliveredAt: new Date() },
    });

    // Create return request
    const createReturn3 = await axios.post(`${API_BASE}/returns`, {
      orderId: order3.id,
      orderItemId: item3.id,
      quantity: 1,
      reason: 'COMPATIBILITY_ISSUE',
      details: 'Bracket mounting pins do not align with car chassis',
      pickupAddress: 'Customer Residence, Koramangala 4th Block, Bengaluru',
    }, { headers: customerHeaders });
    const return3 = createReturn3.data.data;
    console.log(`   Created new ReturnRequest #${return3.id} for approval workflow`);

    // Approve return request
    const approveRes = await axios.patch(`${API_BASE}/admin/returns/${return3.id}/review`, {
      decision: 'APPROVE',
    }, { headers: adminHeaders });
    const approvedReturn = approveRes.data.data;
    console.log(`   Approved Return status: ${approvedReturn.status}`);

    if (!['APPROVED', 'PICKUP_ASSIGNED'].includes(approvedReturn.status)) {
      throw new Error(`FAIL: Expected status APPROVED or PICKUP_ASSIGNED, got ${approvedReturn.status}`);
    }

    // Verify reverse delivery assignment was created
    const reverseAssignments = await prisma.deliveryAssignment.findMany({
      where: { orderId: order3.id },
    });
    const returnPickupJob = reverseAssignments.find(
      (a) => a.type === 'RETURN_PICKUP' || a.notes?.includes('[RETURN_PICKUP]') || a.notes?.includes(return3.id)
    );
    if (!returnPickupJob) {
      throw new Error('FAIL: Reverse delivery assignment (RETURN_PICKUP) was NOT created upon approval!');
    }
    console.log(`✅ PASS: Reverse delivery assignment created: ID ${returnPickupJob.id}, Type: ${returnPickupJob.type}`);

    // Verify customer received "Return Approved" notification
    const customerNotifs3 = await axios.get(`${API_BASE}/notifications`, { headers: customerHeaders });
    const appNotif = customerNotifs3.data.data.find(n => n.title.includes('Approved') || n.body.includes('approved'));
    if (!appNotif) throw new Error('FAIL: Customer did not receive "Return Approved" notification!');
    console.log(`✅ PASS: Customer received notification: "${appNotif.title}"`);

    // ------------------------------------------------------------------------
    // TEST 7: DELIVERY PARTNER PICKUP & HUB RECEIPT
    // ------------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('TEST 7: Delivery Partner Reverse Logistics Pickup & Hub Dropoff');
    console.log('----------------------------------------------------------------');

    // Toggle rider online
    await axios.put(`${API_BASE}/delivery/duty`, { isOnline: true }, { headers: riderHeaders });

    // Claim / accept the return job as rider
    await axios.post(`${API_BASE}/delivery/jobs/${returnPickupJob.id}/accept`, {}, { headers: riderHeaders });
    console.log('   Rider accepted reverse delivery job');

    // Rider confirms PICKED_UP from customer doorstep
    const pickedUpRes = await axios.put(`${API_BASE}/delivery/jobs/${returnPickupJob.id}/status`, {
      status: 'PICKED_UP',
    }, { headers: riderHeaders });
    console.log('   Rider updated job status to PICKED_UP');

    // Verify ReturnRequest advanced to PICKED_UP
    const returnAfterPickup = await prisma.returnRequest.findUnique({ where: { id: return3.id } });
    if (returnAfterPickup.status !== 'PICKED_UP') {
      throw new Error(`FAIL: Expected ReturnRequest status PICKED_UP, got ${returnAfterPickup.status}`);
    }
    console.log('✅ PASS: ReturnRequest synchronized to PICKED_UP upon rider doorstep pickup.');

    // Rider marks DELIVERED at Central Quality Inspection Hub
    await axios.put(`${API_BASE}/delivery/jobs/${returnPickupJob.id}/status`, {
      status: 'DELIVERED',
    }, { headers: riderHeaders });
    console.log('   Rider dropped package at Central Inspection Hub (status DELIVERED)');

    // Verify ReturnRequest advanced to RECEIVED
    const returnAfterHubDrop = await prisma.returnRequest.findUnique({ where: { id: return3.id } });
    if (returnAfterHubDrop.status !== 'RECEIVED') {
      throw new Error(`FAIL: Expected ReturnRequest status RECEIVED, got ${returnAfterHubDrop.status}`);
    }
    console.log('✅ PASS: ReturnRequest synchronized to RECEIVED at Central Hub.');

    // Verify customer received "Item Received" notification
    const customerNotifs4 = await axios.get(`${API_BASE}/notifications`, { headers: customerHeaders });
    const recNotif = customerNotifs4.data.data.find(n => n.title.includes('Received') || n.body.includes('hub'));
    if (!recNotif) throw new Error('FAIL: Customer did not receive "Item Received" notification!');
    console.log(`✅ PASS: Customer received notification: "${recNotif.title}" — ${recNotif.body}`);

    // ------------------------------------------------------------------------
    // TEST 8: INSPECTION OUTCOME & STOCK MOVEMENT
    // ------------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('TEST 8: Hub Inspection & Stock Movement (Good Stock Restocked)');
    console.log('----------------------------------------------------------------');

    const inventoryBefore = await prisma.inventory.findFirst({
      where: item3.shopId
        ? { productId: testProduct.id, shopId: item3.shopId }
        : { productId: testProduct.id },
    });
    const initialStock = inventoryBefore ? inventoryBefore.quantity : 0;
    console.log(`   Inventory quantity before inspection (Shop: ${item3.shopId || 'default'}): ${initialStock}`);

    // Admin records inspection: PASSED (GOOD / UNOPENED condition)
    const inspectRes = await axios.patch(`${API_BASE}/admin/returns/${return3.id}/inspect`, {
      condition: 'GOOD',
      outcome: 'PASSED',
      notes: 'Unopened manufacturer seal verified by QA specialist',
    }, { headers: adminHeaders });
    const inspectedReturn = inspectRes.data.data;

    if (!['INSPECTION_PASSED', 'REFUND_APPROVED'].includes(inspectedReturn.status)) {
      throw new Error(`FAIL: Expected INSPECTION_PASSED or REFUND_APPROVED, got ${inspectedReturn.status}`);
    }
    console.log(`   Inspection outcome recorded: ${inspectedReturn.status}`);

    // Verify inventory quantity was incremented by 1 (returned quantity)
    const inventoryAfter = await prisma.inventory.findUnique({ where: { id: inventoryBefore.id } });
    if (inventoryAfter && inventoryAfter.quantity !== initialStock + 1) {
      throw new Error(`FAIL: Stock was not incremented! Initial: ${initialStock}, Current: ${inventoryAfter.quantity}`);
    }
    console.log(`✅ PASS: Product inventory restocked from ${initialStock} to ${inventoryAfter?.quantity}`);

    // Verify StockMovement recorded with type RETURN
    const stockMovements = await prisma.stockMovement.findMany({
      where: { type: 'RETURN' },
      orderBy: { createdAt: 'desc' },
    });
    if (stockMovements.length === 0) {
      throw new Error('FAIL: No StockMovement record of type RETURN was found!');
    }
    console.log(`✅ PASS: StockMovement record logged: ID ${stockMovements[0].id}, Type: ${stockMovements[0].type}, Quantity: ${stockMovements[0].quantity}`);

    // ------------------------------------------------------------------------
    // TEST 9: REFUND PROCESSING & PAYMENT METADATA
    // ------------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('TEST 9: Refund Execution & Payment Metadata Synchronization');
    console.log('----------------------------------------------------------------');

    const refundRes = await axios.post(`${API_BASE}/admin/returns/${return3.id}/refund`, {
      notes: 'Refund approved and executed via automated payout gateway',
    }, { headers: adminHeaders });
    const refundData = refundRes.data.data;
    const refundedReturn = refundData.returnRequest || refundData;

    if (refundedReturn.status !== 'REFUNDED') {
      throw new Error(`FAIL: Expected status REFUNDED, got ${refundedReturn.status}`);
    }
    if (!refundedReturn.refundedAt) {
      throw new Error('FAIL: refundedAt timestamp was not recorded!');
    }
    console.log(`✅ PASS: ReturnRequest status updated to REFUNDED at ${refundedReturn.refundedAt}`);

    // Verify Payment table record has refund metadata
    const orderPayment = await prisma.payment.findUnique({ where: { orderId: order3.id } });
    if (orderPayment) {
      console.log('   Payment record verified:', {
        id: orderPayment.id,
        status: orderPayment.status,
        refundAmount: orderPayment.refundAmount,
        refundedAt: orderPayment.refundedAt,
      });
      if (Number(orderPayment.refundAmount) !== Number(refundedReturn.refundAmount)) {
        throw new Error(`FAIL: Payment refundAmount ₹${orderPayment.refundAmount} does not match return refundAmount ₹${refundedReturn.refundAmount}`);
      }
      console.log('✅ PASS: Legitimate backend payment refund record synchronized in database.');
    }

    // Verify customer received "Refund Completed" notification
    const customerNotifs5 = await axios.get(`${API_BASE}/notifications`, { headers: customerHeaders });
    const refNotif = customerNotifs5.data.data.find(n => n.title.includes('Completed') || n.title.includes('Processed') || n.body.includes('refund'));
    if (!refNotif) throw new Error('FAIL: Customer did not receive refund notification!');
    console.log(`✅ PASS: Customer received refund notification: "${refNotif.title}" — ${refNotif.body}`);

    // ------------------------------------------------------------------------
    // TEST 10: DIRECT POSTGRESQL VERIFICATION
    // ------------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('TEST 10: PostgreSQL Direct Record Audit');
    console.log('----------------------------------------------------------------');

    const dbReturn = await prisma.returnRequest.findUnique({
      where: { id: return3.id },
      include: {
        order: true,
        orderItem: true,
        user: true,
      },
    });

    console.log('   PostgreSQL ReturnRequest record audit:', {
      id: dbReturn.id,
      orderNumber: dbReturn.order.orderNumber,
      orderItemId: dbReturn.orderItemId,
      customer: `${dbReturn.user.firstName} ${dbReturn.user.lastName}`,
      quantity: dbReturn.quantity,
      reason: dbReturn.reason,
      status: dbReturn.status,
      refundAmount: dbReturn.refundAmount,
      requestedAt: dbReturn.requestedAt,
      approvedAt: dbReturn.approvedAt,
      pickupAt: dbReturn.pickupAt || dbReturn.pickedUpAt,
      receivedAt: dbReturn.receivedAt,
      inspectedAt: dbReturn.inspectedAt,
      refundedAt: dbReturn.refundedAt,
    });

    const pickupTimestamp = dbReturn.pickupAt || dbReturn.pickedUpAt;
    if (dbReturn.status !== 'REFUNDED') throw new Error('FAIL: dbReturn status is not REFUNDED!');
    if (!dbReturn.approvedAt || !pickupTimestamp || !dbReturn.receivedAt || !dbReturn.inspectedAt || !dbReturn.refundedAt) {
      throw new Error('FAIL: One or more timestamps were not recorded in PostgreSQL!');
    }

    console.log('\n================================================================');
    console.log('🎉 ALL PARTNEXA STEP 9 RETURN & REFUND TESTS PASSED SUCCESSFULLY!');
    console.log('================================================================\n');
  } catch (error) {
    console.error('\n❌ STEP 9 TEST FAILED:', error.message);
    if (error.response?.data) {
      console.error('   API Error Response:', error.response.data);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runStep9Verification();
