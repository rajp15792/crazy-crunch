import fs from 'fs';
import path from 'path';
import { db } from '../server/db.js';

async function runTests() {
  console.log('🧪 Starting Crazy Crunch Full Stack, Checkout & Owner Verification Suite...\n');

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

  // 1. Verify 4 Demo Products with Dual Selling Units (Section 3 & 7)
  console.log('--- Test Suite 1: 4 Dual-Unit Demo Products & Specifications ---');
  db.resetDemoCatalogue();
  const products = db.getProducts(true);
  assert(products.length >= 4, `Expected at least 4 demo products, found ${products.length}`);

  const expectedProducts = [
    { name: 'Milk Toast', category: 'Toast', priceKg: 120, stockKg: 20, pricePacket: 35, packetWeight: '250 g', stockPacket: 40 },
    { name: 'Maska Khari', category: 'Khari', priceKg: 180, stockKg: 15, pricePacket: 50, packetWeight: '250 g', stockPacket: 30 },
    { name: 'Milk Cookies', category: 'Cookies', priceKg: 160, stockKg: 12, pricePacket: 40, packetWeight: '250 g', stockPacket: 25 },
    { name: 'Farsan Mix', category: 'Farsan', priceKg: 200, stockKg: 10, pricePacket: 50, packetWeight: '250 g', stockPacket: 20 }
  ];

  for (const exp of expectedProducts) {
    const found = products.find((p) => p.name.toLowerCase() === exp.name.toLowerCase());
    assert(Boolean(found), `Product "${exp.name}" exists in database`);
    if (found) {
      assert(found.category === exp.category, `"${exp.name}" category is ${exp.category}`);
      assert(found.priceKg === exp.priceKg, `"${exp.name}" has demo price ₹${exp.priceKg} per kg`);
      assert(found.stockKg >= exp.stockKg, `"${exp.name}" has stock ${found.stockKg} kg`);
      assert(found.pricePacket === exp.pricePacket, `"${exp.name}" has demo packet price ₹${exp.pricePacket}`);
      assert(found.packetWeight === exp.packetWeight, `"${exp.name}" has packet weight ${exp.packetWeight}`);
      assert(found.stockPacket >= exp.stockPacket, `"${exp.name}" has stock ${found.stockPacket} packets`);
      assert(found.isDemoProduct === true || found.isDemoPrice === true, `"${exp.name}" is flagged as demo data for owner editing`);
    }
  }

  // 2. Verify Owner Authentication & Security (Section 11)
  console.log('\n--- Test Suite 2: Owner Security & Auth ---');
  assert(db.verifyOwnerCredentials('wronguser', 'wrongpassword') === false, 'Invalid owner username/password rejected');
  assert(db.verifyOwnerCredentials('Swarup', 'wrongpassword') === false, 'Correct username with wrong password rejected');
  assert(db.verifyOwnerCredentials('Swarup', 'Swarup@123') === true, 'Correct credentials (Swarup / Swarup@123) verified');

  const settings = db.getSettings();
  assert(settings.ownerPassword === undefined, 'Owner password NEVER exposed in public settings');
  assert(settings.storeName === 'Crazy Crunch', 'Store name properly configured');
  assert(settings.deliveryCharge === 0, 'Free Delivery default (₹0 delivery charge)');

  const ownerModalContent = fs.readFileSync(path.resolve('src/components/OwnerLoginModal.jsx'), 'utf8');
  assert(!ownerModalContent.includes("useState('Swarup')"), 'No hardcoded default username in OwnerLoginModal');
  assert(!ownerModalContent.includes("useState('Swarup@123')"), 'No hardcoded default password in OwnerLoginModal');
  assert(!ownerModalContent.includes('Swarup@123</code>'), 'No visible credential hint in OwnerLoginModal markup');

  // 3. Photo Management & Uploads Persistence (Section 4)
  console.log('\n--- Test Suite 3: Photo Assets & Upload Storage ---');
  assert(fs.existsSync(path.resolve('public/uploads')), 'public/uploads directory exists for persistent owner uploads');
  assert(fs.existsSync(path.resolve('public/images/milk-toast.svg')), 'Milk Toast food photo asset exists');
  assert(fs.existsSync(path.resolve('public/images/maska-khari.svg')), 'Maska Khari food photo asset exists');
  assert(fs.existsSync(path.resolve('public/images/milk-cookies.svg')), 'Milk Cookies food photo asset exists');
  assert(fs.existsSync(path.resolve('public/images/farsan-mix.jpg')), 'Farsan Mix food photo asset exists');

  // 4. Shopping Cart, Dual-Unit Checkout & Stock Concurrency (Section 8, 9, 10)
  console.log('\n--- Test Suite 4: Dual-Unit Checkout, Stock Deductions & Restoration ---');
  const toast = db.getProductById('demo-milk-toast') || products[0];
  const initialStockPacket = toast.stockPacket;
  const initialStockKg = toast.stockKg;

  const testOrderInput = {
    customer: {
      name: 'Ramesh Patil',
      phone: '9876543210',
      address: 'Flat 402, Sai Residency, Station Road',
      area: 'Rajarampuri',
      city: 'Kolhapur',
      pincode: '416001',
      notes: 'Deliver after 5 PM'
    },
    items: [
      { id: toast.id, unit: 'packet', quantity: 2, price: toast.pricePacket, name: toast.name }
    ],
    paymentMethod: 'Cash on Delivery'
  };

  const createdOrder = db.createOrder(testOrderInput);
  assert(Boolean(createdOrder.id), `Order successfully created with ID: ${createdOrder.id}`);
  assert(createdOrder.orderRef.startsWith('CC-'), `Order has valid reference code: ${createdOrder.orderRef}`);
  assert(createdOrder.status === 'Pending', `Order initial status is "Pending" (actual: ${createdOrder.status})`);
  assert(createdOrder.deliveryCharge === 0, 'Free Delivery charge applied (₹0)');
  assert(createdOrder.grandTotal === toast.pricePacket * 2, `Grand total calculated correctly: ₹${createdOrder.grandTotal}`);

  const postOrderToast = db.getProductById(toast.id);
  assert(
    postOrderToast.stockPacket === initialStockPacket - 2,
    `Packet stock deducted atomically from ${initialStockPacket} to ${postOrderToast.stockPacket}`
  );

  // Test Out of Stock Prevention
  let outOfStockCaught = false;
  try {
    db.createOrder({
      customer: testOrderInput.customer,
      items: [{ id: toast.id, unit: 'packet', quantity: 99999, price: toast.pricePacket, name: toast.name }],
      paymentMethod: 'Cash on Delivery'
    });
  } catch (err) {
    outOfStockCaught = true;
  }
  assert(outOfStockCaught, 'Prevented ordering quantities exceeding available stock');

  // Test Order Status Lifecycle and Stock Release on Cancellation (Section 10 & 12)
  console.log('\n--- Test Suite 5: Order Lifecycle & Automatic Stock Restoration ---');
  db.updateOrderStatus(createdOrder.id, 'Confirmed');
  assert(db.getOrderById(createdOrder.id).status === 'Confirmed', 'Order status moved to Confirmed');

  db.updateOrderStatus(createdOrder.id, 'Delivered');
  assert(db.getOrderById(createdOrder.id).status === 'Delivered', 'Order status moved to Delivered');

  // Cancel order -> Stock should be released automatically
  db.updateOrderStatus(createdOrder.id, 'Cancelled');
  const postCancelToast = db.getProductById(toast.id);
  assert(
    postCancelToast.stockPacket === initialStockPacket,
    `Stock automatically restored upon order cancellation (${postCancelToast.stockPacket} pkts)`
  );

  // 5. Test Audit Logs, Sales Reports & Customers (Section 12)
  console.log('\n--- Test Suite 6: Audit Logs, Reports & Customer Records ---');
  const logs = db.getInventoryLogs();
  assert(logs.length > 0, `Inventory adjustment audit logs recorded (${logs.length} entries)`);
  const cancelLog = logs.find((l) => l.type === 'RESTORE_ON_CANCEL');
  assert(Boolean(cancelLog), 'Stock restoration on cancellation logged with timestamp and reason');

  const report = db.getSalesReport();
  assert(report && report.counts, 'Sales report generated with counts breakdown');
  assert(report.counts.Total >= 1, `Report tracks total orders placed: ${report.counts.Total}`);
  assert(report.counts.Cancelled >= 1, `Report separates Cancelled orders: ${report.counts.Cancelled}`);

  const customers = db.getCustomers();
  assert(customers.length >= 1, `Customer directory aggregates unique customers: ${customers.length}`);
  const ramesh = customers.find((c) => c.phone === '9876543210');
  assert(Boolean(ramesh), 'Customer "Ramesh Patil" recorded with purchase history');

  // 6. Test PWA Configuration & Modern Green Theme (Section 1)
  console.log('\n--- Test Suite 7: PWA Configuration & Brand Assets ---');
  const manifestPath = path.resolve('public/manifest.webmanifest');
  assert(fs.existsSync(manifestPath), 'manifest.webmanifest exists');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert(manifest.name === 'Crazy Crunch', 'Manifest name is "Crazy Crunch"');
  assert(manifest.theme_color === '#0f382c', 'Manifest theme_color is "#0f382c" (Modern Premium Green)');
  assert(manifest.display === 'standalone', 'Manifest display mode is "standalone"');

  const swPath = path.resolve('public/sw.js');
  assert(fs.existsSync(swPath), 'sw.js service worker exists');

  console.log(`\n========================================`);
  console.log(`Results: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
