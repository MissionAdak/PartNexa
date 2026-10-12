const fs = require('fs');
const path = require('path');

const root = __dirname;
const distDir = path.join(root, 'dist');
const customerDist = path.join(root, 'customer', 'dist');
const adminDist = path.join(root, 'admin', 'dist');
const deliveryDist = path.join(root, 'delivery', 'dist');
const shopDist = path.join(root, 'shop', 'dist');

console.log('Combining frontend builds into frontend/dist...');

// 1. Clean destination
fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

// 2. Copy customer build to dist root
if (fs.existsSync(customerDist)) {
  fs.cpSync(customerDist, distDir, { recursive: true });
  console.log('✓ Copied customer build to dist root');
} else {
  console.error('✗ customer/dist not found!');
  process.exit(1);
}

// 3. Copy admin build to dist/admin
if (fs.existsSync(adminDist)) {
  fs.cpSync(adminDist, path.join(distDir, 'admin'), { recursive: true });
  console.log('✓ Copied admin build to dist/admin');
} else {
  console.error('✗ admin/dist not found!');
  process.exit(1);
}

// 4. Copy delivery build to dist/delivery
if (fs.existsSync(deliveryDist)) {
  fs.cpSync(deliveryDist, path.join(distDir, 'delivery'), { recursive: true });
  console.log('✓ Copied delivery build to dist/delivery');
} else {
  console.error('✗ delivery/dist not found!');
  process.exit(1);
}

// 5. Copy shop build to dist/shop
if (fs.existsSync(shopDist)) {
  fs.cpSync(shopDist, path.join(distDir, 'shop'), { recursive: true });
  console.log('✓ Copied shop build to dist/shop');
} else {
  console.error('✗ shop/dist not found!');
  process.exit(1);
}

console.log('✓ Successfully combined all frontend apps into frontend/dist!');
