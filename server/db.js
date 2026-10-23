import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialProducts, initialSettings } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure directory and seed files exist
function initDB() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(initialProducts, null, 2), 'utf8');
  }

  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf8');
  }

  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(initialSettings, null, 2), 'utf8');
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

export const db = {
  // Products
  getProducts(includeUnpublished = false) {
    const products = readJSON(PRODUCTS_FILE, initialProducts);
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
      name: productData.name.trim(),
      category: productData.category || 'Crispy Savouries',
      price: Number(productData.price) || 0,
      weight: productData.weight ? productData.weight.trim() : '200 g',
      description: productData.description ? productData.description.trim() : '',
      image: productData.image || '/images/chakli.svg',
      stock: Number(productData.stock) >= 0 ? Number(productData.stock) : 0,
      isPublished: productData.isPublished !== undefined ? Boolean(productData.isPublished) : true,
      isDemoPrice: Boolean(productData.isDemoPrice),
      createdAt: new Date().toISOString()
    };
    products.unshift(newProduct);
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
      price: updates.price !== undefined ? Number(updates.price) : current.price,
      stock: updates.stock !== undefined ? Number(updates.stock) : current.stock,
      updatedAt: new Date().toISOString()
    };

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

  // Orders
  getOrders() {
    return readJSON(ORDERS_FILE, []);
  },

  getOrderById(id) {
    const orders = this.getOrders();
    return orders.find((o) => o.id === id);
  },

  createOrder(orderInput) {
    const products = this.getProducts(true);
    const productMap = new Map(products.map((p) => [p.id, p]));

    // 1. Verify items, prices, and stock on server
    const verifiedItems = [];
    let subtotal = 0;

    for (const item of orderInput.items) {
      const liveProduct = productMap.get(item.id);
      if (!liveProduct) {
        throw new Error(`Product "${item.name || item.id}" is no longer available.`);
      }
      if (!liveProduct.isPublished) {
        throw new Error(`"${liveProduct.name}" is currently unavailable.`);
      }
      if (liveProduct.stock < item.quantity) {
        throw new Error(`Insufficient stock for "${liveProduct.name}". Only ${liveProduct.stock} pack(s) remaining.`);
      }

      const itemTotal = liveProduct.price * item.quantity;
      subtotal += itemTotal;

      verifiedItems.push({
        id: liveProduct.id,
        name: liveProduct.name,
        price: liveProduct.price,
        weight: liveProduct.weight,
        quantity: item.quantity,
        total: itemTotal,
        image: liveProduct.image
      });
    }

    const settings = this.getSettings();
    const deliveryCharge = subtotal >= (settings.minOrderForFreeDelivery || 299) ? 0 : (settings.deliveryCharge || 30);
    const grandTotal = subtotal + deliveryCharge;

    // Deduct verified stock atomically
    for (const item of verifiedItems) {
      const p = productMap.get(item.id);
      p.stock = Math.max(0, p.stock - item.quantity);
    }
    writeJSON(PRODUCTS_FILE, Array.from(productMap.values()));

    // Generate readable order reference: CC-YEAR-RANDOM
    const orderRef = `CC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: `ord-${Date.now()}`,
      orderRef,
      customer: {
        name: orderInput.customer.name.trim(),
        phone: orderInput.customer.phone.trim(),
        address: orderInput.customer.address.trim(),
        pincode: orderInput.customer.pincode ? orderInput.customer.pincode.trim() : '',
        notes: orderInput.customer.notes ? orderInput.customer.notes.trim() : ''
      },
      items: verifiedItems,
      subtotal,
      deliveryCharge,
      grandTotal,
      paymentMethod: orderInput.paymentMethod || 'COD', // 'COD' or 'UPI'
      paymentStatus: orderInput.paymentMethod === 'COD' ? 'Pending (Cash on Delivery)' : 'UPI Initiated',
      status: 'Confirmed', // Confirmed, Preparing, Out for Delivery, Delivered, Cancelled
      createdAt: new Date().toISOString()
    };

    const orders = this.getOrders();
    orders.unshift(newOrder);
    writeJSON(ORDERS_FILE, orders);

    return newOrder;
  },

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    writeJSON(ORDERS_FILE, orders);
    return order;
  },

  // Settings & Auth
  getSettings() {
    const settings = readJSON(SETTINGS_FILE, initialSettings);
    // Never expose owner password
    const { ownerPassword, ...publicSettings } = settings;
    return publicSettings;
  },

  verifyOwnerPassword(inputPassword) {
    const settings = readJSON(SETTINGS_FILE, initialSettings);
    return settings.ownerPassword === inputPassword;
  },

  updateSettings(updates) {
    const current = readJSON(SETTINGS_FILE, initialSettings);
    const updated = { ...current, ...updates };
    writeJSON(SETTINGS_FILE, updated);
    const { ownerPassword, ...publicSettings } = updated;
    return publicSettings;
  }
};
