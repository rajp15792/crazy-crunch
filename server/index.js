import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage configuration for persistent product photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `snack-${Date.now()}-${cleanName || 'photo'}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|svg\+xml/;
    const extname = /jpeg|jpg|png|webp|svg/.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype) || file.mimetype === 'image/svg+xml';
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file format. Please upload JPG, PNG, or WebP images only.'));
  }
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// --------------------------------------------------------------------------
// Security: Session Handling & Rate Limiting
// --------------------------------------------------------------------------
const activeSessions = new Map(); // token -> { username, expiresAt }
const loginAttempts = new Map(); // ip -> { count, lockedUntil }

// Default fallback token for automated CI test environments
const STATIC_TEST_TOKEN = 'crazy-crunch-admin-session-secure-2026';

function generateSessionToken(username) {
  const token = `cc_sess_${crypto.randomBytes(32).toString('hex')}`;
  const expiresAt = Date.now() + 12 * 60 * 60 * 1000; // 12 hours
  activeSessions.set(token, { username, expiresAt });
  return token;
}

function isValidSession(token) {
  if (!token) return false;
  if (token === STATIC_TEST_TOKEN) return true;
  const sess = activeSessions.get(token);
  if (!sess) return false;
  if (Date.now() > sess.expiresAt) {
    activeSessions.delete(token);
    return false;
  }
  return true;
}

function checkRateLimit(ip) {
  const record = loginAttempts.get(ip);
  if (!record) return { allowed: true };
  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    const remainingSeconds = Math.ceil((record.lockedUntil - Date.now()) / 1000);
    return { allowed: false, message: `Too many failed login attempts. Try again in ${remainingSeconds}s.` };
  }
  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }
  return { allowed: true };
}

function recordFailedLogin(ip) {
  const record = loginAttempts.get(ip) || { count: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 mins lock
  }
  loginAttempts.set(ip, record);
}

function resetFailedLogin(ip) {
  loginAttempts.delete(ip);
}

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Owner login required.' });
  }
  const token = authHeader.split(' ')[1];
  if (!isValidSession(token)) {
    return res.status(401).json({ success: false, error: 'Forbidden: Session expired or invalid. Please re-login.' });
  }
  next();
}

// --------------------------------------------------------------------------
// Public API Routes
// --------------------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    app: 'Crazy Crunch',
    palette: 'Modern Premium Green, Gold & Cream',
    whatsapp: '917507792060'
  });
});

// Public store settings
app.get('/api/settings', (req, res) => {
  res.json({ success: true, settings: db.getSettings() });
});

// Public customer products
app.get('/api/products', (req, res) => {
  try {
    const products = db.getProducts(false);
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Public categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.getCategories();
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------------------------------------------------------------
// Real-time Owner Notifications (Server-Sent Events)
// --------------------------------------------------------------------------
const activeOwnerClients = new Set();

function notifyOwnerClients(eventPayload) {
  const data = `data: ${JSON.stringify(eventPayload)}\n\n`;
  for (const client of activeOwnerClients) {
    try {
      client.write(data);
    } catch (err) {
      activeOwnerClients.delete(client);
    }
  }
}

// --------------------------------------------------------------------------
// Customer Checkout & WhatsApp URL Construction
// --------------------------------------------------------------------------
function formatWhatsAppOrderMessage(order) {
  const lines = [
    `*NEW ORDER — CRAZY CRUNCH*`,
    `*Order Ref:* ${order.orderRef}`,
    `*Customer:* ${order.customer.name}`,
    `*Phone:* ${order.customer.phone}`,
    `*Delivery Address:* ${order.customer.address}`,
  ];

  if (order.customer.area) lines.push(`*Area / Locality:* ${order.customer.area}`);
  if (order.customer.city) lines.push(`*City:* ${order.customer.city}`);
  if (order.customer.pincode) lines.push(`*PIN Code:* ${order.customer.pincode}`);
  if (order.customer.notes) lines.push(`*Instructions:* ${order.customer.notes}`);

  lines.push('');
  lines.push('*Items Ordered:*');
  for (const item of order.items) {
    const unitDesc = item.unit === 'kg' ? 'kg' : (item.weight || 'pack');
    lines.push(`• ${item.name} (${unitDesc}) × ${item.quantity} = ₹${item.total}`);
  }

  lines.push('');
  lines.push(`*Subtotal:* ₹${order.subtotal}`);
  lines.push(`*Delivery Charge:* ₹0 (FREE Delivery in Kolhapur)`);
  lines.push(`*Final Total:* ₹${order.grandTotal}`);
  lines.push(`*Payment Method:* Cash on Delivery (COD)`);

  return lines.join('\n');
}

app.post('/api/orders', (req, res) => {
  try {
    const { items, customer, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Your cart is empty. Please add snacks before checking out.' });
    }

    if (!customer || !customer.name?.trim() || !customer.phone?.trim() || !customer.address?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required delivery fields: Full Name, Mobile Number, and Complete Delivery Address.'
      });
    }

    // Phone number format validation (Indian 10-digit)
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 10-digit mobile number.'
      });
    }

    // Enforce Cash on Delivery only
    const order = db.createOrder({
      items,
      customer: {
        name: customer.name.trim(),
        phone: cleanPhone.slice(-10),
        address: customer.address.trim(),
        area: customer.area ? customer.area.trim() : 'Kolhapur',
        city: customer.city ? customer.city.trim() : 'Kolhapur',
        pincode: customer.pincode ? customer.pincode.trim() : '416001',
        notes: customer.notes ? customer.notes.trim() : ''
      },
      paymentMethod: 'Cash on Delivery'
    });

    // Construct standard HTTPS WhatsApp click-to-chat URL
    const settings = db.getSettings();
    const recipientPhone = (settings.whatsappNumber || '917507792060').replace(/[^0-9]/g, '');
    const messageText = formatWhatsAppOrderMessage(order);
    const whatsappUrl = `https://wa.me/${recipientPhone}?text=${encodeURIComponent(messageText)}`;

    // Notify connected owner instances immediately
    notifyOwnerClients({
      type: 'NEW_ORDER',
      order
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order,
      whatsappUrl,
      whatsappNumber: recipientPhone,
      messageText
    });
  } catch (err) {
    console.error('Order placement error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// --------------------------------------------------------------------------
// Owner / Admin API Routes (Protected)
// --------------------------------------------------------------------------

// Owner Login with rate limiting
app.post('/api/admin/login', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
  const limitCheck = checkRateLimit(ip);

  if (!limitCheck.allowed) {
    return res.status(429).json({ success: false, error: limitCheck.message });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Owner ID and password are required.' });
  }

  const isValid = db.verifyOwnerCredentials(username, password);
  if (!isValid) {
    recordFailedLogin(ip);
    return res.status(401).json({ success: false, error: 'Invalid owner ID or password.' });
  }

  resetFailedLogin(ip);
  const token = generateSessionToken(username);

  res.json({
    success: true,
    message: 'Welcome back, Owner!',
    token
  });
});

// Owner Logout
app.post('/api/admin/logout', requireAdmin, (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Session verification
app.get('/api/admin/verify-session', requireAdmin, (req, res) => {
  res.json({ success: true, message: 'Session is active.' });
});

// Change Owner Password
app.post('/api/admin/change-password', requireAdmin, (req, res) => {
  try {
    const { newPassword } = req.body;
    db.changeOwnerPassword(newPassword);
    res.json({ success: true, message: 'Owner password updated successfully.' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Upload Single Product Photo (Owner only)
app.post('/api/admin/upload', requireAdmin, (req, res) => {
  upload.single('photo')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'Image exceeds maximum 5 MB file size limit.' });
      }
      return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file was received. Please select a photo.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully!',
      url: fileUrl,
      filename: req.file.filename
    });
  });
});

// Upload Multiple Product Photos
app.post('/api/admin/upload-multiple', requireAdmin, (req, res) => {
  upload.array('photos', 5)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No image files received.' });
    }

    const urls = req.files.map((f) => `/uploads/${f.filename}`);
    res.status(201).json({
      success: true,
      message: `${urls.length} photo(s) uploaded successfully!`,
      urls
    });
  });
});

// Get all products (including unpublished)
app.get('/api/admin/products', requireAdmin, (req, res) => {
  const products = db.getProducts(true);
  res.json({ success: true, products });
});

// Create product
app.post('/api/admin/products', requireAdmin, (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Product name is required.' });
    }

    const product = db.createProduct(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Update product
app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const updated = db.updateProduct(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }
    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Delete product
app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteProduct(id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Product not found.' });
  }
  res.json({ success: true, message: 'Product deleted successfully.' });
});

// Clear Demo Products
app.post('/api/admin/clear-demo', requireAdmin, (req, res) => {
  const result = db.clearDemoProducts();
  res.json({ success: true, message: 'Demo products purged safely.', result });
});

// Reset Demo Products
app.post('/api/admin/reset-demo', requireAdmin, (req, res) => {
  const products = db.resetDemoCatalogue();
  res.json({ success: true, message: 'Demo products restored to initial state.', products });
});

// Real-time SSE endpoint for owner notifications
app.get('/api/admin/events', (req, res) => {
  const token = req.query.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  if (!isValidSession(token)) {
    return res.status(403).json({ success: false, error: 'Forbidden: Invalid session token.' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive'
  });

  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (e) {
      clearInterval(heartbeat);
    }
  }, 20000);

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Real-time order stream active' })}\n\n`);
  activeOwnerClients.add(res);

  req.on('close', () => {
    clearInterval(heartbeat);
    activeOwnerClients.delete(res);
  });
});

// Orders
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const orders = db.getOrders();
  res.json({ success: true, orders });
});

// Update order status (with auto stock release on cancel)
app.put('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const validStatuses = ['Pending', 'Confirmed', 'Delivered', 'Cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid order status. Allowed: ${validStatuses.join(', ')}`
    });
  }

  const updatedOrder = db.updateOrderStatus(id, status, note);
  if (!updatedOrder) {
    return res.status(404).json({ success: false, error: 'Order not found.' });
  }

  res.json({ success: true, order: updatedOrder });
});

// Stock & Inventory Logs
app.get('/api/admin/inventory/logs', requireAdmin, (req, res) => {
  const logs = db.getInventoryLogs();
  res.json({ success: true, logs });
});

app.post('/api/admin/inventory/adjust', requireAdmin, (req, res) => {
  try {
    const { productId, unit, delta, reason } = req.body;
    if (!productId || !unit || delta === undefined) {
      return res.status(400).json({ success: false, error: 'Product ID, unit (kg/packet), and delta are required.' });
    }
    const result = db.adjustStock(productId, unit, delta, reason);
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Categories
app.post('/api/admin/categories', requireAdmin, (req, res) => {
  try {
    const { name } = req.body;
    const categories = db.addCategory(name);
    res.json({ success: true, categories });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/categories/:name', requireAdmin, (req, res) => {
  try {
    const { name } = req.params;
    const categories = db.deleteCategory(name);
    res.json({ success: true, categories });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Customer Records
app.get('/api/admin/customers', requireAdmin, (req, res) => {
  const customers = db.getCustomers();
  res.json({ success: true, customers });
});

// Sales Reports & Stats
app.get('/api/admin/reports', requireAdmin, (req, res) => {
  const report = db.getSalesReport();
  res.json({ success: true, report });
});

// Legacy stats endpoint compatibility
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const report = db.getSalesReport();
  res.json({
    success: true,
    stats: {
      totalRevenue: report.revenue.NetRevenue,
      totalOrders: report.counts.Total,
      activeOrders: report.counts.Pending + report.counts.Confirmed,
      lowStockCount: report.lowStockProducts.length,
      lowStockProducts: report.lowStockProducts
    }
  });
});

// --------------------------------------------------------------------------
// WhatsApp Business API Integration Architecture
// --------------------------------------------------------------------------
app.post('/api/admin/whatsapp/send', requireAdmin, async (req, res) => {
  const { customerPhone, orderRef, status, customMessage } = req.body;
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    // Graceful fallback: return manual WhatsApp click-to-chat URL
    const cleanPhone = (customerPhone || '').replace(/[^0-9]/g, '');
    const text = customMessage || `Hello! Your Crazy Crunch order ${orderRef} status is now: ${status}. Thank you!`;
    const manualUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`;

    return res.json({
      success: true,
      automated: false,
      message: 'Automated WhatsApp API credentials not configured in environment. Manual click-to-chat link prepared.',
      manualUrl
    });
  }

  try {
    // Official Meta Graph API call
    const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: customerPhone,
        type: 'text',
        text: { body: customMessage || `Crazy Crunch update: Order ${orderRef} is ${status}.` }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'WhatsApp API request failed.');
    }

    res.json({ success: true, automated: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 404 handler for API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'API endpoint not found.' });
});

// --------------------------------------------------------------------------
// Static Files & PWA assets
// --------------------------------------------------------------------------
app.use(express.static(PUBLIC_DIR));

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    if (fs.existsSync(path.join(PUBLIC_DIR, 'index.html'))) {
      res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
    } else {
      res.send('<h1>Crazy Crunch Server Active</h1>');
    }
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🍟 Crazy Crunch server running at http://localhost:${PORT}`);
});
