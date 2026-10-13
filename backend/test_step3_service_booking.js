const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const API_URL = 'http://localhost:5000/api';

async function runStep3Verification() {
  console.log('========================================================');
  console.log('PARTNEXA STEP 3 — DIFM / SERVICE BOOKING FORM TEST');
  console.log('========================================================\n');

  // 1. Authenticate Customer
  console.log('Step 1: Authenticating Customer (demo@partsphere.in)...');
  const custLogin = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@partsphere.in', password: 'Demo@1234' }),
  });
  const custLoginData = await custLogin.json();
  if (!custLogin.ok) throw new Error(`Customer login failed: ${JSON.stringify(custLoginData)}`);
  const custToken = custLoginData.data?.accessToken || custLoginData.data?.token;
  const custUser = custLoginData.data?.user;
  console.log(`✓ Customer logged in: ${custUser.firstName} ${custUser.lastName} (${custUser.email}), Phone: ${custUser.phone}`);

  // 2. Fetch Garage to check active vehicle
  console.log('\nStep 2: Checking Customer Garage for Auto-fill...');
  const garageRes = await fetch(`${API_URL}/vehicles/garage`, {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  const garageData = await garageRes.json();
  const garage = Array.isArray(garageData.data) ? garageData.data : [];
  console.log(`✓ Customer has ${garage.length} saved vehicles in My Garage.`);
  const activeVehicle = garage.find(v => v.isPrimary) || garage[0];
  console.log(`  Auto-fill Vehicle: ${activeVehicle?.variant?.model?.make?.name} ${activeVehicle?.variant?.model?.name} ${activeVehicle?.variant?.year} (Reg: ${activeVehicle?.regNumber})`);

  // 3. Fetch Verified Partner Workshops
  console.log('\nStep 3: Fetching Partner Workshops...');
  const shopsRes = await fetch(`${API_URL}/shops`);
  const shopsData = await shopsRes.json();
  const shops = Array.isArray(shopsData.data) ? shopsData.data : [];
  console.log(`✓ Retrieved ${shops.length} partner workshops.`);
  const targetShop = shops[0];
  console.log(`  Selected Workshop: ${targetShop.name} (ID: ${targetShop.id})`);

  // 4. Test Booking Form Submission (WORKSHOP Mode)
  console.log('\nStep 4: Submitting Standalone Workshop Service Booking...');
  const preferredDateWorkshop = new Date(Date.now() + 86400000 * 2).toISOString(); // 2 days later
  const bookingPayload1 = {
    serviceCode: 'oil',
    serviceName: 'Periodic Maintenance & Oil Change',
    serviceMode: 'WORKSHOP',
    mode: 'WORKSHOP',
    preferredDate: preferredDateWorkshop,
    customerVehicleId: activeVehicle.id,
    vehicleInfo: `${activeVehicle.variant?.model?.make?.name} ${activeVehicle.variant?.model?.name} ${activeVehicle.variant?.year}`,
    vehicleNumber: activeVehicle.regNumber,
    contactName: `${custUser.firstName} ${custUser.lastName}`,
    contactPhone: custUser.phone || '9876543210',
    shopId: targetShop.id,
    quotedLaborPrice: 349,
    notes: 'Please check brake fluid and washer fluid level as well.',
  };

  const bookRes1 = await fetch(`${API_URL}/services/book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${custToken}`,
    },
    body: JSON.stringify(bookingPayload1),
  });
  const bookData1 = await bookRes1.json();
  if (!bookRes1.ok) {
    throw new Error(`Booking 1 failed: ${JSON.stringify(bookData1)}`);
  }
  const appt1 = bookData1.data?.appointment;
  console.log('✓ Booking 1 confirmed successfully!');
  console.log(`  Appointment ID: ${appt1.id}`);
  console.log(`  Status: ${appt1.status}`);
  console.log(`  Quoted Price: ₹${appt1.quotedLaborPrice}`);

  // 5. Test Booking Form Submission (DOORSTEP Mode)
  console.log('\nStep 5: Submitting Standalone Doorstep Service Booking...');
  const preferredDateDoorstep = new Date(Date.now() + 86400000 * 3).toISOString(); // 3 days later
  const bookingPayload2 = {
    serviceCode: 'brakes',
    serviceName: 'Brake Pad & Rotor Replacement',
    serviceMode: 'DOORSTEP',
    mode: 'DOORSTEP',
    preferredDate: preferredDateDoorstep,
    customerVehicleId: activeVehicle.id,
    vehicleInfo: `${activeVehicle.variant?.model?.make?.name} ${activeVehicle.variant?.model?.name}`,
    vehicleNumber: activeVehicle.regNumber,
    contactName: `${custUser.firstName} ${custUser.lastName}`,
    contactPhone: custUser.phone || '9876543210',
    shopId: targetShop.id,
    quotedLaborPrice: 499,
    notes: 'Doorstep service: Parking lot #4B, please call on arrival.',
  };

  const bookRes2 = await fetch(`${API_URL}/services/book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${custToken}`,
    },
    body: JSON.stringify(bookingPayload2),
  });
  const bookData2 = await bookRes2.json();
  if (!bookRes2.ok) {
    throw new Error(`Booking 2 failed: ${JSON.stringify(bookData2)}`);
  }
  const appt2 = bookData2.data?.appointment;
  console.log('✓ Booking 2 confirmed successfully!');
  console.log(`  Appointment ID: ${appt2.id}`);
  console.log(`  Status: ${appt2.status}`);

  // 6. Direct Database Verification in PostgreSQL
  console.log('\nStep 6: Verifying Records in PostgreSQL Database...');
  const dbAppt1 = await prisma.serviceAppointment.findUnique({
    where: { id: appt1.id },
    include: { shop: true, customer: true, customerVehicle: true },
  });
  if (!dbAppt1) throw new Error('Database record for Appointment 1 not found in PostgreSQL!');
  console.log('✓ PostgreSQL record verified for Appointment 1:');
  console.log(`  - DB ID: ${dbAppt1.id}`);
  console.log(`  - Customer ID: ${dbAppt1.customerId} (${dbAppt1.customer.email})`);
  console.log(`  - Vehicle: ${dbAppt1.vehicleInfo} (Number: ${dbAppt1.vehicleNumber})`);
  console.log(`  - Mode: ${dbAppt1.mode}`);
  console.log(`  - Shop: ${dbAppt1.shop?.name}`);
  console.log(`  - Status: ${dbAppt1.status}`);

  const dbAppt2 = await prisma.serviceAppointment.findUnique({
    where: { id: appt2.id },
  });
  if (!dbAppt2) throw new Error('Database record for Appointment 2 not found in PostgreSQL!');
  console.log('✓ PostgreSQL record verified for Appointment 2:');
  console.log(`  - DB ID: ${dbAppt2.id}`);
  console.log(`  - Mode: ${dbAppt2.mode}`);

  // 7. Verify Workshop Portal Calendar Reflection
  console.log('\nStep 7: Verifying Workshop Portal Reflection...');
  const shopOwnerLogin = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'apex.shop@partsphere.in', password: 'Shop@1234' }),
  });
  const shopOwnerData = await shopOwnerLogin.json();
  if (!shopOwnerLogin.ok) throw new Error(`Workshop login failed: ${JSON.stringify(shopOwnerData)}`);
  const shopToken = shopOwnerData.data?.accessToken || shopOwnerData.data?.token;

  const calRes = await fetch(`${API_URL}/shops/portal/calendar`, {
    headers: { Authorization: `Bearer ${shopToken}` },
  });
  const calData = await calRes.json();
  const jobs = Array.isArray(calData.data) ? calData.data : [];
  console.log(`✓ Workshop portal returned ${jobs.length} jobs.`);
  const matchingJob1 = jobs.find(j => j.notes?.includes(appt1.id.substring(0, 8)) || j.customerName?.includes('Aarav'));
  if (!matchingJob1) {
    throw new Error('Workshop portal did not reflect the service booking job!');
  }
  console.log('✓ Workshop portal job verified:');
  console.log(`  - Job ID: ${matchingJob1.id}`);
  console.log(`  - Service: ${matchingJob1.serviceName}`);
  console.log(`  - Customer: ${matchingJob1.customerName} (${matchingJob1.customerPhone})`);
  console.log(`  - Vehicle: ${matchingJob1.vehicleInfo}`);
  console.log(`  - Status: ${matchingJob1.status}`);
  console.log(`  - Type: ${matchingJob1.jobType} (${matchingJob1.locationType})`);

  // 8. Verify Admin Portal Reflection
  console.log('\nStep 8: Verifying Admin Portal Reflection...');
  const adminLogin = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@partsphere.in', password: 'Admin@1234' }),
  });
  const adminData = await adminLogin.json();
  if (!adminLogin.ok) throw new Error(`Admin login failed: ${JSON.stringify(adminData)}`);
  const adminToken = adminData.data?.accessToken || adminData.data?.token;

  const adminApptRes = await fetch(`${API_URL}/services/admin`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminApptData = await adminApptRes.json();
  const adminList = Array.isArray(adminApptData.data) ? adminApptData.data : [];
  console.log(`✓ Admin portal returned ${adminList.length} service appointments.`);
  const foundAdmin1 = adminList.find(a => a.id === appt1.id);
  const foundAdmin2 = adminList.find(a => a.id === appt2.id);
  if (!foundAdmin1 || !foundAdmin2) {
    throw new Error('Admin portal did not contain the booked appointments!');
  }
  console.log('✓ Admin portal confirmed visibility of both appointments.');

  // 9. Verify Customer My Appointments View
  console.log('\nStep 9: Verifying Customer My Appointments View...');
  const myApptRes = await fetch(`${API_URL}/services/my`, {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  const myApptData = await myApptRes.json();
  const myList = Array.isArray(myApptData.data) ? myApptData.data : [];
  console.log(`✓ Customer has ${myList.length} appointments.`);
  const custFound1 = myList.find(a => a.id === appt1.id);
  const custFound2 = myList.find(a => a.id === appt2.id);
  if (!custFound1 || !custFound2) {
    throw new Error('Customer my-appointments endpoint missing booked appointments!');
  }
  console.log('✓ Customer appointments confirmed.');

  console.log('\n========================================================');
  console.log('🎉 ALL STEP 3 VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('========================================================');
}

runStep3Verification()
  .catch((err) => {
    console.error('❌ Step 3 Test Failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
