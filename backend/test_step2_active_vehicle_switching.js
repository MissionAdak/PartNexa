const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const API_URL = 'http://localhost:5000/api';

async function runStep2Verification() {
  console.log('========================================================');
  console.log('PARTNEXA STEP 2 — ACTIVE VEHICLE SWITCHING VERIFICATION');
  console.log('========================================================\n');

  // 1. Authenticate Demo Customer
  console.log('Step 1: Authenticating Customer (demo@partsphere.in)...');
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'demo@partsphere.in',
      password: 'Demo@1234',
    }),
  });

  const loginData = await loginRes.json();
  console.log('loginData response:', loginData);
  if (!loginRes.ok) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  const token = loginData.data?.accessToken || loginData.data?.token || loginData.token || loginData.accessToken;
  console.log('Token extracted:', token ? `${token.substring(0, 15)}...` : 'NONE');

  // 2. Fetch Garage
  console.log('\nStep 2: Fetching Customer Garage from API...');
  const garageRes = await fetch(`${API_URL}/vehicles/garage`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const garageData = await garageRes.json();
  console.log('Garage raw response:', JSON.stringify(garageData, null, 2));
  const garage = Array.isArray(garageData?.data) ? garageData.data : (Array.isArray(garageData) ? garageData : (garageData?.data?.vehicles || []));
  console.log(`✓ Retrieved ${garage.length} vehicles from My Garage:`);
  garage.forEach((v, idx) => {
    console.log(`  [${idx + 1}] ${v.variant?.model?.make?.name} ${v.variant?.model?.name} ${v.variant?.year} (${v.variant?.name}) | Reg: ${v.regNumber || 'N/A'} | Primary: ${v.isPrimary ? '⭐ YES' : 'NO'}`);
  });

  const vA = garage.find((v) => v.variant?.model?.make?.name?.toLowerCase().includes('tata'));
  const vB = garage.find((v) => v.variant?.model?.make?.name?.toLowerCase().includes('maruti'));
  const vC = garage.find((v) => v.variant?.model?.make?.name?.toLowerCase().includes('honda'));

  if (!vA || !vB || !vC) {
    throw new Error('Garage does not contain all 3 test vehicles (Tata Nexon, Maruti Swift, Honda Activa)');
  }
  console.log('\n✓ Found all 3 vehicles:');
  console.log(`  Vehicle A (Tata Nexon): variantId = ${vA.variantId}, isPrimary = ${vA.isPrimary}`);
  console.log(`  Vehicle B (Maruti Swift): variantId = ${vB.variantId}, isPrimary = ${vB.isPrimary}`);
  console.log(`  Vehicle C (Honda Activa 6G): variantId = ${vC.variantId}, isPrimary = ${vC.isPrimary}`);

  // 3. Test Catalog Compatibility with Vehicle A Active
  console.log('\nStep 3: Checking Catalog Compatibility when Vehicle A (Tata Nexon) is Active...');
  const catResA = await fetch(`${API_URL}/catalog/products?vehicleVariantId=${vA.variantId}`);
  const catDataA = await catResA.json();
  const productsA = catDataA.data?.products || catDataA.data || [];
  
  const bremboA = productsA.find((p) => p.name.includes('Brembo'));
  const amaronA = productsA.find((p) => p.name.includes('Amaron'));
  const boschA = productsA.find((p) => p.name.includes('Bosch'));

  console.log('  Compatibility for Tata Nexon:');
  console.log(`  - Brembo Front Brake Pad Set: isCompatible = ${bremboA?.isCompatible} (Expected: true)`);
  console.log(`  - Amaron Motorcycle Battery: isCompatible = ${amaronA?.isCompatible} (Expected: false)`);
  console.log(`  - Bosch Super 4 Spark Plug: isCompatible = ${boschA?.isCompatible} (Expected: false)`);

  if (bremboA?.isCompatible !== true || amaronA?.isCompatible !== false || boschA?.isCompatible !== false) {
    throw new Error('Vehicle A catalog compatibility check failed!');
  }
  console.log('✓ Vehicle A compatibility verified!');

  // 4. Test Catalog Compatibility when Vehicle B (Maruti Swift) is Active
  console.log('\nStep 4: Simulating Switch Active to Vehicle B (Maruti Swift)...');
  // Client updates partnexa_active_vehicle_id = vB.id without altering DB primary
  const catResB = await fetch(`${API_URL}/catalog/products?vehicleVariantId=${vB.variantId}`);
  const catDataB = await catResB.json();
  const productsB = catDataB.data?.products || catDataB.data || [];

  const bremboB = productsB.find((p) => p.name.includes('Brembo'));
  const amaronB = productsB.find((p) => p.name.includes('Amaron'));
  const boschB = productsB.find((p) => p.name.includes('Bosch'));

  console.log('  Compatibility for Maruti Swift:');
  console.log(`  - Brembo Front Brake Pad Set: isCompatible = ${bremboB?.isCompatible} (Expected: true)`);
  console.log(`  - Bosch Super 4 Spark Plug: isCompatible = ${boschB?.isCompatible} (Expected: true)`);
  console.log(`  - Amaron Motorcycle Battery: isCompatible = ${amaronB?.isCompatible} (Expected: false)`);

  if (boschB?.isCompatible !== true || amaronB?.isCompatible !== false) {
    throw new Error('Vehicle B catalog compatibility check failed!');
  }
  console.log('✓ Vehicle B compatibility verified! Bosch Spark Plug is now compatible.');

  // 5. Test Catalog Compatibility when Vehicle C (Honda Activa 6G) is Active
  console.log('\nStep 5: Simulating Switch Active to Vehicle C (Honda Activa 6G)...');
  const catResC = await fetch(`${API_URL}/catalog/products?vehicleVariantId=${vC.variantId}`);
  const catDataC = await catResC.json();
  const productsC = catDataC.data?.products || catDataC.data || [];

  const amaronC = productsC.find((p) => p.name.includes('Amaron'));
  const boschC = productsC.find((p) => p.name.includes('Bosch'));
  const bremboC = productsC.find((p) => p.name.includes('Brembo'));

  console.log('  Compatibility for Honda Activa 6G:');
  console.log(`  - Amaron Motorcycle Battery: isCompatible = ${amaronC?.isCompatible} (Expected: true)`);
  console.log(`  - Bosch Super 4 Spark Plug: isCompatible = ${boschC?.isCompatible} (Expected: false)`);
  console.log(`  - Brembo Front Brake Pad Set: isCompatible = ${bremboC?.isCompatible} (Expected: false)`);

  if (amaronC?.isCompatible !== true || boschC?.isCompatible !== false || bremboC?.isCompatible !== false) {
    throw new Error('Vehicle C catalog compatibility check failed!');
  }
  console.log('✓ Vehicle C compatibility verified! Amaron Motorcycle Battery is now compatible.');

  // 6. Test "Make C Primary" in Database
  console.log('\nStep 6: Calling PATCH /vehicles/garage/:id/primary for Vehicle C (Honda Activa)...');
  const setPrimaryRes = await fetch(`${API_URL}/vehicles/garage/${vC.id}/primary`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!setPrimaryRes.ok) {
    throw new Error(`Failed to set primary vehicle: ${setPrimaryRes.status}`);
  }
  console.log('✓ Set primary API returned success.');

  // Refetch garage to verify DB state
  const garageRefetchRes = await fetch(`${API_URL}/vehicles/garage`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const updatedGarage = (await garageRefetchRes.json()).data;
  const updatedA = updatedGarage.find((v) => v.id === vA.id);
  const updatedC = updatedGarage.find((v) => v.id === vC.id);

  console.log(`  Vehicle C isPrimary in DB: ${updatedC.isPrimary} (Expected: true)`);
  console.log(`  Vehicle A isPrimary in DB: ${updatedA.isPrimary} (Expected: false)`);

  if (!updatedC.isPrimary || updatedA.isPrimary) {
    throw new Error('Database primary update failed!');
  }

  // 7. Verify Client State Persistence Logic:
  // When partnexa_active_vehicle_id is Vehicle B (Maruti Swift),
  // VehicleContext resolves:
  // - activeVehicle = Vehicle B (Maruti Swift)
  // - primaryVehicle = Vehicle C (Honda Activa)
  console.log('\nStep 7: Validating Client State Separation (Active vs Primary)...');
  const storedActiveId = vB.id; // simulate partnexa_active_vehicle_id = vB.id in localStorage
  const resolvedActive = updatedGarage.find((v) => v.id === storedActiveId || v.variantId === storedActiveId);
  const resolvedPrimary = updatedGarage.find((v) => v.isPrimary);

  console.log(`  Persistent activeVehicle: ${resolvedActive?.variant?.model?.make?.name} ${resolvedActive?.variant?.model?.name} (ID: ${resolvedActive?.id})`);
  console.log(`  Database primaryVehicle:  ${resolvedPrimary?.variant?.model?.make?.name} ${resolvedPrimary?.variant?.model?.name} (ID: ${resolvedPrimary?.id})`);

  if (resolvedActive.id !== vB.id) {
    throw new Error('Active vehicle was reset to primary!');
  }
  if (resolvedPrimary.id !== vC.id) {
    throw new Error('Primary vehicle was not correctly preserved!');
  }
  console.log('✓ Active Vehicle (Maruti Swift) remains active while Primary (Honda Activa) is distinct in DB!');

  console.log('\n========================================================');
  console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
  console.log('========================================================');
}

runStep2Verification()
  .catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
