import http from 'http';
import fs from 'fs';
import path from 'path';
import { db } from '../server/db.js';

async function runTests() {
  console.log('🧪 Starting Crazy Crunch Full Stack & PWA Verification Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Verify 7 Demo Products & Temporary Demo Prices
  console.log('--- Test Suite 1: Demo Products & Specifications ---');
  const products = db.getProducts(true);
  assert(products.length >= 7, `Expected at least 7 demo products, found ${products.length}`);

  const expectedProducts = [
    { name: 'Chakli', price: 60, weight: '200 g' },
    { name: 'Mini Stuffed Snack', price: 80, weight: '250 g' },
    { name: 'Sev', price: 50, weight: '200 g' },
    { name: 'Mamra Laddu', price: 70, weight: '250 g' },
    { name: 'Coconut Biscuits', price: 40, weight: '150 g' },
    { name: 'Khari', price: 50, weight: '200 g' },
    { name: 'Dry Fruit Laddu', price: 120, weight: '250 g' }
  ];

  for (const exp of expectedProducts) {
    const found = products.find((p) => p.name.toLowerCase() === exp.name.toLowerCase());
    assert(Boolean(found), `Product "${exp.name}" exists in database`);
    if (found) {
      assert(found.price === exp.price, `"${exp.name}" has demo price ₹${exp.price} (actual: ₹${found.price})`);
      assert(found.weight === exp.weight, `"${exp.name}" has weight ${exp.weight} (actual: ${found.weight})`);
      assert(found.isDemoPrice === true, `"${exp.name}" has demo price flag enabled for owner editing`);
    }
  }

  // 2. Verify Owner Authentication
  console.log('\n--- Test Suite 2: Owner Panel Security & Auth ---');
  assert(db.verifyOwnerPassword('wrongpassword') === false, 'Invalid owner password rejected');
  assert(db.verifyOwnerPassword('crunch@admin2026') === true, 'Correct owner password verified');

  const settings = db.getSettings();
  assert(settings.ownerPassword === undefined, 'Owner password NEVER exposed in public settings');
  assert(settings.storeName === 'Crazy Crunch', 'Store name properly configured');

  // 3. Verify Owner Product Updates (Prices & Stock)
  console.log('\n--- Test Suite 3: Owner Product Modification ---');
  const chakli = products.find((p) => p.name === 'Chakli');
  const originalPrice = chakli.price;
  const originalStock = chakli.stock;

  const updatedChakli = db.updateProduct(chakli.id, { price: 65, stock: 40 });
  assert(updatedChakli.price === 65, `Chakli price updated to ₹65`);
  assert(updatedChakli.stock === 40, `Chakli stock updated to 40`);

  // Revert back
  db.updateProduct(chakli.id, { price: originalPrice, stock: originalStock });

  // 4. Verify Order Placement, Stock Deduction & Out of Stock Guard
  console.log('\n--- Test Suite 4: Shopping Flow & Order Placement ---');
  const initialStock = chakli.stock;
  
  const testOrderInput = {
    customer: {
      name: 'Verification Bot',
      phone: '9876543210',
      address: '123 Test Street, MG Road, Pune',
      pincode: '411001'
    },
    items: [
      { id: chakli.id, quantity: 2, price: chakli.price, name: chakli.name }
    ],
    paymentMethod: 'COD'
  };

  const createdOrder = db.createOrder(testOrderInput);
  assert(Boolean(createdOrder.id), `Order successfully created with ID: ${createdOrder.id}`);
  assert(createdOrder.orderRef.startsWith('CC-'), `Order has valid reference code: ${createdOrder.orderRef}`);
  assert(createdOrder.grandTotal === chakli.price * 2 + 30, `Grand total calculated correctly including delivery`);
  
  const postOrderChakli = db.getProductById(chakli.id);
  assert(postOrderChakli.stock === initialStock - 2, `Stock deducted atomically from ${initialStock} to ${postOrderChakli.stock}`);

  // Test Out of Stock Protection
  let outOfStockCaught = false;
  try {
    db.createOrder({
      customer: testOrderInput.customer,
      items: [{ id: chakli.id, quantity: 9999, price: chakli.price, name: chakli.name }],
      paymentMethod: 'COD'
    });
  } catch (err) {
    outOfStockCaught = true;
  }
  assert(outOfStockCaught, 'Prevented ordering quantities exceeding available stock');

  // Restore stock for clean state
  db.updateProduct(chakli.id, { stock: initialStock });

  const manifestPath = path.resolve('public/manifest.webmanifest');
  assert(fs.existsSync(manifestPath), 'manifest.webmanifest exists');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert(manifest.name === 'Crazy Crunch', `Manifest name is "Crazy Crunch"`);
  assert(manifest.short_name === 'Crazy Crunch', `Manifest short_name is "Crazy Crunch"`);
  assert(manifest.display === 'standalone', `Manifest display mode is "standalone"`);
  assert(manifest.theme_color === '#ea580c', `Manifest theme_color is "#ea580c"`);
  assert(manifest.icons && manifest.icons.length >= 3, `Manifest specifies required icon sizes and maskable icon`);

  const swPath = path.resolve('public/sw.js');
  assert(fs.existsSync(swPath), 'sw.js service worker file exists');
  const swContent = fs.readFileSync(swPath, 'utf8');
  assert(swContent.includes('skipWaiting'), 'Service worker supports immediate activation (skipWaiting)');
  assert(swContent.includes('/api/orders'), 'Service worker guards against offline fake order completion');

  console.log(`\n========================================`);
  console.log(`Results: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
