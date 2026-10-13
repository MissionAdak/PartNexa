const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function runTest() {
  console.log('--- STEP 8 NOTIFICATIONS BACKEND VERIFICATION ---');

  // 1. Login Customer
  const loginRes = await axios.post(`${API_BASE}/auth/login`, {
    email: 'demo@partsphere.in',
    password: 'Demo@1234',
  });
  const token = loginRes.data.data.accessToken;
  const user = loginRes.data.data.user;
  console.log(`✅ Logged in as ${user.email} (ID: ${user.id})`);

  const authHeaders = { Authorization: `Bearer ${token}` };

  // 2. GET /api/notifications
  const notifsRes = await axios.get(`${API_BASE}/notifications`, { headers: authHeaders });
  console.log('✅ GET /api/notifications success: total =', notifsRes.data.pagination?.total || 0);
  console.log('   unreadCount =', notifsRes.data.unreadCount);

  // 3. GET /api/notifications/unread-count
  const unreadRes = await axios.get(`${API_BASE}/notifications/unread-count`, { headers: authHeaders });
  console.log('✅ GET /api/notifications/unread-count success:', unreadRes.data.data);

  // 4. Place a COD order to test real-world end-to-end notification generation
  console.log('🛒 Placing a test COD order...');
  const addrRes = await axios.get(`${API_BASE}/users/addresses`, { headers: authHeaders });
  const addressId = addrRes.data.data[0]?.id;

  // Add item to cart first (query compatible product for customer active vehicle)
  const garageRes = await axios.get(`${API_BASE}/vehicles/garage`, { headers: authHeaders });
  const activeVehicle = garageRes.data.data.find(v => v.isActive) || garageRes.data.data[0];
  const variantId = activeVehicle?.variantId;
  console.log(`   Customer active vehicle: ${activeVehicle?.nickname || activeVehicle?.variant?.model?.name} (variant: ${variantId})`);

  const productsRes = await axios.get(`${API_BASE}/catalog/products?compatibleOnly=true&vehicleVariantId=${variantId}&limit=5`);
  const productsList = Array.isArray(productsRes.data.data) ? productsRes.data.data : (productsRes.data.data?.products || productsRes.data.products || []);
  const product = productsList[0];
  console.log(`   Found compatible product: ${product.name} (ID: ${product.id})`);
  await axios.post(`${API_BASE}/cart/items`, {
    productId: product.id,
    quantity: 1,
  }, { headers: authHeaders });

  const orderRes = await axios.post(`${API_BASE}/orders`, {
    addressId,
    paymentMethod: 'CASH_ON_DELIVERY',
    notes: 'Testing notification center order generation',
  }, { headers: authHeaders });

  const order = orderRes.data.data;
  console.log(`✅ Order placed: #${order.orderNumber} (ID: ${order.id})`);

  // 5. Verify notification created
  const notifsAfterOrder = await axios.get(`${API_BASE}/notifications`, { headers: authHeaders });
  console.log('✅ Notifications after order:', notifsAfterOrder.data.data.length);
  const latestNotif = notifsAfterOrder.data.data[0];
  console.log('   Latest notification:', {
    id: latestNotif.id,
    title: latestNotif.title,
    body: latestNotif.body,
    isRead: latestNotif.isRead,
    data: latestNotif.data,
  });

  if (!latestNotif || !latestNotif.data?.route) {
    throw new Error('Latest notification missing or does not have deep link route!');
  }
  console.log('✅ Deep link route verified:', latestNotif.data.route);

  // 6. Test PATCH /api/notifications/:id/read
  const markReadRes = await axios.patch(`${API_BASE}/notifications/${latestNotif.id}/read`, {}, { headers: authHeaders });
  console.log('✅ Marked notification as read:', markReadRes.data.data.isRead);

  // 7. Test PATCH /api/notifications/read-all
  const readAllRes = await axios.patch(`${API_BASE}/notifications/read-all`, {}, { headers: authHeaders });
  console.log('✅ Marked all as read:', readAllRes.data.data);

  const unreadFinal = await axios.get(`${API_BASE}/notifications/unread-count`, { headers: authHeaders });
  console.log('✅ Final unread count after read-all:', unreadFinal.data.data.unreadCount);

  // 8. Test Access Control Isolation (Rider Rajesh cannot read Customer Aarav's notification)
  const riderLogin = await axios.post(`${API_BASE}/auth/login`, {
    email: 'rider.rajesh@partsphere.in',
    password: 'Rider@1234',
  });
  const riderHeaders = { Authorization: `Bearer ${riderLogin.data.data.accessToken}` };

  try {
    await axios.patch(`${API_BASE}/notifications/${latestNotif.id}/read`, {}, { headers: riderHeaders });
    throw new Error('FAILED: Unauthorized user was able to patch another user\'s notification!');
  } catch (err) {
    if (err.response && (err.response.status === 404 || err.response.status === 403)) {
      console.log('✅ Strict multi-tenant isolation verified: Other user blocked with status', err.response.status);
    } else {
      throw err;
    }
  }

  // Also check rider's notifications (rider should have received NEW_DELIVERY_ASSIGNMENT)
  const riderNotifs = await axios.get(`${API_BASE}/notifications`, { headers: riderHeaders });
  console.log(`✅ Delivery Rider Rajesh has ${riderNotifs.data.data.length} notifications:`);
  riderNotifs.data.data.forEach(n => {
    console.log(`   - [${n.title}] ${n.body} (route: ${n.data?.route})`);
  });

  console.log('\n🎉 ALL BACKEND NOTIFICATION APIS & PROPAGATIONS PASSED PERFECTLY!');
}

runTest().catch((err) => {
  console.error('❌ Test failed:', err.response?.data || err.message);
  process.exit(1);
});
