import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ProductList from './components/ProductList';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderSuccessModal from './components/OrderSuccessModal';
import InstallPromptModal from './components/InstallPromptModal';
import OwnerLoginModal from './components/OwnerLoginModal';
import OwnerDashboard from './components/OwnerDashboard';
import Toast from './components/Toast';
import { Download, Sparkles, Heart, ShieldCheck, Phone, MapPin } from 'lucide-react';

export default function App() {
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cc_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isOwnerLoginOpen, setIsOwnerLoginOpen] = useState(false);
  const [isOwnerDashboardOpen, setIsOwnerDashboardOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Auth
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('cc_admin_token') || '');

  // Toast notifications
  const [toast, setToast] = useState({ message: '', type: 'info' });

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalledApp, setIsInstalledApp] = useState(false);

  // Show toast helper
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: 'info' });
    }, 4000);
  };

  // 1. Listen for PWA Install Prompt
  useEffect(() => {
    // Check if already in standalone display mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsInstalledApp(isStandalone);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log('✅ PWA beforeinstallprompt captured');
    };

    const handleAppInstalled = () => {
      setIsInstalledApp(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      showToast('🎉 Crazy Crunch installed successfully! Find it on your home screen.', 'success');
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
        showToast('Installing Crazy Crunch...', 'success');
      }
      setDeferredPrompt(null);
    } else {
      // If prompt isn't directly triggerable, open modal instructions
      setIsInstallModalOpen(true);
    }
  };

  // 2. Fetch Products & Settings (with cache fallback)
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
        localStorage.setItem('cc_cached_products', JSON.stringify(data.products));
      }
    } catch (err) {
      console.warn('Network issue fetching products, falling back to local cache:', err);
      const cached = localStorage.getItem('cc_cached_products');
      if (cached) {
        setProducts(JSON.parse(cached));
        showToast('Browsing cached catalogue in offline mode', 'info');
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

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cc_cart', JSON.stringify(cart));
  }, [cart]);

  // Cart operations
  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      showToast(`${product.name} is currently out of stock.`, 'error');
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast(`Only ${product.stock} pack(s) of ${product.name} available.`, 'info');
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            weight: product.weight,
            image: product.image,
            quantity: 1
          }
        ];
      }
    });

    showToast(`Added ${product.name} to cart! 🍟`, 'success');
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== productId));
      return;
    }

    const liveProduct = products.find((p) => p.id === productId);
    if (liveProduct && newQuantity > liveProduct.stock) {
      showToast(`Only ${liveProduct.stock} packs left in stock.`, 'info');
      return;
    }

    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Order submission
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

    // Clear cart & update catalogue
    setCart([]);
    fetchProducts();
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setConfirmedOrder(data.order);
    showToast('🎉 Order placed successfully!', 'success');
  };

  // Categories calculation
  const categories = [
    { id: 'all', label: 'All Snacks', count: products.length },
    {
      id: 'Crispy Savouries',
      label: 'Crispy Savouries',
      count: products.filter((p) => p.category === 'Crispy Savouries').length
    },
    {
      id: 'Traditional Sweets',
      label: 'Traditional Sweets',
      count: products.filter((p) => p.category === 'Traditional Sweets').length
    },
    {
      id: 'Bakery & Biscuits',
      label: 'Bakery & Biscuits',
      count: products.filter((p) => p.category === 'Bakery & Biscuits').length
    }
  ];

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.weight && p.weight.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
    <div className="min-h-screen flex flex-col bg-[#fbf9f5]">
      {/* Top Navbar */}
      <Navbar
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenInstall={() => {
          if (deferredPrompt) handleInstallClick();
          else setIsInstallModalOpen(true);
        }}
        isInstallable={isInstallable}
        onOpenOwner={() => {
          if (adminToken) setIsOwnerDashboardOpen(true);
          else setIsOwnerLoginOpen(true);
        }}
        isOwnerLoggedIn={Boolean(adminToken)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Banner with Categories */}
        <HeroBanner
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(id) => setSelectedCategory(id)}
        />

        {/* Product Catalogue Grid */}
        <ProductList
          products={filteredProducts}
          loading={loading}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
          searchQuery={searchQuery}
          onClearFilters={() => {
            setSearchQuery('');
            setSelectedCategory('all');
          }}
        />

        {/* Mobile Floating Install Banner if not installed */}
        {!isInstalledApp && (
          <div className="mt-12 bg-white rounded-3xl p-5 border border-orange-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <img src="/icons/icon-192.svg" alt="App Icon" className="w-12 h-12 rounded-2xl shadow-sm shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Install Crazy Crunch on your Android Phone
                </h3>
                <p className="text-xs text-slate-500">
                  Enjoy faster ordering, app-like fullscreen view, and zero Google Play downloads.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (deferredPrompt) handleInstallClick();
                else setIsInstallModalOpen(true);
              }}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md shadow-orange-600/20 shrink-0 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Install Web App</span>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/70 mt-16 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <img src="/icons/icon-192.svg" alt="Crazy Crunch" className="w-6 h-6 rounded-lg" />
            <span className="font-bold text-slate-800 text-sm">Crazy Crunch</span>
            <span>— Crunch in Every Munch!</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-medium text-slate-600">
            <span>Cash on Delivery</span>
            <span>•</span>
            <span>Instant UPI QR</span>
            <span>•</span>
            <button
              onClick={() => {
                if (adminToken) setIsOwnerDashboardOpen(true);
                else setIsOwnerLoginOpen(true);
              }}
              className="text-orange-600 hover:underline font-bold"
            >
              Owner Portal
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} Crazy Crunch. Progressive Web App.
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
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

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        settings={settings}
        onSubmitOrder={handleSubmitOrder}
      />

      <OrderSuccessModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        whatsappNumber={settings?.whatsappNumber}
      />

      <InstallPromptModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onInstallClick={handleInstallClick}
        isInstallable={isInstallable}
      />

      <OwnerLoginModal
        isOpen={isOwnerLoginOpen}
        onClose={() => setIsOwnerLoginOpen(false)}
        onLoginSuccess={(token) => {
          setAdminToken(token);
          setIsOwnerDashboardOpen(true);
          showToast('Welcome to the Owner Dashboard!', 'success');
        }}
      />

      {/* Toast Alert */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />
    </div>
  );
}
