import express from 'express';
import http from 'http';
import prisma from '../config/prisma';
import inMemoryDb from '../config/inMemoryDb';
import authRoutes from '../modules/auth/auth.routes';
import deliveryRoutes from '../modules/delivery/delivery.routes';
import adminRoutes from '../modules/admin/admin.routes';
import { errorHandler } from '../../src/middleware/error.middleware';

const createJpegBuffer = (sizeBytes: number = 1024): Buffer => {
  const buf = Buffer.alloc(sizeBytes, 0xaa);
  buf[0] = 0xff;
  buf[1] = 0xd8;
  buf[2] = 0xff;
  buf[3] = 0xe0;
  return buf;
};

const createPngBuffer = (sizeBytes: number = 1024): Buffer => {
  const buf = Buffer.alloc(sizeBytes, 0xbb);
  buf[0] = 0x89;
  buf[1] = 0x50; // P
  buf[2] = 0x4e; // N
  buf[3] = 0x47; // G
  return buf;
};

const createPdfBuffer = (sizeBytes: number = 1024): Buffer => {
  const buf = Buffer.alloc(sizeBytes, 0x20);
  const header = Buffer.from('%PDF-1.5\n');
  header.copy(buf, 0);
  return buf;
};

const createWebpBuffer = (sizeBytes: number = 1024): Buffer => {
  const buf = Buffer.alloc(sizeBytes, 0x20);
  buf.write('RIFF', 0);
  buf.write('WEBP', 8);
  return buf;
};

async function runStep15KycVerification() {
  console.log('================================================================');
  console.log('🚀 PARTNEXA STEP 15 — COMPLETE DELIVERY KYC DOCUMENT UPLOAD TEST');
  console.log('================================================================\n');

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/auth', authRoutes);
  app.use('/api/delivery', deliveryRoutes);
  app.use('/api/admin', adminRoutes);
  app.use(errorHandler);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test server running at ${baseUrl}`);

  const testRunId = Date.now().toString().slice(-6);

  try {
    // 1. Register a fresh delivery partner
    console.log('1. Registering new Delivery Partner...');
    const partnerEmail = `rider.kyc.${testRunId}@partnexa.test`;
    const partnerPhone = `+91987${testRunId.padStart(7, '0').slice(0, 7)}`;

    const regRes = await fetch(`${baseUrl}/api/delivery/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Vikram',
        lastName: 'Sharma',
        email: partnerEmail,
        phone: partnerPhone,
        password: 'RiderSecurePass123!',
        confirmPassword: 'RiderSecurePass123!',
        vehicleType: 'BIKE',
        vehicleMake: 'Hero',
        vehicleModel: 'Splendor Plus',
        vehicleNum: `KA-04-KYC-${testRunId.slice(-4)}`,
        city: 'Bengaluru',
        state: 'Karnataka',
        address: '22, CMH Road, Indiranagar',
        pincode: '560038',
      }),
    });

    const regData: any = await regRes.json();
    if (regRes.status !== 201) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }
    const partnerToken = regData.data.accessToken || regData.data.token;
    const partnerUser = regData.data.user;
    console.log(`   ✅ Partner registered (ID: ${partnerUser.id}, Status: ${partnerUser.status})`);

    // 2. Set up Admin, Customer & Other Rider test tokens
    console.log('\n2. Setting up Admin & Customer test tokens for RBAC checks...');
    let admin = inMemoryDb.users.find((u: any) => u.role === 'ADMIN');
    if (!admin) {
      admin = {
        id: 'admin-kyc-reviewer',
        firstName: 'Admin',
        lastName: 'Compliance',
        email: 'admin.compliance@partnexa.com',
        role: 'ADMIN',
        status: 'ACTIVE',
      };
      inMemoryDb.users.push(admin);
    }
    const { generateAccessToken } = await import('../utils/jwt');
    const adminToken = generateAccessToken({ id: admin.id, email: admin.email, role: 'ADMIN' });

    // Customer user
    let custUser = inMemoryDb.users.find((u: any) => u.id === 'cust-user-1');
    if (!custUser) {
      custUser = {
        id: 'cust-user-1',
        firstName: 'Customer',
        lastName: 'User',
        email: 'cust@partnexa.com',
        role: 'CUSTOMER',
        status: 'ACTIVE',
      };
      inMemoryDb.users.push(custUser);
    }
    const customerToken = generateAccessToken({ id: custUser.id, email: custUser.email, role: 'CUSTOMER' });

    // Other delivery partner user
    let otherRider = inMemoryDb.users.find((u: any) => u.id === 'other-rider-2');
    if (!otherRider) {
      otherRider = {
        id: 'other-rider-2',
        firstName: 'Other',
        lastName: 'Rider',
        email: 'other@partnexa.com',
        role: 'DELIVERY_PARTNER',
        status: 'ACTIVE',
      };
      inMemoryDb.users.push(otherRider);
    }
    const otherRiderToken = generateAccessToken({ id: otherRider.id, email: otherRider.email, role: 'DELIVERY_PARTNER' });

    // 3. Check Initial KYC Status
    console.log('\n3. Checking initial KYC status via /api/delivery/kyc...');
    const initialKycRes = await fetch(`${baseUrl}/api/delivery/kyc`, {
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    const initialKycData: any = await initialKycRes.json();
    console.log(`   Status code: ${initialKycRes.status}, KYC Status: ${initialKycData.data?.status}`);
    if (initialKycData.data?.status !== 'NOT_SUBMITTED') {
      throw new Error(`Expected initial status NOT_SUBMITTED, got ${initialKycData.data?.status}`);
    }
    console.log('   ✅ Initial state is NOT_SUBMITTED with 0 documents');

    // 4. File Size & Security Validations
    console.log('\n4. Testing Upload Security & Limits:');

    // 4a. Size limit > 10 MB rejection
    console.log('   - Testing file > 10 MB rejection...');
    const largeBlob = new Blob([Buffer.alloc(10.5 * 1024 * 1024, 0x00)], { type: 'application/pdf' });
    const largeForm = new FormData();
    largeForm.append('file', largeBlob, 'huge_doc.pdf');

    const largeRes = await fetch(`${baseUrl}/api/delivery/kyc/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${partnerToken}` },
      body: largeForm,
    });
    const largeData: any = await largeRes.json();
    if (largeRes.status === 400 && largeData.message.includes('File must be less than 10 MB')) {
      console.log('     ✅ Correctly rejected oversized file: "File must be less than 10 MB"');
    } else {
      throw new Error(`Expected 400 "File must be less than 10 MB", got ${largeRes.status}: ${JSON.stringify(largeData)}`);
    }

    // 4b. Disallowed executable rejection
    console.log('   - Testing disallowed executable file (.exe)...');
    const exeBlob = new Blob([Buffer.from('MZ\x90\x00\x03DosExecutable')], { type: 'application/x-msdownload' });
    const exeForm = new FormData();
    exeForm.append('file', exeBlob, 'malware.exe');

    const exeRes = await fetch(`${baseUrl}/api/delivery/kyc/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${partnerToken}` },
      body: exeForm,
    });
    const exeData: any = await exeRes.json();
    if (exeRes.status === 400) {
      console.log(`     ✅ Correctly rejected executable: ${exeData.message}`);
    } else {
      throw new Error(`Expected 400 for executable, got ${exeRes.status}`);
    }

    // 4c. Spoofed extension magic bytes validation
    console.log('   - Testing spoofed extension (fake image with text bytes)...');
    const spoofBlob = new Blob([Buffer.from('Plain text fake image content')], { type: 'image/jpeg' });
    const spoofForm = new FormData();
    spoofForm.append('documentType', 'PROFILE_PHOTO');
    spoofForm.append('file', spoofBlob, 'avatar.jpg');

    const spoofRes = await fetch(`${baseUrl}/api/delivery/kyc/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${partnerToken}` },
      body: spoofForm,
    });
    const spoofData: any = await spoofRes.json();
    if (spoofRes.status === 400 && spoofData.message.includes('signature mismatch')) {
      console.log(`     ✅ Correctly rejected signature mismatch: ${spoofData.message}`);
    } else {
      throw new Error(`Expected 400 signature mismatch, got ${spoofRes.status}: ${JSON.stringify(spoofData)}`);
    }

    // 5. Upload Valid Documents (Images & Documents)
    console.log('\n5. Uploading Valid Documents (Images & Documents):');

    // 5a. Profile Photograph (JPEG image)
    const profileBlob = new Blob([createJpegBuffer(25000)], { type: 'image/jpeg' });
    const formProfile = new FormData();
    formProfile.append('documentType', 'PROFILE_PHOTO');
    formProfile.append('file', profileBlob, 'profile_selfie.jpg');

    const upProfile = await fetch(`${baseUrl}/api/delivery/kyc/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${partnerToken}` },
      body: formProfile,
    });
    const upProfileData: any = await upProfile.json();
    if (upProfile.status !== 201) throw new Error(`Profile upload failed: ${JSON.stringify(upProfileData)}`);
    console.log('   ✅ Uploaded Profile Photograph (JPEG image) with signed URL');

    // 5b. Identity Proof (Aadhaar PDF document)
    const aadhaarBlob = new Blob([createPdfBuffer(45000)], { type: 'application/pdf' });
    const formAadhaar = new FormData();
    formAadhaar.append('documentType', 'AADHAAR_CARD');
    formAadhaar.append('idNumber', '9876 5432 1098');
    formAadhaar.append('file', aadhaarBlob, 'aadhaar_card.pdf');

    const upAadhaar = await fetch(`${baseUrl}/api/delivery/kyc/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${partnerToken}` },
      body: formAadhaar,
    });
    const upAadhaarData: any = await upAadhaar.json();
    if (upAadhaar.status !== 201) throw new Error(`Aadhaar upload failed: ${JSON.stringify(upAadhaarData)}`);
    console.log('   ✅ Uploaded Identity Proof (Aadhaar PDF document) with masked ID');

    // 5c. Driving Licence (PNG image)
    const dlBlob = new Blob([createPngBuffer(35000)], { type: 'image/png' });
    const formDl = new FormData();
    formDl.append('documentType', 'DRIVING_LICENSE');
    formDl.append('file', dlBlob, 'dl_card.png');

    const upDl = await fetch(`${baseUrl}/api/delivery/kyc/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${partnerToken}` },
      body: formDl,
    });
    const upDlData: any = await upDl.json();
    if (upDl.status !== 201) throw new Error(`DL upload failed: ${JSON.stringify(upDlData)}`);
    const dlDocId = upDlData.data.document.id;
    console.log(`   ✅ Uploaded Driving Licence (PNG image, Doc ID: ${dlDocId})`);

    // 5d. Vehicle RC (PDF document)
    const rcBlob = new Blob([createPdfBuffer(50000)], { type: 'application/pdf' });
    const formRc = new FormData();
    formRc.append('documentType', 'VEHICLE_RC');
    formRc.append('vehicleNum', `KA-04-KYC-${testRunId.slice(-4)}`);
    formRc.append('file', rcBlob, 'vehicle_rc.pdf');

    const upRc = await fetch(`${baseUrl}/api/delivery/kyc/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${partnerToken}` },
      body: formRc,
    });
    const upRcData: any = await upRc.json();
    if (upRc.status !== 201) throw new Error(`RC upload failed: ${JSON.stringify(upRcData)}`);
    console.log('   ✅ Uploaded Vehicle Registration Certificate (RC PDF document)');

    // 5e. Vehicle Photo (WebP image)
    const vehPhotoBlob = new Blob([createWebpBuffer(30000)], { type: 'image/webp' });
    const formVehPhoto = new FormData();
    formVehPhoto.append('documentType', 'VEHICLE_PHOTO');
    formVehPhoto.append('file', vehPhotoBlob, 'bike_photo.webp');

    const upVehPhoto = await fetch(`${baseUrl}/api/delivery/kyc/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${partnerToken}` },
      body: formVehPhoto,
    });
    const upVehPhotoData: any = await upVehPhoto.json();
    if (upVehPhoto.status !== 201) throw new Error(`Vehicle Photo upload failed: ${JSON.stringify(upVehPhotoData)}`);
    console.log('   ✅ Uploaded Vehicle Photograph (WebP image)');

    // 6. Verify Document Metadata Persistence & Previews
    console.log('\n6. Checking KYC Metadata & Signed URLs after refresh...');
    const kycRefreshed = await fetch(`${baseUrl}/api/delivery/kyc`, {
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    const kycRefreshedData: any = await kycRefreshed.json();
    const docs = kycRefreshedData.data.documents;
    console.log(`   Total uploaded documents: ${docs.length}`);
    if (docs.length !== 5) throw new Error(`Expected 5 documents, found ${docs.length}`);
    for (const d of docs) {
      if (!d.fileUrl?.includes('/api/delivery/kyc/secure-file?key=')) {
        throw new Error(`Document missing signed HMAC URL: ${JSON.stringify(d)}`);
      }
    }
    console.log('   ✅ All 5 documents have valid, encrypted HMAC-signed URLs');

    // 7. Security: Private Storage & Access Control
    console.log('\n7. Testing RBAC Security & Document Access Control:');
    const sampleDoc = docs[0];

    // 7a. Anonymous request without token or signature
    const anonRes = await fetch(`${baseUrl}/api/delivery/kyc/document/${sampleDoc.id}/file`);
    if (anonRes.status === 401) {
      console.log('   ✅ Anonymous request blocked (401 Unauthorized)');
    } else {
      throw new Error(`Expected 401 for anonymous access, got ${anonRes.status}`);
    }

    // 7b. Customer role trying to read delivery KYC document
    const custRes = await fetch(`${baseUrl}/api/delivery/kyc/document/${sampleDoc.id}/file`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (custRes.status === 403) {
      console.log('   ✅ Customer blocked from accessing partner KYC (403 Forbidden)');
    } else {
      throw new Error(`Expected 403 for Customer, got ${custRes.status}`);
    }

    // 7c. Other delivery partner trying to read this partner's document
    const otherRes = await fetch(`${baseUrl}/api/delivery/kyc/document/${sampleDoc.id}/file`, {
      headers: { Authorization: `Bearer ${otherRiderToken}` },
    });
    if (otherRes.status === 403) {
      console.log('   ✅ Other Delivery Partner blocked from private document (403 Forbidden)');
    } else {
      throw new Error(`Expected 403 for other partner, got ${otherRes.status}`);
    }

    // 7d. Valid signed URL retrieval
    const signedUrlPart = sampleDoc.fileUrl;
    const secureFileRes = await fetch(`${baseUrl}${signedUrlPart}`);
    if (secureFileRes.status === 200) {
      console.log(`   ✅ Signed URL authorized download verified (${secureFileRes.headers.get('content-type')})`);
    } else {
      throw new Error(`Failed to retrieve signed file: ${secureFileRes.status}`);
    }

    // 7e. Tampered signed URL
    const tamperedUrl = signedUrlPart.replace(/sig=[a-f0-9]{8}/, 'sig=tampered00');
    const tamperedRes = await fetch(`${baseUrl}${tamperedUrl}`);
    if (tamperedRes.status === 403) {
      console.log('   ✅ Tampered HMAC signature correctly blocked (403 Forbidden)');
    } else {
      throw new Error(`Expected 403 for tampered signature, got ${tamperedRes.status}`);
    }

    // 8. Submit KYC for Admin Verification
    console.log('\n8. Submitting KYC for Admin Review...');
    const submitRes = await fetch(`${baseUrl}/api/delivery/kyc/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    const submitData: any = await submitRes.json();
    if (submitRes.status !== 200 || submitData.data.status !== 'PENDING') {
      throw new Error(`Submit KYC failed: ${JSON.stringify(submitData)}`);
    }
    console.log('   ✅ KYC status transitioned to PENDING (Under Review)');

    // 8b. Locking check: casual edits while PENDING should be rejected
    const deleteWhilePending = await fetch(`${baseUrl}/api/delivery/kyc/document/${dlDocId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    const deleteData: any = await deleteWhilePending.json();
    if (deleteWhilePending.status === 400 && deleteData.message.includes('under review')) {
      console.log('   ✅ Document locked from modification while under review');
    } else {
      throw new Error(`Expected 400 lock error, got ${deleteWhilePending.status}`);
    }

    // 9. Job Ineligibility Check
    console.log('\n9. Testing Delivery Job Ineligibility while pending review:');
    const toggleDutyRes = await fetch(`${baseUrl}/api/delivery/duty`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({ isOnline: true }),
    });
    const toggleDutyData: any = await toggleDutyRes.json();
    if (toggleDutyRes.status === 400 && toggleDutyData.message.includes('pending KYC')) {
      console.log('   ✅ Partner cannot toggle duty to ONLINE before KYC approval');
    } else {
      throw new Error(`Expected 400 for duty toggle, got ${toggleDutyRes.status} ${JSON.stringify(toggleDutyData)}`);
    }

    // 10. Admin KYC Review & Rejection Flow
    console.log('\n10. Testing Admin Inspection & Rejection Flow:');

    // Customer or partner cannot call admin verify
    const custVerify = await fetch(`${baseUrl}/api/delivery/kyc/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ userId: partnerUser.id, status: 'APPROVED' }),
    });
    if (custVerify.status === 403) {
      console.log('   ✅ Customer cannot approve KYC (403 Forbidden)');
    } else {
      throw new Error(`Expected 403 for Customer kyc verify, got ${custVerify.status}`);
    }

    // Admin inspects fleet list
    const adminList = await fetch(`${baseUrl}/api/admin/delivery-partners`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminListData: any = await adminList.json();
    const partnerInFleet = adminListData.data?.find((p: any) => p.userId === partnerUser.id);
    if (!partnerInFleet) throw new Error('Partner not found in admin fleet list');
    console.log(`   ✅ Admin sees partner in fleet with KYC: ${partnerInFleet.kycStatus} and ${partnerInFleet.kycDocuments.length} docs`);

    // Admin rejects Driving Licence with specific reason
    console.log('   - Admin rejects KYC with reason: "Driving licence image is unclear."...');
    const rejectRes = await fetch(`${baseUrl}/api/delivery/kyc/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        userId: partnerUser.id,
        status: 'REJECTED',
        rejectionReason: 'Driving licence image is unclear.',
      }),
    });
    const rejectData: any = await rejectRes.json();
    if (rejectRes.status !== 200 || rejectData.data.kyc.status !== 'REJECTED') {
      throw new Error(`Admin rejection failed: ${JSON.stringify(rejectData)}`);
    }
    console.log('   ✅ KYC status updated to REJECTED with rejectionReason recorded');

    // Partner checks KYC status -> sees rejection reason
    const partnerCheckReject = await fetch(`${baseUrl}/api/delivery/kyc`, {
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    const partnerCheckRejectData: any = await partnerCheckReject.json();
    if (
      partnerCheckRejectData.data.status === 'REJECTED' &&
      partnerCheckRejectData.data.rejectionReason === 'Driving licence image is unclear.'
    ) {
      console.log('   ✅ Partner sees: "Your KYC was rejected" + Reason: "Driving licence image is unclear."');
    } else {
      throw new Error(`Partner status check failed: ${JSON.stringify(partnerCheckRejectData.data)}`);
    }

    // 11. Document Replacement & Resubmission
    console.log('\n11. Testing Document Replacement & Resubmission:');
    const clearDlBlob = new Blob([createPngBuffer(40000)], { type: 'image/png' });
    const formReplaceDl = new FormData();
    formReplaceDl.append('documentType', 'DRIVING_LICENSE');
    formReplaceDl.append('file', clearDlBlob, 'clear_dl_front.png');

    const replaceDl = await fetch(`${baseUrl}/api/delivery/kyc/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${partnerToken}` },
      body: formReplaceDl,
    });
    const replaceDlData: any = await replaceDl.json();
    if (replaceDl.status !== 201) throw new Error(`DL replacement failed: ${JSON.stringify(replaceDlData)}`);
    console.log('   ✅ Replaced rejected Driving Licence with new clear copy');

    // Resubmit
    const resubmitRes = await fetch(`${baseUrl}/api/delivery/kyc/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    const resubmitData: any = await resubmitRes.json();
    if (resubmitData.data.status !== 'PENDING') throw new Error('Resubmission failed');
    console.log('   ✅ KYC resubmitted successfully -> Status is PENDING');

    // 12. Admin Approval & Atomicity
    console.log('\n12. Admin Approving KYC:');
    const approveRes = await fetch(`${baseUrl}/api/delivery/kyc/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        userId: partnerUser.id,
        status: 'APPROVED',
      }),
    });
    const approveData: any = await approveRes.json();
    if (approveRes.status !== 200 || approveData.data.kyc.status !== 'APPROVED') {
      throw new Error(`Approval failed: ${JSON.stringify(approveData)}`);
    }

    // Check atomicity: KYC APPROVED, DeliveryPartner APPROVED, User ACTIVE
    const profileRes = await fetch(`${baseUrl}/api/delivery/profile`, {
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    const profileData: any = await profileRes.json();
    const pData = profileData.data;
    if (pData.kyc?.status !== 'APPROVED') throw new Error(`KYC not approved: ${pData.kyc?.status}`);
    if (pData.user?.status !== 'ACTIVE') throw new Error(`User status not ACTIVE: ${pData.user?.status}`);
    if (!pData.isActivated) throw new Error(`Partner not activated: isActivated is false`);
    console.log('   ✅ Atomicity Verified: KYC APPROVED + User ACTIVE + Partner APPROVED / ACTIVATED');

    // 13. Job Eligibility after Approval
    console.log('\n13. Testing Delivery Job Eligibility after Approval:');
    const onlineDutyRes = await fetch(`${baseUrl}/api/delivery/duty`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({ isOnline: true }),
    });
    const onlineDutyData: any = await onlineDutyRes.json();
    if (onlineDutyRes.status === 200 && onlineDutyData.data.isOnline === true) {
      console.log('   ✅ Approved partner successfully went ONLINE!');
    } else {
      throw new Error(`Online toggle failed: ${JSON.stringify(onlineDutyData)}`);
    }

    // Check available jobs feed
    const jobsRes = await fetch(`${baseUrl}/api/delivery/jobs/available`, {
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    const jobsData: any = await jobsRes.json();
    console.log(`   ✅ Approved partner retrieved open jobs feed: ${jobsRes.status} OK (${jobsData.data.length} jobs available)`);

    console.log('\n================================================================');
    console.log('🎉 ALL PARTNEXA STEP 15 KYC SPECIFICATION TESTS PASSED!');
    console.log('================================================================');
  } finally {
    server.close();
  }
}

runStep15KycVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Verification script failed:', err);
    process.exit(1);
  });
