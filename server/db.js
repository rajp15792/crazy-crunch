import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { initialProducts, initialSettings, initialCategories } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const INVENTORY_LOGS_FILE = path.join(DATA_DIR, 'inventory_logs.json');

// Initialize database directory & seed files
function initDB() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // If products file doesn't exist or is empty, seed it
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(initialProducts, null, 2), 'utf8');
  }

  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf8');
  }

  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(initialSettings, null, 2), 'utf8');
  }

  if (!fs.existsSync(CATEGORIES_FILE)) {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(initialCategories, null, 2), 'utf8');
  }

  if (!fs.existsSync(INVENTORY_LOGS_FILE)) {
    fs.writeFileSync(INVENTORY_LOGS_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

initDB();

// Helper to safely read JSON
function readJSON(filePath, fallback = []) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

// Helper to safely write JSON atomically
function writeJSON(filePath, data) {
  try {
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Password hashing helper (scrypt)
function hashPassword(password, salt = null) {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, generatedSalt, 64).toString('hex');
  return `${generatedSalt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored) return false;
  // If stored in plain text during dev or setup:
  if (!stored.includes(':')) {
    return password === stored;
  }
  const [salt, key] = stored.split(':');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(key, 'hex'));
}

export const db = {
  // -------------------------------------------------------------------------
  // Products Management
  // -------------------------------------------------------------------------
  getProducts(includeUnpublished = false) {
    let products = readJSON(PRODUCTS_FILE, initialProducts);
    
    // Auto-normalize legacy product items to dual-unit model
    let modified = false;
    products = products.map((p, idx) => {
      let needsFix = false;
      const updated = { ...p };
      
      if (updated.priceKg === undefined) {
        updated.priceKg = updated.price ? Number(updated.price) * 2 : 120;
        needsFix = true;
      }
      if (updated.stockKg === undefined) {
        updated.stockKg = updated.stock ? Math.floor(updated.stock / 2) : 10;
        needsFix = true;
      }
      if (updated.pricePacket === undefined) {
        updated.pricePacket = updated.price !== undefined ? Number(updated.price) : 50;
        needsFix = true;
      }
      if (updated.packetWeight === undefined) {
        updated.packetWeight = updated.weight || '250 g';
        needsFix = true;
      }
      if (updated.stockPacket === undefined) {
        updated.stockPacket = updated.stock !== undefined ? Number(updated.stock) : 20;
        needsFix = true;
      }
      if (!Array.isArray(updated.gallery)) {
        updated.gallery = updated.image ? [updated.image] : ['/icons/logo.svg'];
        needsFix = true;
      }
      if (updated.displayOrder === undefined) {
        updated.displayOrder = idx + 1;
        needsFix = true;
      }

      if (needsFix) modified = true;
      return updated;
    });

    if (modified) {
      writeJSON(PRODUCTS_FILE, products);
    }

    // Sort by displayOrder ascending
    products.sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));

    if (includeUnpublished) return products;
    return products.filter((p) => p.isPublished !== false);
  },

  getProductById(id) {
    const products = this.getProducts(true);
    return products.find((p) => p.id === id);
  },

  createProduct(productData) {
    const products = this.getProducts(true);
    const newProduct = {
      id: `prod-${Date.now()}`,
      name: (productData.name || 'New Snack').trim(),
      category: productData.category || 'Other Products',
      description: productData.description ? productData.description.trim() : '',
      image: productData.image || '/icons/logo.svg',
      gallery: Array.isArray(productData.gallery) && productData.gallery.length > 0 
        ? productData.gallery 
        : [productData.image || '/icons/logo.svg'],
      priceKg: Number(productData.priceKg) >= 0 ? Number(productData.priceKg) : 0,
      stockKg: Number(productData.stockKg) >= 0 ? Number(productData.stockKg) : 0,
      pricePacket: Number(productData.pricePacket) >= 0 ? Number(productData.pricePacket) : 0,
      packetWeight: (productData.packetWeight || '250 g').trim(),
      stockPacket: Number(productData.stockPacket) >= 0 ? Number(productData.stockPacket) : 0,
      // Compatibility aliases
      price: Number(productData.pricePacket) || Number(productData.priceKg) || 0,
      weight: (productData.packetWeight || '250 g').trim(),
      stock: Number(productData.stockPacket) >= 0 ? Number(productData.stockPacket) : 0,
      isPublished: productData.isPublished !== undefined ? Boolean(productData.isPublished) : true,
      isDemoProduct: Boolean(productData.isDemoProduct),
      isDemoPrice: Boolean(productData.isDemoPrice),
      displayOrder: Number(productData.displayOrder) || (products.length + 1),
      createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    writeJSON(PRODUCTS_FILE, products);
    return newProduct;
  },

  updateProduct(id, updates) {
    const products = this.getProducts(true);
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const current = products[index];
    const updated = {
      ...current,
      ...updates,
      priceKg: updates.priceKg !== undefined ? Number(updates.priceKg) : current.priceKg,
      stockKg: updates.stockKg !== undefined ? Number(updates.stockKg) : current.stockKg,
      pricePacket: updates.pricePacket !== undefined ? Number(updates.pricePacket) : current.pricePacket,
      packetWeight: updates.packetWeight !== undefined ? String(updates.packetWeight).trim() : current.packetWeight,
      stockPacket: updates.stockPacket !== undefined ? Number(updates.stockPacket) : current.stockPacket,
      // Sync aliases
      price: updates.pricePacket !== undefined ? Number(updates.pricePacket) : (current.pricePacket || current.price),
      weight: updates.packetWeight !== undefined ? String(updates.packetWeight).trim() : (current.packetWeight || current.weight),
      stock: updates.stockPacket !== undefined ? Number(updates.stockPacket) : (current.stockPacket || current.stock),
      updatedAt: new Date().toISOString()
    };

    if (Array.isArray(updates.gallery)) {
      updated.gallery = updates.gallery;
      if (!updated.image && updated.gallery.length > 0) {
        updated.image = updated.gallery[0];
      }
    }

    products[index] = updated;
    writeJSON(PRODUCTS_FILE, products);
    return updated;
  },

  deleteProduct(id) {
    const products = this.getProducts(true);
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) return false;
    writeJSON(PRODUCTS_FILE, filtered);
    return true;
  },

  // Safe purge or replacement of demo products
  clearDemoProducts() {
    const products = this.getProducts(true);
    const realProductsOnly = products.filter((p) => !p.isDemoProduct && !p.isDemoPrice);
    writeJSON(PRODUCTS_FILE, realProductsOnly);
    return {
      success: true,
      removedCount: products.length - realProductsOnly.length,
      remainingCount: realProductsOnly.length
    };
  },

  resetDemoCatalogue() {
    writeJSON(PRODUCTS_FILE, initialProducts);
    return initialProducts;
  },

  // -------------------------------------------------------------------------
  // Orders & Stock Concurrency Management
  // -------------------------------------------------------------------------
  getOrders() {
    return readJSON(ORDERS_FILE, []);
  },

  getOrderById(id) {
    const orders = this.getOrders();
    return orders.find((o) => o.id === id || o.orderRef === id);
  },

  createOrder(orderInput) {
    const products = this.getProducts(true);
    const productMap = new Map(products.map((p) => [p.id, p]));

    const verifiedItems = [];
    let subtotal = 0;

    for (const item of orderInput.items) {
      const liveProduct = productMap.get(item.id || item.productId);
      if (!liveProduct) {
        throw new Error(`Product "${item.name || item.id}" is no longer available.`);
      }
      if (!liveProduct.isPublished) {
        throw new Error(`"${liveProduct.name}" is currently unavailable.`);
      }

      // Check unit: 'kg' vs 'packet'
      const unit = item.unit === 'kg' ? 'kg' : 'packet';
      const quantity = Math.max(1, Number(item.quantity) || 1);

      let unitPrice = 0;
      let availableStock = 0;
      let weightLabel = '';

      if (unit === 'kg') {
        unitPrice = liveProduct.priceKg !== undefined ? liveProduct.priceKg : (liveProduct.price * 2);
        availableStock = liveProduct.stockKg !== undefined ? liveProduct.stockKg : Math.floor(liveProduct.stock / 2);
        weightLabel = '1 kg';
      } else {
        unitPrice = liveProduct.pricePacket !== undefined ? liveProduct.pricePacket : liveProduct.price;
        availableStock = liveProduct.stockPacket !== undefined ? liveProduct.stockPacket : liveProduct.stock;
        weightLabel = liveProduct.packetWeight || '250 g';
      }

      if (availableStock < quantity) {
        throw new Error(
          `Insufficient stock for ${liveProduct.name} (${unit === 'kg' ? 'per kg' : 'packets'}). Available: ${availableStock}, Requested: ${quantity}.`
        );
      }

      const itemTotal = unitPrice * quantity;
      subtotal += itemTotal;

      verifiedItems.push({
        id: liveProduct.id,
        productId: liveProduct.id,
        name: liveProduct.name,
        unit, // 'kg' or 'packet'
        weight: weightLabel,
        unitPrice,
        price: unitPrice,
        quantity,
        total: itemTotal,
        image: liveProduct.image
      });
    }

    const settings = this.getSettings();
    const deliveryCharge = 0; // Free Delivery guaranteed across Kolhapur
    const grandTotal = subtotal + deliveryCharge;

    // Deduct stock atomically and record inventory logs
    const inventoryLogs = this.getInventoryLogs();
    const orderRef = `CC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    for (const item of verifiedItems) {
      const p = productMap.get(item.id);
      if (item.unit === 'kg') {
        const oldStock = p.stockKg;
        p.stockKg = Math.max(0, p.stockKg - item.quantity);
        inventoryLogs.unshift({
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toISOString(),
          type: 'ORDER_DEDUCT',
          orderRef,
          productId: p.id,
          productName: p.name,
          unit: 'kg',
          delta: -item.quantity,
          previousStock: oldStock,
          newStock: p.stockKg,
          reason: `Order ${orderRef} placed by ${orderInput.customer.name}`
        });
      } else {
        const oldStock = p.stockPacket;
        p.stockPacket = Math.max(0, p.stockPacket - item.quantity);
        p.stock = p.stockPacket; // Sync legacy alias
        inventoryLogs.unshift({
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toISOString(),
          type: 'ORDER_DEDUCT',
          orderRef,
          productId: p.id,
          productName: p.name,
          unit: 'packet',
          delta: -item.quantity,
          previousStock: oldStock,
          newStock: p.stockPacket,
          reason: `Order ${orderRef} placed by ${orderInput.customer.name}`
        });
      }
    }

    writeJSON(PRODUCTS_FILE, Array.from(productMap.values()));
    writeJSON(INVENTORY_LOGS_FILE, inventoryLogs.slice(0, 500)); // Keep latest 500 logs

    const newOrder = {
      id: `ord-${Date.now()}`,
      orderRef,
      customer: {
        name: orderInput.customer.name.trim(),
        phone: orderInput.customer.phone.trim(),
        address: orderInput.customer.address.trim(),
        area: orderInput.customer.area ? orderInput.customer.area.trim() : 'Kolhapur',
        city: orderInput.customer.city ? orderInput.customer.city.trim() : 'Kolhapur',
        pincode: orderInput.customer.pincode ? orderInput.customer.pincode.trim() : '416001',
        notes: orderInput.customer.notes ? orderInput.customer.notes.trim() : ''
      },
      items: verifiedItems,
      subtotal,
      deliveryCharge: 0,
      grandTotal,
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending (Cash on Delivery)',
      status: 'Pending', // Pending, Confirmed, Delivered, Cancelled
      history: [
        {
          status: 'Pending',
          timestamp: new Date().toISOString(),
          note: 'Order placed by customer'
        }
      ],
      createdAt: new Date().toISOString()
    };

    const orders = this.getOrders();
    orders.unshift(newOrder);
    writeJSON(ORDERS_FILE, orders);

    return newOrder;
  },

  updateOrderStatus(orderId, newStatus, note = '') {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    const previousStatus = order.status;
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();

    if (!Array.isArray(order.history)) order.history = [];
    order.history.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Status updated from ${previousStatus} to ${newStatus}`
    });

    // Stock Release Logic:
    // If order was cancelled from any active state, restore the stock atomically!
    if (previousStatus !== 'Cancelled' && newStatus === 'Cancelled') {
      const products = this.getProducts(true);
      const productMap = new Map(products.map((p) => [p.id, p]));
      const inventoryLogs = this.getInventoryLogs();

      for (const item of order.items) {
        const p = productMap.get(item.id || item.productId);
        if (p) {
          if (item.unit === 'kg') {
            const oldStock = p.stockKg;
            p.stockKg += item.quantity;
            inventoryLogs.unshift({
              id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              timestamp: new Date().toISOString(),
              type: 'RESTORE_ON_CANCEL',
              orderRef: order.orderRef,
              productId: p.id,
              productName: p.name,
              unit: 'kg',
              delta: +item.quantity,
              previousStock: oldStock,
              newStock: p.stockKg,
              reason: `Stock released: Order ${order.orderRef} cancelled`
            });
          } else {
            const oldStock = p.stockPacket;
            p.stockPacket += item.quantity;
            p.stock = p.stockPacket;
            inventoryLogs.unshift({
              id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              timestamp: new Date().toISOString(),
              type: 'RESTORE_ON_CANCEL',
              orderRef: order.orderRef,
              productId: p.id,
              productName: p.name,
              unit: 'packet',
              delta: +item.quantity,
              previousStock: oldStock,
              newStock: p.stockPacket,
              reason: `Stock released: Order ${order.orderRef} cancelled`
            });
          }
        }
      }

      writeJSON(PRODUCTS_FILE, Array.from(productMap.values()));
      writeJSON(INVENTORY_LOGS_FILE, inventoryLogs.slice(0, 500));
    }

    writeJSON(ORDERS_FILE, orders);
    return order;
  },

  // -------------------------------------------------------------------------
  // Stock Adjustments & Audit Logs
  // -------------------------------------------------------------------------
  getInventoryLogs() {
    return readJSON(INVENTORY_LOGS_FILE, []);
  },

  adjustStock(productId, unit, delta, reason = 'Manual inventory adjustment') {
    const products = this.getProducts(true);
    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found.');

    const numDelta = Number(delta);
    if (isNaN(numDelta)) throw new Error('Invalid stock delta.');

    let previousStock = 0;
    let newStock = 0;

    if (unit === 'kg') {
      previousStock = product.stockKg;
      product.stockKg = Math.max(0, product.stockKg + numDelta);
      newStock = product.stockKg;
    } else {
      previousStock = product.stockPacket;
      product.stockPacket = Math.max(0, product.stockPacket + numDelta);
      product.stock = product.stockPacket;
      newStock = product.stockPacket;
    }

    product.updatedAt = new Date().toISOString();
    writeJSON(PRODUCTS_FILE, products);

    const logs = this.getInventoryLogs();
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type: 'MANUAL_ADJUST',
      productId: product.id,
      productName: product.name,
      unit,
      delta: numDelta,
      previousStock,
      newStock,
      reason
    };
    logs.unshift(newLog);
    writeJSON(INVENTORY_LOGS_FILE, logs.slice(0, 500));

    return { product, log: newLog };
  },

  // -------------------------------------------------------------------------
  // Categories Management
  // -------------------------------------------------------------------------
  getCategories() {
    return readJSON(CATEGORIES_FILE, initialCategories);
  },

  addCategory(categoryName) {
    const cats = this.getCategories();
    const clean = (categoryName || '').trim();
    if (!clean) throw new Error('Category name cannot be empty.');
    if (!cats.includes(clean)) {
      cats.push(clean);
      writeJSON(CATEGORIES_FILE, cats);
    }
    return cats;
  },

  deleteCategory(categoryName) {
    let cats = this.getCategories();
    if (categoryName === 'All') throw new Error('Cannot delete default "All" category.');
    cats = cats.filter((c) => c !== categoryName);
    writeJSON(CATEGORIES_FILE, cats);
    return cats;
  },

  // -------------------------------------------------------------------------
  // Customer Records & Sales Analytics
  // -------------------------------------------------------------------------
  getCustomers() {
    const orders = this.getOrders();
    const customerMap = new Map();

    for (const order of orders) {
      const phone = order.customer?.phone || 'Unknown';
      if (!customerMap.has(phone)) {
        customerMap.set(phone, {
          phone,
          name: order.customer.name,
          addresses: [order.customer.address],
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: order.createdAt,
          orders: []
        });
      }

      const rec = customerMap.get(phone);
      rec.totalOrders += 1;
      if (order.status !== 'Cancelled') {
        rec.totalSpent += (order.grandTotal || 0);
      }
      if (!rec.addresses.includes(order.customer.address)) {
        rec.addresses.push(order.customer.address);
      }
      rec.orders.push({
        id: order.id,
        orderRef: order.orderRef,
        date: order.createdAt,
        total: order.grandTotal,
        status: order.status
      });
    }

    return Array.from(customerMap.values()).sort((a, b) => new Date(b.lastOrderDate) - new Date(a.lastOrderDate));
  },

  getSalesReport() {
    const orders = this.getOrders();
    const products = this.getProducts(true);

    const counts = {
      Pending: 0,
      Confirmed: 0,
      Delivered: 0,
      Cancelled: 0,
      Total: orders.length
    };

    const revenue = {
      Pending: 0,
      Confirmed: 0,
      Delivered: 0,
      Cancelled: 0,
      NetRevenue: 0 // Delivered + Confirmed
    };

    const dailyBreakdown = {};
    const monthlyBreakdown = {};

    for (const order of orders) {
      const status = order.status || 'Pending';
      const amount = Number(order.grandTotal) || 0;

      if (counts[status] !== undefined) counts[status] += 1;
      if (revenue[status] !== undefined) revenue[status] += amount;

      if (status === 'Delivered' || status === 'Confirmed') {
        revenue.NetRevenue += amount;
      }

      const dateStr = order.createdAt ? order.createdAt.split('T')[0] : 'Unknown';
      const monthStr = dateStr !== 'Unknown' ? dateStr.substring(0, 7) : 'Unknown';

      if (!dailyBreakdown[dateStr]) {
        dailyBreakdown[dateStr] = { date: dateStr, count: 0, total: 0, delivered: 0 };
      }
      dailyBreakdown[dateStr].count += 1;
      dailyBreakdown[dateStr].total += amount;
      if (status === 'Delivered') dailyBreakdown[dateStr].delivered += amount;

      if (!monthlyBreakdown[monthStr]) {
        monthlyBreakdown[monthStr] = { month: monthStr, count: 0, total: 0, delivered: 0 };
      }
      monthlyBreakdown[monthStr].count += 1;
      monthlyBreakdown[monthStr].total += amount;
      if (status === 'Delivered') monthlyBreakdown[monthStr].delivered += amount;
    }

    return {
      counts,
      revenue,
      dailyBreakdown: Object.values(dailyBreakdown).sort((a, b) => b.date.localeCompare(a.date)),
      monthlyBreakdown: Object.values(monthlyBreakdown).sort((a, b) => b.month.localeCompare(a.month)),
      totalProducts: products.length,
      lowStockProducts: products.filter((p) => (p.stockKg <= 5 || p.stockPacket <= 5))
    };
  },

  // -------------------------------------------------------------------------
  // Settings & Security
  // -------------------------------------------------------------------------
  getSettings() {
    const settings = readJSON(SETTINGS_FILE, initialSettings);
    const { ownerPassword, ...publicSettings } = settings;
    return publicSettings;
  },

  verifyOwnerCredentials(inputUsername, inputPassword) {
    const settings = readJSON(SETTINGS_FILE, initialSettings);
    const validUsername = (settings.ownerUsername || 'Swarup').trim().toLowerCase();
    const cleanInputUsername = (inputUsername || '').trim().toLowerCase();

    if (cleanInputUsername !== validUsername) return false;

    // Verify password against stored password or initial fallback
    return verifyPassword(inputPassword, settings.ownerPassword || 'Swarup@123');
  },

  changeOwnerPassword(newPassword) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    const current = readJSON(SETTINGS_FILE, initialSettings);
    current.ownerPassword = hashPassword(newPassword);
    writeJSON(SETTINGS_FILE, current);
    return true;
  },

  updateSettings(updates) {
    const current = readJSON(SETTINGS_FILE, initialSettings);
    const { ownerPassword, ...safeUpdates } = updates;
    const updated = { ...current, ...safeUpdates };
    writeJSON(SETTINGS_FILE, updated);
    const { ownerPassword: _, ...publicSettings } = updated;
    return publicSettings;
  }
};
