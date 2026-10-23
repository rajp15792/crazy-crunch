# 🍟 Crazy Crunch — Progressive Web App (PWA)

Fresh, homemade, crispy snack ordering platform and installable mobile Progressive Web App (PWA).

---

## 🌟 Key Features

1. **Installable Android PWA (100% Free, No Google Play Store Needed):**
   - W3C Web App Manifest with `display: standalone` for full app-like experience.
   - High-resolution adaptive & maskable icons (192px and 512px).
   - Service Worker (`sw.js`) with app shell pre-caching and offline catalogue browsing.
   - Smart 1-tap in-app install banner & Android Chrome step-by-step install guide.
2. **Customer Catalogue & Shopping Flow:**
   - 7 Preloaded authentic demo products (Chakli, Sev, Khari, Mamra Laddu, Mini Stuffed Snacks, Coconut Biscuits, Dry Fruit Laddu).
   - Dynamic search & category filters (Crispy Savouries, Traditional Sweets, Bakery & Biscuits).
   - Real-time stock reservation and boundary checking.
   - Slide-over cart drawer with free delivery progress bar.
   - Verified server-side checkout preventing out-of-stock orders.
   - Order confirmation with unique reference code (`CC-YYYY-XXXX`) and WhatsApp order notification.
3. **Payments & Security:**
   - **Cash on Delivery (COD)** (Verified & Default, 100% free).
   - **Scan & Pay via UPI / UPI Apps** (Direct store UPI ID, deep-link intent, zero payment gateway fees, never collects customer PINs).
4. **Owner Management Dashboard:**
   - Protected by credential authentication.
   - Add, edit, and delete products (names, demo prices, weights, stock, descriptions, photos).
   - Publish / Unpublish catalogue items with one click.
   - Manage incoming orders with live statuses: `Confirmed`, `Preparing`, `Out for Delivery`, `Delivered`, `Cancelled`.
   - Direct WhatsApp customer messaging button.
   - Sales analytics: Total revenue, total orders, active orders, and low-stock alerts.

---

## 🚀 Running Locally

### 1. Build and Start the Full-Stack App
```bash
# Production mode (serves compiled PWA + API backend on port 3001)
npm run build
npm start
```
Open **`http://localhost:3001`** in your browser.

### 2. Development Mode (with Live Reload)
```bash
# Terminal 1: Backend API Server
npm run server

# Terminal 2: Vite Frontend Dev Server
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 📱 Testing PWA Installation on Android Phone (Over Local Wi-Fi)

You can install and test the PWA right now on your Android phone using your home Wi-Fi:

1. Find your computer's local IP address (e.g. `192.168.1.15`).
2. Run `npm start` on your computer.
3. On your Android phone, open Chrome and navigate to:
   ```
   http://<YOUR_LOCAL_IP>:3001
   ```
4. Chrome will display the **"Install App"** button or banner.
5. Tap **Install App** to add Crazy Crunch to your phone's home screen and app launcher!

---

## ☁️ 100% Free Cloud Deployment Guide

You can deploy Crazy Crunch live on the internet with automatic HTTPS (required for PWAs) at zero cost using **Render** or **Vercel**.

### Option A: Render.com (Recommended Free Web Service)
1. Push this project to your GitHub account (`git push origin main`).
2. Create a free account at [render.com](https://render.com).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Configure:
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Instance Type:** `Free` (0.1 CPU, 512 MB RAM, 100% Free)
6. Click **Deploy Web Service**.
7. Render will provide a free live URL (e.g., `https://crazy-crunch.onrender.com`) with automatic HTTPS and PWA installability!

### Option B: Vercel
1. Install Vercel CLI or import repository at [vercel.com](https://vercel.com).
2. The included `vercel.json` will automatically configure static frontend hosting and the Node.js API endpoints.

---

## 🔐 Owner Dashboard Credentials

- **URL:** Open the app and click the **"Owner"** button in the header.
- **Owner ID:** `Swarup`
- **Owner Password:** `swarup@123`
