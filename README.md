# 🍟 Crazy Crunch — Production E-Commerce Platform & PWA

Fresh, homemade, crispy snack ordering platform with dual-unit selling (kg & packet) and WhatsApp order dispatch.

---

## 🌟 Key Features

1. **Brand & Modern Premium Design:**
   - Palette: Forest Green (`#0f382c`), Rich Gold (`#d4af37`), and Cream (`#fdfbf7`).
   - Clean product cards with dual-unit selection (Per Kg and Packet).
   - English language with quick search and category filtering.
2. **Catalog & Dual Selling Units:**
   - 4 Dual-unit products: Milk Toast, Maska Khari, Milk Cookies, Farsan Mix.
   - Customers can choose between **Packet (250 g)** and **Per Kg (1 kg)** with instant price and stock recalculation.
3. **Cash on Delivery Checkout:**
   - **Cash on Delivery (COD) Only** (No gateway charges, no online payment hurdles).
   - **Free Delivery** (₹0 delivery charge in Kolhapur and nearby areas).
   - Automatic order reference code (`CC-YYYY-XXXX`).
   - One-click WhatsApp order dispatch to `+91 7507792060`.
4. **Owner Management Dashboard:**
   - Dedicated management interface protected by scrypt password hashing and rate limiting.
   - Initial credentials: User ID `Swarup`, Password `Swarup@123`.
   - Live order lifecycle tracking (`Pending`, `Confirmed`, `Delivered`, `Cancelled`).
   - Automatic stock release back to inventory if an order is cancelled.
   - Product catalog editor, multi-photo gallery manager, stock adjustments, and sales reports.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Production build and run
npm run build
npm start
```
Server runs at `http://localhost:3001`.

---

## ☁️ Permanent Public Deployment (No IP Address, 24/7 Cloud Hosting)

Deploy with zero local dependencies so the website stays online permanently when your computer is turned off:

### 1. Push Project to GitHub
```bash
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
git branch -M main
git push -u origin main
```

### 2. Connect to Render (100% Free HTTPS Web Service)
1. Go to [https://render.com](https://render.com) and log in with GitHub.
2. Click **New +** -> **Web Service**.
3. Select your `crazy-crunch` repository.
4. Render automatically detects `render.yaml` or enter:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Instance Type:** `Free`
5. Click **Create Web Service**.
6. Render deploys your app to a permanent public HTTPS URL (e.g. `https://crazy-crunch.onrender.com`).

---

## 🔐 Owner Dashboard Credentials

- **Access:** Click the golden **"Owner"** button in the header.
- **Owner ID:** `Swarup`
- **Initial Password:** `Swarup@123`
