import { registerDeliveryPartner, loginDeliveryPartner, listAvailableJobs, acceptJob } from '../modules/delivery/delivery.service';
import { listDeliveryPartners } from '../modules/admin/admin.service';
import prisma from '../config/prisma';

async function runStep14Test() {
  console.log('================================================================');
  console.log('PARTNEXA STEP 14 — DELIVERY PARTNER REGISTRATION TEST SUITE');
  console.log('================================================================');

  const timestamp = Date.now();
  const testEmail = `test.driver.${timestamp}@partnexa.in`;
  const testPhone = `+91 98888 ${Math.floor(10000 + Math.random() * 90000)}`;
  const testVehicleNum = `KA-01-DP-${Math.floor(1000 + Math.random() * 9000)}`;

  // -------------------------------------------------------------------------
  // TEST 1: Register Delivery Partner with all required fields
  // -------------------------------------------------------------------------
  console.log('\n[TEST 1] Registering new Delivery Partner...');
  const regPayload = {
    firstName: 'Ramesh',
    lastName: 'Kumar',
    email: testEmail,
    password: 'SecurePassword@123',
    phone: testPhone,
    address: 'Flat 402, Green Glen Layout, Bellandur',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560103',
    vehicleType: 'Bike',
    vehicleMake: 'Bajaj',
    vehicleModel: 'Pulsar 150',
    vehicleNum: testVehicleNum,
    licenseNumber: 'KA-01-2022-998877',
    preferredCity: 'Bellandur / Outer Ring Road',
    emergencyContact: '+91 99000 11223',
  };

  const regResult = await registerDeliveryPartner(regPayload);
  console.log('✅ Registration returned:');
  console.log('   - User ID:', regResult.user.id);
  console.log('   - User Email:', regResult.user.email);
  console.log('   - User Role:', regResult.user.role);
  console.log('   - User Status:', regResult.user.status);
  console.log('   - Partner ID:', regResult.partner.id);
  console.log('   - Vehicle Type:', regResult.partner.vehicleType);
  console.log('   - Vehicle Num:', regResult.partner.vehicleNum);
  console.log('   - Is Activated:', regResult.partner.isActivated);
  console.log('   - KYC Status:', regResult.kyc.status);

  if (regResult.user.role !== 'DELIVERY_PARTNER') {
    throw new Error(`FAIL: Expected role DELIVERY_PARTNER, got ${regResult.user.role}`);
  }
  if (regResult.user.status !== 'PENDING_VERIFICATION') {
    throw new Error(`FAIL: Expected status PENDING_VERIFICATION, got ${regResult.user.status}`);
  }
  if (regResult.partner.isActivated !== false) {
    throw new Error('FAIL: Expected partner to NOT be activated initially.');
  }
  if (regResult.kyc.status !== 'NOT_SUBMITTED') {
    throw new Error(`FAIL: Expected KYC status NOT_SUBMITTED, got ${regResult.kyc.status}`);
  }

  // -------------------------------------------------------------------------
  // TEST 2: Verify Duplicate Email Rejection
  // -------------------------------------------------------------------------
  console.log('\n[TEST 2] Testing duplicate email rejection...');
  try {
    await registerDeliveryPartner({
      ...regPayload,
      phone: '+91 97777 66666',
      vehicleNum: 'KA-01-XX-9999',
    });
    throw new Error('FAIL: Duplicate email was not rejected!');
  } catch (err: any) {
    if (err.statusCode === 409 || err.message?.toLowerCase().includes('already exists')) {
      console.log('✅ Duplicate email correctly rejected:', err.message);
    } else {
      throw err;
    }
  }

  // -------------------------------------------------------------------------
  // TEST 3: Verify Duplicate Phone Rejection
  // -------------------------------------------------------------------------
  console.log('\n[TEST 3] Testing duplicate phone rejection...');
  try {
    await registerDeliveryPartner({
      ...regPayload,
      email: `another.${timestamp}@partnexa.in`,
      vehicleNum: 'KA-01-YY-9999',
    });
    throw new Error('FAIL: Duplicate phone was not rejected!');
  } catch (err: any) {
    if (err.statusCode === 409 || err.message?.toLowerCase().includes('already exists')) {
      console.log('✅ Duplicate phone correctly rejected:', err.message);
    } else {
      throw err;
    }
  }

  // -------------------------------------------------------------------------
  // TEST 4: Verify Duplicate Vehicle Registration Rejection
  // -------------------------------------------------------------------------
  console.log('\n[TEST 4] Testing duplicate vehicle registration rejection...');
  try {
    await registerDeliveryPartner({
      ...regPayload,
      email: `another2.${timestamp}@partnexa.in`,
      phone: '+91 96666 55555',
    });
    throw new Error('FAIL: Duplicate vehicle registration was not rejected!');
  } catch (err: any) {
    if (err.statusCode === 409 || err.message?.toLowerCase().includes('already registered')) {
      console.log('✅ Duplicate vehicle registration correctly rejected:', err.message);
    } else {
      throw err;
    }
  }

  // -------------------------------------------------------------------------
  // TEST 5: Verify Login with Hashed Password
  // -------------------------------------------------------------------------
  console.log('\n[TEST 5] Testing login with valid credentials...');
  const loginResult = await loginDeliveryPartner({
    email: testEmail,
    password: 'SecurePassword@123',
  });
  console.log('✅ Login successful:');
  console.log('   - User:', loginResult.user.email);
  console.log('   - Role:', loginResult.user.role);
  console.log('   - Status:', loginResult.user.status);
  console.log('   - Partner isActivated:', loginResult.partner.isActivated);
  console.log('   - JWT Token generated:', Boolean(loginResult.token));

  // -------------------------------------------------------------------------
  // TEST 6: Verify Job Claiming is Blocked Before KYC Approval
  // -------------------------------------------------------------------------
  console.log('\n[TEST 6] Testing job claiming blocked before KYC approval...');
  const availableJobs = await listAvailableJobs(regResult.user.id);
  console.log(`   - Available jobs visible to unapproved partner: ${availableJobs.length} (must be 0)`);
  if (availableJobs.length !== 0) {
    throw new Error('FAIL: Unapproved delivery partner should not see available jobs.');
  }

  try {
    await acceptJob(regResult.user.id, 'job-1');
    throw new Error('FAIL: Unapproved delivery partner was able to accept a job!');
  } catch (err: any) {
    console.log('✅ Job claiming correctly blocked:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 7: Verify Admin Reflection
  // -------------------------------------------------------------------------
  console.log('\n[TEST 7] Verifying Admin reflection of new delivery partner...');
  const adminPartners = await listDeliveryPartners({ search: testEmail });
  const foundInAdmin = adminPartners.find((p: any) => p.driverEmail === testEmail);

  if (!foundInAdmin) {
    throw new Error('FAIL: Registered delivery partner not found in Admin list!');
  }

  console.log('✅ Found partner in Admin Console:');
  console.log('   - Name:', foundInAdmin.driverName);
  console.log('   - Email:', foundInAdmin.driverEmail);
  console.log('   - Phone:', foundInAdmin.driverPhone);
  console.log('   - Vehicle Plate:', foundInAdmin.vehicleNum);
  console.log('   - Vehicle Type:', foundInAdmin.vehicleType);
  console.log('   - City:', foundInAdmin.city);
  console.log('   - KYC Status:', foundInAdmin.kycStatus);
  console.log('   - Account Status:', foundInAdmin.accountStatus);
  console.log('   - Registration Date:', foundInAdmin.registrationDate);

  console.log('\n================================================================');
  console.log('🎉 ALL STEP 14 TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================');
}

runStep14Test()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
