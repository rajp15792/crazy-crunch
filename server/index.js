import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Simple Bearer token authentication for admin endpoints
// Supports customizable environment variable or default secure key
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'crazy-crunch-admin-session-secure-2026';

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Owner login required.' });
  }
  const token = authHeader.split(' ')[1];
  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ success: false, error: 'Forbidden: Invalid admin session.' });
  }
  next();
}

// --------------------------------------------------------------------------
// Public API Routes
// --------------------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), app: 'Crazy Crunch' });
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

// Place customer order with server verification
app.post('/api/orders', (req, res) => {
  try {
    const { items, customer, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Your cart is empty.' });
    }

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required customer details (name, phone, and delivery address).'
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

    const order = db.createOrder({
      items,
      customer: { ...customer, phone: cleanPhone.slice(-10) },
      paymentMethod: paymentMethod === 'UPI' ? 'UPI' : 'COD'
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order
    });
  } catch (err) {
    console.error('Order placement error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// --------------------------------------------------------------------------
// Owner / Admin API Routes (Protected)
// --------------------------------------------------------------------------

// Owner Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required.' });
  }

  const isValid = db.verifyOwnerPassword(password);
  if (!isValid || username.trim().toLowerCase() !== 'admin') {
    return res.status(401).json({ success: false, error: 'Invalid owner username or password.' });
  }

  res.json({
    success: true,
    message: 'Welcome back, Owner!',
    token: ADMIN_TOKEN
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
    const { name, category, price, weight, description, stock, image, isPublished, isDemoPrice } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, error: 'Product name and price are required.' });
    }

    const product = db.createProduct({
      name,
      category,
      price,
      weight,
      description,
      stock,
      image,
      isPublished,
      isDemoPrice
    });

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

// Get all orders
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const orders = db.getOrders();
  res.json({ success: true, orders });
});

// Update order status
app.put('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid order status.' });
  }

  const updatedOrder = db.updateOrderStatus(id, status);
  if (!updatedOrder) {
    return res.status(404).json({ success: false, error: 'Order not found.' });
  }

  res.json({ success: true, order: updatedOrder });
});

// Dashboard stats summary
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const products = db.getProducts(true);
  const orders = db.getOrders();

  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  const activeOrders = orders.filter((o) => ['Confirmed', 'Preparing', 'Out for Delivery'].includes(o.status)).length;
  const lowStockProducts = products.filter((p) => p.stock <= 5);

  res.json({
    success: true,
    stats: {
      totalRevenue,
      totalOrders: orders.length,
      activeOrders,
      lowStockCount: lowStockProducts.length,
      lowStockProducts
    }
  });
});

// --------------------------------------------------------------------------
// Static Files & PWA assets
// --------------------------------------------------------------------------

// Serve static public assets (icons, manifest, svgs)
app.use(express.static(PUBLIC_DIR));

// Serve Vite build output if it exists
import fs from 'fs';
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
} else {
  // If dist is not yet built, serve public or helpful fallback
  app.get('*', (req, res) => {
    if (fs.existsSync(path.join(PUBLIC_DIR, 'index.html'))) {
      res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
    } else {
      res.send(`
        <h1>Crazy Crunch API Server</h1>
        <p>The backend is active on port ${PORT}. Run <code>npm run dev</code> or <code>npm run build</code> for the frontend UI.</p>
      `);
    }
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🍟 Crazy Crunch server running at http://localhost:${PORT}`);
});
