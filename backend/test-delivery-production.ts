import prisma from './src/config/prisma';
import { UserRole } from '@prisma/client';

const API_BASE = 'http://localhost:5000/api';

async function runDeliveryPortalTests() {
  console.log('============================================================');
  console.log('🚀 PARTNEXA DELIVERY PORTAL — PRODUCTION VERIFICATION SUITE');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail: string = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName} ${detail ? `(${detail})` : ''}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Step 0: Ensure Admin and Customer users exist for RBAC tests
    // -------------------------------------------------------------
    console.log('--- Step 0: Preparing Test Fixtures (Admin & Customer) ---');
    // Obtain Admin Token via Login (official seed)
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@partsphere.in', password: 'Admin@1234' }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.data?.tokens?.accessToken || adminLoginData.data?.accessToken;
    const adminUser = adminLoginData.data?.user;
    assert(Boolean(adminToken), 'Admin login successful and returned accessToken', `User: ${adminUser?.email}`);

    // Obtain Customer Token via Login (official seed)
    const custLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@partsphere.in', password: 'Demo@1234' }),
    });
    const custLoginData = await custLoginRes.json();
    const customerToken = custLoginData.data?.tokens?.accessToken || custLoginData.data?.accessToken;
    const customerUser = custLoginData.data?.user;
    assert(Boolean(customerToken), 'Customer login successful and returned accessToken', `User: ${customerUser?.email}`);

    // -------------------------------------------------------------
    // Step 1: RBAC Enforcement — Customer Token blocked from Delivery endpoints
    // -------------------------------------------------------------
    console.log('\n--- Step 1: RBAC Enforcement Check ---');
    const rbacRes = await fetch(`${API_BASE}/delivery/profile`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(rbacRes.status === 403, 'Customer token blocked from /delivery/profile with 403 Forbidden', `HTTP ${rbacRes.status}`);

    const rbacDashboardRes = await fetch(`${API_BASE}/delivery/dashboard`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(rbacDashboardRes.status === 403, 'Customer token blocked from /delivery/dashboard with 403 Forbidden', `HTTP ${rbacDashboardRes.status}`);

    // -------------------------------------------------------------
    // Step 2: Delivery Partner Registration & Login
    // -------------------------------------------------------------
    console.log('\n--- Step 2: Delivery Partner Registration & Authentication ---');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const partnerEmail = `rider.test.${Date.now()}@partnexa.com`;
    const testVehicleNum = `KA-01-EQ-${randomSuffix}`;
    const testLicenseNum = `DL-042020${Date.now().toString().slice(-7)}`;
    const testPhone = `+919${Math.floor(100000000 + Math.random() * 900000000)}`;

    const regRes = await fetch(`${API_BASE}/delivery/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Vikram',
        lastName: 'Rathore',
        email: partnerEmail,
        password: 'RiderSecurePass123!',
        phone: testPhone,
        vehicleType: 'MOTORCYCLE',
        vehicleNum: testVehicleNum,
        licenseNumber: testLicenseNum,
        address: '12th Main Road, Indiranagar',
        city: 'Bengaluru',
        preferredCity: 'Bengaluru',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, 'Delivery partner registered with 201 Created', `HTTP ${regRes.status}`);
    assert(regData.data?.user?.role === 'DELIVERY_PARTNER', 'Registered user has DELIVERY_PARTNER role');
    assert(Boolean(regData.data?.accessToken), 'Registration returned valid accessToken');
    assert(Boolean(regData.data?.refreshToken), 'Registration returned valid refreshToken');

    let partnerToken = regData.data?.accessToken;
    const partnerId = regData.data?.partner?.id;
    const partnerUserId = regData.data?.user?.id;

    // Test Delivery Partner Login endpoint
    const loginRes = await fetch(`${API_BASE}/delivery/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: partnerEmail, password: 'RiderSecurePass123!' }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Delivery partner login with 200 OK', `HTTP ${loginRes.status}`);
    assert(Boolean(loginData.data?.accessToken), 'Login returned valid accessToken');
    assert(Boolean(loginData.data?.refreshToken), 'Login returned valid refreshToken');
    partnerToken = loginData.data?.accessToken;

    // -------------------------------------------------------------
    // Step 3: Duty Gate Before KYC Verification
    // -------------------------------------------------------------
    console.log('\n--- Step 3: Duty Gate Enforcement (Cannot Go Online Before KYC Approval) ---');
    const dutyBeforeKycRes = await fetch(`${API_BASE}/delivery/duty`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({ isOnline: true }),
    });
    assert(dutyBeforeKycRes.status === 400, 'Cannot go online before KYC approval (HTTP 400)', `HTTP ${dutyBeforeKycRes.status}`);

    // -------------------------------------------------------------
    // Step 4: KYC Upload & 5-Document Requirement Validation
    // -------------------------------------------------------------
    console.log('\n--- Step 4: KYC Document Upload & 5-Document Gate ---');
    // Attempt submitting KYC with 0 documents
    const submitEmptyRes = await fetch(`${API_BASE}/delivery/kyc/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({}),
    });
    assert(submitEmptyRes.status === 400, 'Submitting KYC with 0 documents rejected with 400 Bad Request', `HTTP ${submitEmptyRes.status}`);

    // Helper to upload a fake document buffer as multipart/form-data
    const uploadDoc = async (type: string, filename: string, idNum?: string) => {
      const formData = new FormData();
      const fakeFile = new Blob(['%PDF-1.4 Mock PartNexa KYC Document Content'], { type: 'application/pdf' });
      formData.append('file', fakeFile, filename);
      formData.append('documentType', type);
      if (idNum) formData.append('idNumber', idNum);
      formData.append('licenseNumber', testLicenseNum);
      formData.append('vehicleNum', testVehicleNum);

      const res = await fetch(`${API_BASE}/delivery/kyc/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${partnerToken}` },
        body: formData,
      });
      return res;
    };

    console.log('  Uploading document 1: PAN_CARD');
    const doc1 = await uploadDoc('PAN_CARD', 'pan_card.pdf', 'ABCDE1234F');
    assert(doc1.status === 201, 'PAN Card uploaded successfully (HTTP 201)');

    console.log('  Uploading document 2: DRIVING_LICENSE');
    const doc2 = await uploadDoc('DRIVING_LICENSE', 'driving_license.pdf', testLicenseNum);
    assert(doc2.status === 201, 'Driving License uploaded successfully (HTTP 201)');

    console.log('  Uploading document 3: VEHICLE_RC');
    const doc3 = await uploadDoc('VEHICLE_RC', 'vehicle_rc.pdf', 'RC-998877');
    assert(doc3.status === 201, 'Vehicle RC uploaded successfully (HTTP 201)');

    console.log('  Uploading document 4: PROFILE_PHOTO');
    const doc4 = await uploadDoc('PROFILE_PHOTO', 'rider_profile.png');
    assert(doc4.status === 201, 'Profile Photo uploaded successfully (HTTP 201)');

    // Attempt submit with only 4 documents
    const submit4Res = await fetch(`${API_BASE}/delivery/kyc/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({}),
    });
    assert(submit4Res.status === 400, 'Submitting with 4/5 documents rejected (HTTP 400)');

    console.log('  Uploading document 5: VEHICLE_PHOTO');
    const doc5 = await uploadDoc('VEHICLE_PHOTO', 'motorcycle_photo.jpg');
    assert(doc5.status === 201, 'Vehicle Photo uploaded successfully (HTTP 201)');

    // Submit with all 5 required documents
    const submitFullRes = await fetch(`${API_BASE}/delivery/kyc/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({
        licenseNumber: testLicenseNum,
        vehicleNum: testVehicleNum,
      }),
    });
    const submitFullData = await submitFullRes.json();
    assert(submitFullRes.status === 200, 'KYC submission succeeded with all 5 documents (HTTP 200)');
    assert(submitFullData.data?.status === 'PENDING', 'KYC status progressed to PENDING review');

    // Verify documents are locked while in PENDING review
    const lockRes = await uploadDoc('OTHER', 'extra_doc.pdf');
    assert(lockRes.status === 400, 'Uploading documents locked while review is PENDING (HTTP 400)');

    // -------------------------------------------------------------
    // Step 5: Admin Review with Real Admin ID
    // -------------------------------------------------------------
    console.log('\n--- Step 5: Admin Review with Real reviewedBy Admin ID ---');
    const verifyKycRes = await fetch(`${API_BASE}/delivery/kyc/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        userId: partnerUserId,
        status: 'APPROVED',
      }),
    });
    const verifyKycData = await verifyKycRes.json();
    assert(verifyKycRes.status === 200, 'Admin KYC verification endpoint succeeded (HTTP 200)');
    assert(verifyKycData.data?.partner?.verificationStatus === 'APPROVED', 'Partner verificationStatus is APPROVED');
    assert(verifyKycData.data?.kyc?.reviewedBy === adminUser.id, 'KYC reviewedBy correctly stored the real Admin ID');

    // -------------------------------------------------------------
    // Step 6: Duty Toggle After Approval
    // -------------------------------------------------------------
    console.log('\n--- Step 6: Online Duty Toggle After Approval ---');
    const onlineRes = await fetch(`${API_BASE}/delivery/duty`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({ isOnline: true }),
    });
    const onlineData = await onlineRes.json();
    assert(onlineRes.status === 200, 'Partner can now go ONLINE successfully (HTTP 200)');
    assert(onlineData.data?.isOnline === true, 'Partner isOnline is TRUE');

    // -------------------------------------------------------------
    // Step 7: Delivery Job Creation, Claiming & State Machine Progression
    // -------------------------------------------------------------
    console.log('\n--- Step 7: Job Creation, Claiming & State Machine Lifecycle ---');
    // Test that delivery partner cannot directly create a job
    const partnerJobCreateRes = await fetch(`${API_BASE}/delivery/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({ status: 'ASSIGNED' }),
    });
    assert(partnerJobCreateRes.status === 403, 'Direct manual job creation restricted from non-admin (HTTP 403)');

    // Admin creates COD delivery assignment linked to seeded COD order ord-seed-104 (total: 1940)
    const createJobRes = await fetch(`${API_BASE}/delivery/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        orderId: 'ord-seed-104',
        status: 'ASSIGNED',
        type: 'CUSTOMER_DELIVERY',
        deliveryFee: 120,
        distanceKm: 4.8,
        pickupLocation: {
          name: 'PartNexa Central Hub',
          address: 'Warehouse #4, Electronic City Phase 1, Bengaluru',
          phone: '+919876543210',
          contactPerson: 'Hub Dispatcher',
        },
        dropLocation: {
          name: 'Customer Residence',
          address: '42, 5th Cross, HSR Layout Sector 2, Bengaluru',
          phone: '+919999900002',
          contactPerson: 'Normal Customer',
        },
      }),
    });
    const createJobData = await createJobRes.json();
    assert(createJobRes.status === 201, 'Admin created delivery assignment via API (HTTP 201)');
    const mockAssignment = createJobData.data;

    // Check available jobs feed
    const availableRes = await fetch(`${API_BASE}/delivery/jobs/available`, {
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    const availableData = await availableRes.json();
    assert(availableRes.status === 200, 'Fetched available delivery jobs list (HTTP 200)');
    const jobExists = (availableData.data || []).some((j: any) => j.id === mockAssignment.id);
    assert(jobExists, 'Newly created assignment appears in available jobs feed');

    // Claim / Accept job
    const acceptRes = await fetch(`${API_BASE}/delivery/jobs/${mockAssignment.id}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    const acceptData = await acceptRes.json();
    assert(acceptRes.status === 200, 'Claimed delivery job successfully (HTTP 200)');
    assert(acceptData.data?.status === 'ACCEPTED', 'Job status updated to ACCEPTED');

    // State machine: Test invalid transition skip (ACCEPTED -> DELIVERED)
    const invalidSkipRes = await fetch(`${API_BASE}/delivery/jobs/${mockAssignment.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({ status: 'DELIVERED' }),
    });
    assert(invalidSkipRes.status === 400, 'State machine blocks invalid skip ACCEPTED -> DELIVERED (HTTP 400)');

    // Progress: ACCEPTED -> PICKED_UP
    const pickupRes = await fetch(`${API_BASE}/delivery/jobs/${mockAssignment.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({ status: 'PICKED_UP' }),
    });
    assert(pickupRes.status === 200, 'Progressed to PICKED_UP (HTTP 200)');

    // Progress: PICKED_UP -> IN_TRANSIT
    const transitRes = await fetch(`${API_BASE}/delivery/jobs/${mockAssignment.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({ status: 'IN_TRANSIT' }),
    });
    assert(transitRes.status === 200, 'Progressed to IN_TRANSIT (HTTP 200)');

    // Progress: IN_TRANSIT -> DELIVERED
    const deliveredRes = await fetch(`${API_BASE}/delivery/jobs/${mockAssignment.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({ status: 'DELIVERED' }),
    });
    assert(deliveredRes.status === 200, 'Progressed to DELIVERED (HTTP 200)');

    // Check delivery count via dashboard
    const dashAfterDeliv = await fetch(`${API_BASE}/delivery/dashboard`, {
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    const dashAfterDelivData = await dashAfterDeliv.json();
    const deliveriesCount = dashAfterDelivData.data?.partner?.totalDeliveries || 0;
    assert(deliveriesCount >= 1, 'Partner totalDeliveries incremented to at least 1', `Count: ${deliveriesCount}`);

    // Idempotency check: Repeat DELIVERED status update
    const repeatDeliveredRes = await fetch(`${API_BASE}/delivery/jobs/${mockAssignment.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({ status: 'DELIVERED' }),
    });
    assert(repeatDeliveredRes.status === 200, 'Repeat DELIVERED update is idempotent (HTTP 200)');
    const dashAfterRepeat = await fetch(`${API_BASE}/delivery/dashboard`, {
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    const dashAfterRepeatData = await dashAfterRepeat.json();
    assert(dashAfterRepeatData.data?.partner?.totalDeliveries === deliveriesCount, 'Idempotency preserved: totalDeliveries NOT multiplied on repeat');

    // -------------------------------------------------------------
    // Step 8: COD Cash Collection & Exact Match Validation
    // -------------------------------------------------------------
    console.log('\n--- Step 8: COD Cash Collection & Amount Verification ---');
    // Try collecting wrong amount (e.g. ₹500 instead of ₹1940)
    const wrongCodRes = await fetch(`${API_BASE}/delivery/jobs/${mockAssignment.id}/cod`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({ amount: 500 }),
    });
    assert(wrongCodRes.status === 400, 'Mismatched COD collection amount rejected (HTTP 400)');

    // Collect exact order total ₹1940
    const correctCodRes = await fetch(`${API_BASE}/delivery/jobs/${mockAssignment.id}/cod`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({ amount: 1940 }),
    });
    const correctCodData = await correctCodRes.json();
    assert(correctCodRes.status === 200, 'Exact COD cash collection accepted (HTTP 200)');
    assert(correctCodData.data?.codStatus === 'COLLECTED', 'Assignment codStatus is COLLECTED');

    // -------------------------------------------------------------
    // Step 9: COD Reconciliation & Deposit Settlement
    // -------------------------------------------------------------
    console.log('\n--- Step 9: COD Reconciliation at Cash Deposit Hub ---');
    const reconcileRes = await fetch(`${API_BASE}/delivery/reconcile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({
        depositAmount: 1940,
        jobIds: [mockAssignment.id],
        depositCenter: 'PartNexa Bengaluru South Cash Center',
        receivingOfficer: 'Officer Ramesh Kumar',
        notes: 'End of day cash handover verified and stamped.',
      }),
    });
    const reconcileData = await reconcileRes.json();
    assert(reconcileRes.status === 200, 'COD cash reconciliation recorded successfully (HTTP 200)');
    assert(reconcileData.data?.depositAmount === 1940, 'Reconciliation recorded deposited amount ₹1940');

    // Verify reconciliation history list
    const reconHistoryRes = await fetch(`${API_BASE}/delivery/reconciliations`, {
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    const reconHistoryData = await reconHistoryRes.json();
    assert(reconHistoryRes.status === 200, 'Fetched COD reconciliation history list (HTTP 200)');
    assert((reconHistoryData.data || []).length >= 1, 'Reconciliation record appears in rider audit history');

    // -------------------------------------------------------------
    // Step 10: Used-Part Doorstep Physical Intake & Chain of Custody
    // -------------------------------------------------------------
    console.log('\n--- Step 10: Used-Part Doorstep Intake & Garage-First Handover ---');
    const createUsedPartJobRes = await fetch(`${API_BASE}/delivery/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        deliveryPartnerId: partnerId,
        status: 'ACCEPTED',
        type: 'USED_PART_PICKUP',
        deliveryFee: 160,
        distanceKm: 8.2,
        pickupLocation: {
          name: 'Aarav Sharma (Seller)',
          address: 'Flat 302, Green Glen Layout, Bellandur, Bengaluru',
          phone: '+919876598765',
          contactPerson: 'Aarav Sharma',
        },
        dropLocation: {
          name: 'Apex Auto Care (Partner Garage Hub)',
          address: 'Plot 18, Koramangala Industrial Area, Bengaluru',
          phone: '+919888877777',
          contactPerson: 'Intake Desk / Master Technician',
        },
      }),
    });
    const createUsedPartJobData = await createUsedPartJobRes.json();
    assert(createUsedPartJobRes.status === 201, 'Admin created used part pickup job (HTTP 201)');
    const usedPartAssignment = createUsedPartJobData.data;

    const verifyUsedPartRes = await fetch(`${API_BASE}/delivery/jobs/${usedPartAssignment.id}/verify-used-part`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({
        conditionGrade: 'A',
        inspectionChecklist: {
          structureIntegrity: true,
          mountingTabsIntact: true,
          partNumberMatches: true,
          connectorPinsNormal: true,
          cleanlinessAcceptable: true,
        },
        photos: ['mock-photo-url-1', 'mock-photo-url-2'],
        result: 'APPROVED',
        notes: 'Component collected in intact visual condition. Chain of custody transferred.',
      }),
    });
    const verifyUsedPartData = await verifyUsedPartRes.json();
    assert(verifyUsedPartRes.status === 200, 'Used part physical intake verified and recorded (HTTP 200)');
    assert(verifyUsedPartData.data?.custodyTransferred === true, 'Custody transferred for partner garage bench testing');
    assert(verifyUsedPartData.data?.destination?.includes('Partner Garage'), 'Destination confirms Partner Garage bench inspection');

    // -------------------------------------------------------------
    // Step 11: Cross-Partner Isolation (Strict Tenant Access Control)
    // -------------------------------------------------------------
    console.log('\n--- Step 11: Cross-Partner Job Isolation ---');
    // Register second delivery partner
    const partner2Email = `rider.isolated.${Date.now()}@partnexa.com`;
    const reg2Res = await fetch(`${API_BASE}/delivery/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Rohit',
        lastName: 'Sharma',
        email: partner2Email,
        password: 'RiderSecurePass123!',
        phone: `+9197${Math.floor(10000000 + Math.random() * 90000000)}`,
        vehicleType: 'MOTORCYCLE',
      }),
    });
    const reg2Data = await reg2Res.json();
    const partner2Token = reg2Data.data?.accessToken;

    // Partner 2 attempts to view Partner 1's claimed job
    const partner2AccessRes = await fetch(`${API_BASE}/delivery/jobs/${usedPartAssignment.id}`, {
      headers: { Authorization: `Bearer ${partner2Token}` },
    });
    assert(partner2AccessRes.status === 403, 'Partner 2 blocked from Partner 1 private job with 403 Forbidden', `HTTP ${partner2AccessRes.status}`);

    console.log('\n============================================================');
    console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('============================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error('Fatal test execution error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runDeliveryPortalTests();
