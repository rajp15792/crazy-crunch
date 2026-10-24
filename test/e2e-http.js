import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3001';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runE2E() {
  console.log('🚀 Running Full-Stack HTTP Integration & Customer Journey Tests...\n');

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

  // 1. Health check & Settings
  const health = await request('/api/health');
  assert(health.ok && health.data.status === 'ok', 'Server health check returned HTTP 200 OK');
  assert(health.data.whatsapp === '917507792060', 'Target WhatsApp recipient configured: 917507792060');

  const settings = await request('/api/settings');
  assert(settings.ok && settings.data.success, 'Public settings loaded successfully');
  assert(!settings.data.settings?.ownerPassword, 'Owner password strictly hidden from public settings');
  assert(settings.data.settings?.deliveryCharge === 0, 'Free Delivery default (₹0 delivery charge)');

  // 2. Fetch Catalogue
  const productsRes = await request('/api/products');
  assert(productsRes.ok && Array.isArray(productsRes.data.products), 'Products catalogue loaded successfully');
  const products = productsRes.data.products;
  assert(products.length >= 4, `Catalogue contains ${products.length} products with dual selling units`);

  const milkToast = products.find((p) => p.name === 'Milk Toast') || products[0];
  assert(Boolean(milkToast), 'Milk Toast available in customer catalogue');
  assert(milkToast.priceKg === 120, 'Milk Toast has price per kg ₹120');
  assert(milkToast.pricePacket === 35, 'Milk Toast has price per packet ₹35');

  // 3. Checkout Validation Rejection Tests
  console.log('\n--- Testing Customer Checkout Field Validations ---');
  
  // Test invalid Phone Number
  const invalidPhoneRes = await request('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ id: milkToast.id, unit: 'packet', quantity: 1 }],
      customer: {
        name: 'Test Customer',
        phone: '123',
        address: '123 Station Road'
      }
    })
  });
  assert(invalidPhoneRes.status === 400, 'Rejected order with invalid phone number (< 10 digits)');

  // Test missing Address
  const missingAddrRes = await request('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ id: milkToast.id, unit: 'packet', quantity: 1 }],
      customer: {
        name: 'Test Customer',
        phone: '9876543210',
        address: ''
      }
    })
  });
  assert(missingAddrRes.status === 400, 'Rejected order missing required delivery address');

  // Test empty cart
  const emptyCartRes = await request('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [],
      customer: {
        name: 'Test Customer',
        phone: '9876543210',
        address: '123 Station Road'
      }
    })
  });
  assert(emptyCartRes.status === 400, 'Rejected order with empty items list');

  // 4. Valid Customer Order Placement & WhatsApp Workflow (Section 9)
  console.log('\n--- Testing Valid Customer Order Placement & WhatsApp Workflow ---');
  const initialStock = milkToast.stockPacket;

  const validOrderRes = await request('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ id: milkToast.id, unit: 'packet', quantity: 2, price: milkToast.pricePacket, name: milkToast.name }],
      customer: {
        name: 'Suresh More',
        phone: '9822012345',
        address: 'B-102, Shahu Nagar, Kolhapur',
        area: 'Shahu Nagar',
        city: 'Kolhapur',
        pincode: '416008',
        notes: 'Call before delivery'
      },
      paymentMethod: 'Cash on Delivery'
    })
  });

  assert(validOrderRes.status === 201, 'Order created successfully with HTTP 201 Created');
  const placedOrder = validOrderRes.data.order;
  assert(placedOrder && placedOrder.orderRef.startsWith('CC-'), `Unique order reference generated: ${placedOrder?.orderRef}`);
  assert(placedOrder.grandTotal === milkToast.pricePacket * 2, `Grand total calculated with ₹0 free delivery: ₹${placedOrder.grandTotal}`);
  assert(placedOrder.paymentMethod === 'Cash on Delivery', 'Payment method is Cash on Delivery');

  // Verify WhatsApp URL
  const waUrl = validOrderRes.data.whatsappUrl;
  assert(Boolean(waUrl), 'Server returned prefilled WhatsApp click-to-chat URL');
  assert(waUrl.includes('https://wa.me/917507792060'), 'WhatsApp URL targets recipient +91 7507792060');
  assert(waUrl.includes(encodeURIComponent(placedOrder.orderRef)), 'WhatsApp URL contains encoded Order Reference ID');
  assert(waUrl.includes(encodeURIComponent('Cash on Delivery')), 'WhatsApp URL specifies Cash on Delivery');

  // 5. Testing Owner Login & Protected Management APIs (Section 11 & 12)
  console.log('\n--- Testing Owner Login & Order Management ---');
  const wrongLoginRes = await request('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'Swarup', password: 'WrongPassword' })
  });
  assert(wrongLoginRes.status === 401, 'Rejected incorrect owner credentials with HTTP 401');

  const validLoginRes = await request('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'Swarup', password: 'Swarup@123' })
  });
  assert(validLoginRes.ok && Boolean(validLoginRes.data.token), 'Owner login succeeded with secure session token');
  const adminToken = validLoginRes.data.token;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // Fetch orders as owner
  const adminOrdersRes = await request('/api/admin/orders', { headers: adminHeaders });
  assert(adminOrdersRes.ok && Array.isArray(adminOrdersRes.data.orders), 'Owner successfully retrieved orders list');
  const foundOrder = adminOrdersRes.data.orders.find((o) => o.id === placedOrder.id);
  assert(Boolean(foundOrder), 'Placed order appeared in Owner Dashboard queue');

  // Update order status to Confirmed
  const confirmRes = await request(`/api/admin/orders/${placedOrder.id}/status`, {
    method: 'PUT',
    headers: { ...adminHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Confirmed' })
  });
  assert(confirmRes.ok && confirmRes.data.order.status === 'Confirmed', 'Order status updated to "Confirmed"');

  // Update order status to Delivered
  const deliverRes = await request(`/api/admin/orders/${placedOrder.id}/status`, {
    method: 'PUT',
    headers: { ...adminHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Delivered' })
  });
  assert(deliverRes.ok && deliverRes.data.order.status === 'Delivered', 'Order status updated to "Delivered"');

  // Update order status to Cancelled -> Should restore stock automatically
  const cancelRes = await request(`/api/admin/orders/${placedOrder.id}/status`, {
    method: 'PUT',
    headers: { ...adminHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Cancelled' })
  });
  assert(cancelRes.ok && cancelRes.data.order.status === 'Cancelled', 'Order status updated to "Cancelled"');

  // Verify stock restoration
  const refreshedProds = await request('/api/products');
  const refreshedToast = refreshedProds.data.products.find((p) => p.name === 'Milk Toast') || refreshedProds.data.products[0];
  assert(refreshedToast.stockPacket === initialStock, 'Stock successfully released back upon order cancellation');

  // 6. Testing Photo Upload Endpoint (Section 4)
  console.log('\n--- Testing Product Photo Upload Endpoint ---');
  const samplePhotoContent = Buffer.from('fake-png-binary-stream-crazy-crunch');
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="sample-khari.png"\r\nContent-Type: image/png\r\n\r\n`),
    samplePhotoContent,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ]);

  const uploadRes = await fetch(`${BASE_URL}/api/admin/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body
  });
  const uploadData = await uploadRes.json();
  assert(uploadRes.status === 201 && uploadData.success, 'Product photo uploaded successfully via POST /api/admin/upload');
  assert(uploadData.url.startsWith('/uploads/'), `Uploaded photo URL: ${uploadData.url}`);

  // Clean up temporary photo
  if (uploadData.filename) {
    const uploadedFilePath = path.join(process.cwd(), 'public', 'uploads', uploadData.filename);
    if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
  }

  // 7. Testing Security & Unauthorized Access
  console.log('\n--- Testing Security & Unauthorized Access ---');
  const unauthRes = await request('/api/admin/orders');
  assert(unauthRes.status === 401, 'Unauthorized customer access to /api/admin/orders blocked with HTTP 401');

  const notFoundRes = await request('/api/unmatched-route-xyz');
  assert(notFoundRes.status === 404, 'Unmatched /api/* route returns HTTP 404');

  console.log(`\n========================================`);
  console.log(`E2E HTTP Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runE2E().catch((err) => {
  console.error('E2E test error:', err);
  process.exit(1);
});
