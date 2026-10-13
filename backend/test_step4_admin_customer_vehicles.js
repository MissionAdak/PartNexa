const API_URL = 'http://localhost:5000/api';

async function runStep4Verification() {
  console.log('========================================================');
  console.log('PARTNEXA STEP 4 — ADMIN CUSTOMER GARAGE VEHICLE TEST');
  console.log('========================================================\n');

  // 1. Authenticate Admin
  console.log('Step 1: Authenticating Admin (admin@partsphere.in)...');
  const adminLogin = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@partsphere.in', password: 'Admin@1234' }),
  });
  const adminData = await adminLogin.json();
  if (!adminLogin.ok) throw new Error(`Admin login failed: ${JSON.stringify(adminData)}`);
  const adminToken = adminData.data?.accessToken || adminData.data?.token;
  console.log('✓ Admin authenticated successfully.');

  // 2. Fetch Customers List
  console.log('\nStep 2: Fetching Customers via GET /api/admin/customers...');
  const custRes = await fetch(`${API_URL}/admin/customers`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const custData = await custRes.json();
  if (!custRes.ok) throw new Error(`Failed to list customers: ${JSON.stringify(custData)}`);
  const customers = Array.isArray(custData.data) ? custData.data : [];
  console.log(`✓ Retrieved ${customers.length} customers.`);

  // Find demo customer with 3 vehicles
  const demoCust = customers.find(c => c.email === 'demo@partsphere.in');
  if (!demoCust) throw new Error('Customer demo@partsphere.in not found in admin customers list!');

  console.log(`\nCustomer Found: ${demoCust.fullName} (${demoCust.email})`);
  console.log(`  Vehicle Count: ${demoCust.vehicleCount}`);
  console.log(`  Vehicles returned: ${demoCust.vehicles?.length}`);

  if (!demoCust.vehicles || demoCust.vehicles.length < 3) {
    throw new Error(`Customer expected at least 3 vehicles, got ${demoCust.vehicles?.length}`);
  }

  // 3. Inspect Vehicle DTO structure
  console.log('\nStep 3: Validating Vehicle DTO Structure for each vehicle:');
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  demoCust.vehicles.forEach((v, idx) => {
    console.log(`\n  --- Vehicle [${idx + 1}] ---`);
    console.log(`  Make:               "${v.make}"`);
    console.log(`  Model:              "${v.model}"`);
    console.log(`  Year:               ${v.year}`);
    console.log(`  Variant:            "${v.variant}"`);
    console.log(`  Fuel Type:          "${v.fuelType}"`);
    console.log(`  Vehicle Type:       "${v.vehicleType}"`);
    console.log(`  Registration Plate: "${v.registrationNumber || v.regNumber || 'Not recorded'}"`);
    console.log(`  Nickname:           "${v.nickname || 'None'}"`);
    console.log(`  Is Primary:         ${v.isPrimary ? '⭐ YES' : 'NO'}`);

    // STRICT VALIDATIONS: No UUID leaks in human-readable labels
    if (uuidRegex.test(v.make)) {
      throw new Error(`Vehicle make "${v.make}" contains raw UUID!`);
    }
    if (uuidRegex.test(v.model)) {
      throw new Error(`Vehicle model "${v.model}" contains raw UUID!`);
    }
    if (uuidRegex.test(v.variant)) {
      throw new Error(`Vehicle variant "${v.variant}" contains raw UUID!`);
    }
    if (!v.make || v.make === 'Unknown Make') {
      throw new Error(`Vehicle make is missing or unresolved!`);
    }
    if (!v.model || v.model === 'Unknown Model') {
      throw new Error(`Vehicle model is missing or unresolved!`);
    }

    // Verify simulated Admin UI display string
    const hasNickname = Boolean(v.nickname && v.nickname.trim());
    const makeModel = `${v.make} ${v.model}`;
    const yearVariantFuel = [v.year, v.variant && v.variant !== 'Standard' ? v.variant : null, v.fuelType]
      .filter(Boolean)
      .join(' • ');

    let uiTitle = '';
    let uiSubtitle = '';
    if (hasNickname) {
      uiTitle = `"${v.nickname}"`;
      uiSubtitle = `${makeModel} • ${yearVariantFuel}`;
    } else {
      uiTitle = makeModel;
      uiSubtitle = yearVariantFuel;
    }

    console.log(`  [UI Display Preview]`);
    console.log(`    Title:    ${uiTitle}`);
    console.log(`    Details:  ${uiSubtitle}`);
    console.log(`    Plate:    ${v.registrationNumber || v.regNumber || 'Not recorded'}`);
    console.log(`    Badge:    ${v.isPrimary ? '⭐ PRIMARY' : 'STANDARD'}`);
  });

  // 4. Test Single Customer Detail API
  console.log('\nStep 4: Testing GET /api/admin/customers/:id...');
  const detailRes = await fetch(`${API_URL}/admin/customers/${demoCust.id}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const detailData = await detailRes.json();
  if (!detailRes.ok) throw new Error(`Failed to get customer detail: ${JSON.stringify(detailData)}`);
  const custDetail = detailData.data;
  console.log(`✓ Customer detail returned: ${custDetail.fullName}, Vehicles: ${custDetail.vehicles?.length}`);

  custDetail.vehicles.forEach((v) => {
    if (uuidRegex.test(v.make) || uuidRegex.test(v.model) || uuidRegex.test(v.variant)) {
      throw new Error(`Single customer detail vehicle contains raw UUID!`);
    }
  });

  console.log('\n========================================================');
  console.log('🎉 ALL STEP 4 VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('   No raw UUIDs displayed. Clean make/model/year/variant');
  console.log('   properly formatted for Admin Garage Vehicle Modal.');
  console.log('========================================================');
}

runStep4Verification()
  .catch((err) => {
    console.error('❌ Step 4 Verification Failed:', err);
    process.exit(1);
  });
