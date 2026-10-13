import prisma from '../config/prisma';
import { propagateOrderConfirmed } from '../modules/orders/orderPropagation.service';
import * as ordersService from '../modules/orders/orders.service';
import * as shopsService from '../modules/shops/shops.service';
import * as adminService from '../modules/admin/admin.service';
import { verifyInstallationCompletion } from '../modules/services/installationCompletion.service';
import { DIFMType, DIFMStatus, OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

async function runStep11Test() {
  console.log('====================================================');
  console.log('PARTNEXA STEP 11 — SECURE INSTALLATION CONFIRMATION CODE TEST');
  console.log('====================================================\n');

  try {
    // --- Step 0: Fixtures Setup ---
    console.log('--- Step 0: Resolving Test Customer & Workshops ---');
    let customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
    if (!customer) {
      customer = await prisma.user.create({
        data: {
          email: `cust_${Date.now()}@test.com`,
          name: 'Aarav Customer',
          firstName: 'Aarav',
          lastName: 'Sharma',
          role: 'CUSTOMER',
          phone: '9876543210',
          passwordHash: 'dummy',
        },
      });
    }

    // Workshop A (Authorized installer)
    let shopOwnerA = await prisma.user.findFirst({ where: { email: 'shopowner_a@partnexa.com' } });
    if (!shopOwnerA) {
      shopOwnerA = await prisma.user.create({
        data: {
          email: 'shopowner_a@partnexa.com',
          name: 'Apex Workshop Owner',
          role: 'SHOP',
          passwordHash: 'dummy',
        },
      });
    }

    let shopA = await prisma.shop.findFirst({ where: { ownerId: shopOwnerA.id } });
    if (!shopA) {
      shopA = await prisma.shop.create({
        data: {
          ownerId: shopOwnerA.id,
          name: 'Apex Precision Garage',
          slug: `apex-garage-${Date.now()}`,
          city: 'Bengaluru',
          address: '100 Feet Road, Indiranagar',
          addressLine1: '100 Feet Road',
          state: 'Karnataka',
          pincode: '560038',
          phone: '9845011111',
          isVerified: true,
          isActive: true,
        },
      });
    }

    // Workshop B (Different workshop - for 403 test)
    let shopOwnerB = await prisma.user.findFirst({ where: { email: 'shopowner_b@partnexa.com' } });
    if (!shopOwnerB) {
      shopOwnerB = await prisma.user.create({
        data: {
          email: 'shopowner_b@partnexa.com',
          name: 'Competitor Garage Owner',
          role: 'SHOP',
          passwordHash: 'dummy',
        },
      });
    }

    let shopB = await prisma.shop.findFirst({ where: { ownerId: shopOwnerB.id } });
    if (!shopB) {
      shopB = await prisma.shop.create({
        data: {
          ownerId: shopOwnerB.id,
          name: 'Competitor City Motors',
          slug: `competitor-motors-${Date.now()}`,
          city: 'Bengaluru',
          address: 'Koramangala 4th Block',
          addressLine1: 'Koramangala',
          state: 'Karnataka',
          pincode: '560034',
          phone: '9845022222',
          isVerified: true,
          isActive: true,
        },
      });
    }

    // Delivery Partner (for unauthorized workshop installation completion check)
    let deliveryUser = await prisma.user.findFirst({ where: { email: 'delivery_rider@partnexa.com' } });
    if (!deliveryUser) {
      deliveryUser = await prisma.user.create({
        data: {
          email: 'delivery_rider@partnexa.com',
          name: 'Rider Rajesh',
          role: 'DELIVERY_PARTNER',
          passwordHash: 'dummy',
        },
      });
    }
    let deliveryPartner = await prisma.deliveryPartner.findFirst({ where: { userId: deliveryUser.id } });
    if (!deliveryPartner) {
      deliveryPartner = await prisma.deliveryPartner.create({
        data: {
          userId: deliveryUser.id,
          phone: '9845033333',
          vehicleType: 'BIKE',
          vehicleNumber: 'KA-01-AB-1234',
          isVerified: true,
          isActive: true,
        },
      });
    }

    console.log(`✓ Customer: ${customer.name} (${customer.id})`);
    console.log(`✓ Workshop A: ${shopA.name} (Shop ID: ${shopA.id})`);
    console.log(`✓ Workshop B: ${shopB.name} (Shop ID: ${shopB.id})`);
    console.log(`✓ Delivery Partner: ${deliveryPartner.id}`);

    // --- Step 1: Create Order with DIFM Installation ---
    console.log('\n--- Step 1: Customer Places Order with Workshop Installation (DIFM) ---');
    const orderNumber = `PN-${Date.now().toString().slice(-6)}`;
    const testOrder = await prisma.order.create({
      data: {
        userId: customer.id,
        orderNumber,
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.CAPTURED,
        paymentMethod: PaymentMethod.RAZORPAY,
        subtotal: 3500,
        deliveryFee: 49,
        installationFee: 299,
        total: 3848,
        difmType: DIFMType.SHOP_INSTALLATION,
      },
    });

    // Create DIFMRequest linked to Shop A
    const testDifm = await prisma.difmRequest.create({
      data: {
        orderId: testOrder.id,
        shopId: shopA.id,
        type: DIFMType.SHOP_INSTALLATION,
        status: DIFMStatus.ACCEPTED,
        installationFee: 299,
        preferredDate: new Date(Date.now() + 86400000 * 2),
      },
    });

    // Propagate order entities (creates ShopJob, CommissionLedger, and ServiceBooking)
    await propagateOrderConfirmed(testOrder.id);
    console.log(`✓ Order Created: ${testOrder.orderNumber} (ID: ${testOrder.id})`);
    console.log(`✓ DIFM Request Accepted & Assigned to ${shopA.name}`);

    // --- Step 2: Customer Sees 6-Digit Code; Workshop Does NOT ---
    console.log('\n--- Step 2: Privacy & Code Isolation Verification ---');
    const customerOrderView = await ordersService.getOrderById(customer.id, testOrder.id);
    const confirmationCode = customerOrderView.installationConfirmationCode;

    console.log(`✓ Customer receives confirmation code: "${confirmationCode}"`);
    if (!confirmationCode || !/^\d{6}$/.test(confirmationCode)) {
      throw new Error(`FAIL: Customer confirmation code is invalid: ${confirmationCode}`);
    }

    // Workshop A queries calendar / jobs
    const workshopJobs = await shopsService.getServiceCalendar(shopOwnerA.id, {});
    const thisJob = workshopJobs.find((j: any) => j.orderId === testOrder.id);
    if (!thisJob) {
      throw new Error('FAIL: Job not visible in Workshop A calendar!');
    }

    console.log(`✓ Workshop sees Job #${thisJob.id} for ${thisJob.customerName}`);
    console.log(`✓ Checking Workshop API privacy: completionCode = ${thisJob.completionCode || 'undefined (SECURE)'}`);
    if (thisJob.completionCode || thisJob.completionCodeHash) {
      throw new Error('SECURITY VIOLATION: Workshop API leaked the confirmation code beforehand!');
    }

    // --- Step 3: Bypass Prevention Check ---
    console.log('\n--- Step 3: Security Test - Bypass Prevention ---');
    let bypassBlocked = false;
    try {
      await shopsService.updateJobStatus(shopOwnerA.id, thisJob.id, 'COMPLETED');
    } catch (err: any) {
      bypassBlocked = true;
      console.log(`✓ Direct status update to COMPLETED correctly blocked: "${err.message}"`);
    }
    if (!bypassBlocked) {
      throw new Error('FAIL: Workshop was able to mark job COMPLETED without confirmation code!');
    }

    // --- Step 4: Security Test - Wrong Code Rejection ---
    console.log('\n--- Step 4: Security Test - Wrong Code Rejection ---');
    let wrongCodeBlocked = false;
    try {
      await verifyInstallationCompletion({
        jobId: thisJob.id,
        code: '000000',
        user: { id: shopOwnerA.id, role: 'SHOP_OWNER' },
      });
    } catch (err: any) {
      wrongCodeBlocked = true;
      console.log(`✓ Wrong code rejected: "${err.message}"`);
    }
    if (!wrongCodeBlocked) {
      throw new Error('FAIL: Wrong code was accepted!');
    }

    // --- Step 5: Security Test - Different Workshop (403 Forbidden) ---
    console.log('\n--- Step 5: Security Test - Different Workshop Unauthorized (403) ---');
    let differentShopBlocked = false;
    try {
      await verifyInstallationCompletion({
        jobId: thisJob.id,
        code: confirmationCode,
        user: { id: shopOwnerB.id, role: 'SHOP_OWNER' },
      });
    } catch (err: any) {
      differentShopBlocked = true;
      console.log(`✓ Workshop B rejected with 403: "${err.message}"`);
    }
    if (!differentShopBlocked) {
      throw new Error('FAIL: Workshop B was able to verify Shop A job!');
    }

    // --- Step 6: Security Test - Normal Delivery Partner Cannot Complete Workshop Job ---
    console.log('\n--- Step 6: Security Test - Normal Delivery Partner Unauthorized for Workshop Job ---');
    let deliveryRiderBlocked = false;
    try {
      await verifyInstallationCompletion({
        orderId: testOrder.id,
        code: confirmationCode,
        user: { id: deliveryUser.id, role: 'DELIVERY_PARTNER' },
      });
    } catch (err: any) {
      deliveryRiderBlocked = true;
      console.log(`✓ Delivery partner rejected from completing workshop job: "${err.message}"`);
    }
    if (!deliveryRiderBlocked) {
      throw new Error('FAIL: Normal delivery partner completed a workshop installation!');
    }

    // --- Step 7: Authorized Workshop Verifies Correct Code ---
    console.log('\n--- Step 7: Authorized Workshop Submits Correct Code ---');
    const verifyResult = await verifyInstallationCompletion({
      jobId: thisJob.id,
      code: confirmationCode,
      notes: 'All parts installed, torqued, and verified functional. Customer provided code verbally.',
      user: { id: shopOwnerA.id, role: 'SHOP_OWNER' },
    });

    console.log(`✓ Verification Result: ${verifyResult.message}`);
    console.log(`✓ ServiceBooking Completed: ${verifyResult.booking.isCompleted}`);
    console.log(`✓ ShopJob Status: ${verifyResult.job?.status}`);
    console.log(`✓ Commission Release Status: ${verifyResult.commission?.releaseStatus}`);
    console.log(`✓ Commission Released to Payout: ${verifyResult.commission?.isReleased}`);

    if (!verifyResult.booking.isCompleted) {
      throw new Error('FAIL: ServiceBooking isCompleted is not true!');
    }
    if (verifyResult.job?.status !== 'COMPLETED') {
      throw new Error('FAIL: ShopJob status is not COMPLETED!');
    }
    if (verifyResult.commission?.releaseStatus !== 'RELEASED') {
      throw new Error('FAIL: Commission should be RELEASED because payment was CAPTURED!');
    }

    // --- Step 8: Security Test - Code Reuse Rejection ---
    console.log('\n--- Step 8: Security Test - Reuse Code Rejection ---');
    let reuseBlocked = false;
    try {
      await verifyInstallationCompletion({
        jobId: thisJob.id,
        code: confirmationCode,
        user: { id: shopOwnerA.id, role: 'SHOP_OWNER' },
      });
    } catch (err: any) {
      reuseBlocked = true;
      console.log(`✓ Reusing code correctly rejected: "${err.message}"`);
    }
    if (!reuseBlocked) {
      throw new Error('FAIL: Code was successfully reused after completion!');
    }

    // --- Step 9: Customer Sees Completed Status & Code Burned ---
    console.log('\n--- Step 9: Customer View Refresh Verification ---');
    const customerViewAfter = await ordersService.getOrderById(customer.id, testOrder.id);
    console.log(`✓ Customer view installationCompleted = ${customerViewAfter.installationCompleted}`);
    console.log(`✓ Customer view active confirmation code = ${customerViewAfter.installationConfirmationCode || 'null (BURNED/HIDDEN)'}`);

    if (!customerViewAfter.installationCompleted) {
      throw new Error('FAIL: Customer does not see installationCompleted = true!');
    }
    if (customerViewAfter.installationConfirmationCode) {
      throw new Error('FAIL: Code is still returned after completion!');
    }

    // --- Step 10: Admin Sees Completed Status ---
    console.log('\n--- Step 10: Admin View Verification ---');
    const adminOrders = await adminService.listOrders({});
    const adminOrder = adminOrders.find((o: any) => o.id === testOrder.id);
    console.log(`✓ Admin sees installationCompleted = ${adminOrder?.installationCompleted}`);
    console.log(`✓ Admin sees difmStatus = ${adminOrder?.difmStatus}`);

    if (!adminOrder?.installationCompleted || adminOrder.difmStatus !== 'COMPLETED') {
      throw new Error('FAIL: Admin view does not reflect completed status!');
    }

    // --- Step 11: Commission Release State Verification ---
    console.log('\n--- Step 11: Commission Ledger Verification ---');
    const ledger = await prisma.commissionLedger.findFirst({
      where: { orderId: testOrder.id },
    });
    console.log(`✓ Commission Ledger ID: ${ledger?.id}`);
    console.log(`✓ Service Status: ${ledger?.serviceStatus}`);
    console.log(`✓ Payment Status: ${ledger?.paymentStatus}`);
    console.log(`✓ Release Status: ${ledger?.releaseStatus}`);
    console.log(`✓ Payout Amount: ₹${ledger?.shopPayout}`);

    if (ledger?.serviceStatus !== 'COMPLETED' || ledger?.releaseStatus !== 'RELEASED') {
      throw new Error('FAIL: Commission ledger release state did not update correctly!');
    }

    console.log('\n====================================================');
    console.log('✓ STEP 11 INSTALLATION CONFIRMATION CODE TEST PASSED 100%!');
    console.log('====================================================');
  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

runStep11Test();
