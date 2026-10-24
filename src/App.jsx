import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import ProductCard from './components/ProductCard';
import CustomerProductModal from './components/CustomerProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderSuccessModal from './components/OrderSuccessModal';
import InstallPromptModal from './components/InstallPromptModal';
import OwnerLoginModal from './components/OwnerLoginModal';
import OwnerDashboard from './components/OwnerDashboard';
import Toast from './components/Toast';
import { Download, Phone, MessageCircle, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

export default function App() {
  // Products & Settings
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  // Cart: [{ id, productId, name, unit, price, weight, quantity, image, stock }]
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cc_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Filters & Sorting (Section 2 & 6)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isOwnerLoginOpen, setIsOwnerLoginOpen] = useState(false);
  const [isOwnerDashboardOpen, setIsOwnerDashboardOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  // Auth: Session token for owner
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('cc_admin_token') || '');

  // Toast notifications
  const [toast, setToast] = useState({ message: '', type: 'info' });

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: 'info' });
    }, 4000);
  };

  // PWA Install handler
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      showToast('🎉 Crazy Crunch installed successfully! Added to your home screen.', 'success');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        showToast('Installing Crazy Crunch App...', 'success');
      }
      setDeferredPrompt(null);
    } else {
      setIsInstallModalOpen(true);
    }
  };

  // Fetch Products & Settings
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
        localStorage.setItem('cc_cached_products', JSON.stringify(data.products));
      }
    } catch (err) {
      console.warn('Network issue fetching products, falling back to cache:', err);
      const cached = localStorage.getItem('cc_cached_products');
      if (cached) {
        setProducts(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSettings();
  }, []);

  // Sync Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('cc_cart', JSON.stringify(cart));
  }, [cart]);

  // Cart Operations supporting dual units (packet and kg)
  const handleAddToCart = (itemPayload, quantityToAdd = 1) => {
    const itemKey = `${itemPayload.productId}_${itemPayload.unit}`;

    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === itemKey);
      if (existing) {
        const newQty = existing.quantity + quantityToAdd;
        if (itemPayload.stock && newQty > itemPayload.stock) {
          showToast(`Only ${itemPayload.stock} ${itemPayload.unit === 'kg' ? 'kg' : 'packets'} available.`, 'info');
          return prevCart.map((i) => i.id === itemKey ? { ...i, quantity: itemPayload.stock } : i);
        }
        return prevCart.map((i) =>
          i.id === itemKey ? { ...i, quantity: newQty } : i
        );
      } else {
        return [
          ...prevCart,
          {
            id: itemKey,
            productId: itemPayload.productId,
            name: itemPayload.name,
            category: itemPayload.category,
            unit: itemPayload.unit,
            price: itemPayload.price,
            weight: itemPayload.weight,
            image: itemPayload.image,
            quantity: quantityToAdd
          }
        ];
      }
    });

    showToast(`Added ${itemPayload.name} (${itemPayload.unit === 'kg' ? '1 kg' : itemPayload.weight}) to cart! 🛍️`, 'success');
  };

  const handleUpdateQuantity = (itemKey, newQuantity) => {
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((item) => (item.id !== itemKey && item.productId !== itemKey)));
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.id === itemKey || item.productId === itemKey) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleBuyNow = (itemPayload, quantity = 1) => {
    handleAddToCart(itemPayload, quantity);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Order Submission
  const handleSubmitOrder = async (orderPayload) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to place order.');
    }

    setCart([]);
    fetchProducts();
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setConfirmedOrder(data.order);
    showToast('🎉 Order confirmed and saved!', 'success');
  };

  // Filter & Sorting Logic
  const filteredProducts = products
    .filter((p) => {
      const matchesCategory =
        selectedCategory === 'all' || p.category?.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const priceA = a.pricePacket !== undefined ? a.pricePacket : (a.price || 0);
      const priceB = b.pricePacket !== undefined ? b.pricePacket : (b.price || 0);

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return (a.displayOrder || 99) - (b.displayOrder || 99); // default display order
    });

  const cartTotalCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  // If Owner Dashboard is opened
  if (isOwnerDashboardOpen && adminToken) {
    return (
      <OwnerDashboard
        token={adminToken}
        onLogout={() => {
          localStorage.removeItem('cc_admin_token');
          setAdminToken('');
          setIsOwnerDashboardOpen(false);
          showToast('Logged out of Owner Dashboard', 'info');
        }}
        onProductUpdated={() => fetchProducts()}
        onCloseDashboard={() => setIsOwnerDashboardOpen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-slate-800">
      
      {/* 1. Compact Crazy Crunch Logo and Header with Search Bar near Top */}
      <Navbar
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenInstall={() => {
          if (deferredPrompt) handleInstallClick();
          else setIsInstallModalOpen(true);
        }}
        isInstallable={isInstallable}
        onOpenOwner={() => {
          // Re-login requirement: Always require login credentials when opening owner dashboard
          setIsOwnerLoginOpen(true);
        }}
        isOwnerLoggedIn={Boolean(adminToken)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content: 2, 3, 4, 5 Show Products Immediately (No Hero Banner / Lengthy Intro) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* Product Categories, Sorting Controls & Product Catalogue Directly Below */}
        <ProductList
          products={filteredProducts}
          loading={loading}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
          onBuyNow={handleBuyNow}
          onOpenDetails={(prod) => setViewingProduct(prod)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onClearFilters={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setSortBy('featured');
          }}
        />
      </main>

      {/* Section 15: Compact Business Footer */}
      <footer className="bg-[#0f382c] border-t border-[#c5a059]/30 text-white mt-16 py-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            
            {/* Business Introduction */}
            <div className="space-y-1.5 max-w-md">
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <img src="/icons/logo.svg" alt="Crazy Crunch" className="w-8 h-8 rounded-lg border border-[#d4af37]/40" />
                <span className="font-black text-lg text-white brand-font tracking-tight">
                  CRAZY <span className="text-[#d4af37]">CRUNCH</span>
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/80 leading-relaxed">
                Fresh homemade bakery and crispy snack platform specializing in premium Khari, Toast, Cookies, and Farsan. Made with natural ingredients and traditional recipes.
              </p>
            </div>

            {/* Direct Contact & Delivery Information */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-xs">
              <div className="bg-[#1b4332] px-4 py-2.5 rounded-2xl border border-[#c5a059]/30 space-y-1 text-center sm:text-left">
                <div className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">
                  Delivery Coverage
                </div>
                <div className="text-white font-bold">Kolhapur & Nearby Areas</div>
                <div className="text-[11px] text-emerald-300 font-extrabold">Free Delivery (₹0)</div>
              </div>

              {/* Direct Links: WhatsApp and Tel */}
              <div className="flex flex-col gap-2">
                <a
                  href="https://wa.me/917507792060"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#d4af37]" />
                  <span>WhatsApp: +91 7507792060</span>
                </a>

                <a
                  href="tel:+917507792060"
                  className="px-4 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-emerald-100 rounded-xl font-bold flex items-center justify-center gap-2 border border-[#c5a059]/30 transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#d4af37]" />
                  <span>Call: +91 7507792060</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Portal Link */}
          <div className="pt-4 border-t border-[#c5a059]/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-emerald-200/60">
            <div>
              © {new Date().getFullYear()} Crazy Crunch. All rights reserved. English language only.
            </div>

            <div className="flex items-center gap-3">
              <span>Cash on Delivery</span>
              <span>•</span>
              <span>Kolhapur Delivery Service</span>
              <span>•</span>
              <button
                onClick={() => setIsOwnerLoginOpen(true)}
                className="text-[#d4af37] hover:underline font-bold"
              >
                Owner Portal
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Customer Product Details & Photo Gallery Modal */}
      <CustomerProductModal
        isOpen={Boolean(viewingProduct)}
        onClose={() => setViewingProduct(null)}
        product={viewingProduct}
        cart={cart}
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateQuantity}
        onBuyNow={handleBuyNow}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        products={products}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        settings={settings}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        settings={settings}
        onSubmitOrder={handleSubmitOrder}
      />

      {/* Order Success Confirmation with WhatsApp Click-to-Chat */}
      <OrderSuccessModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        whatsappNumber={settings?.whatsappNumber || '917507792060'}
      />

      {/* Install PWA Prompt Modal */}
      <InstallPromptModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onInstallClick={handleInstallClick}
        isInstallable={isInstallable}
      />

      {/* Owner Login Modal */}
      <OwnerLoginModal
        isOpen={isOwnerLoginOpen}
        onClose={() => setIsOwnerLoginOpen(false)}
        onLoginSuccess={(token) => {
          setAdminToken(token);
          setIsOwnerDashboardOpen(true);
          showToast('Welcome to the Owner Dashboard!', 'success');
        }}
      />

      {/* Toast Notification Alert */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />
    </div>
  );
}
