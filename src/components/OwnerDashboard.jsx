import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  LogOut,
  RefreshCw,
  Phone,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  X,
  ShieldCheck,
  Users,
  Layers,
  Key,
  Sliders,
  Sparkles,
  ArrowUpDown,
  History
} from 'lucide-react';
import ProductModal from './ProductModal';

export default function OwnerDashboard({
  token,
  onLogout,
  onProductUpdated,
  onCloseDashboard
}) {
  // Navigation Tabs: orders, products, stock, reports, customers
  const [activeTab, setActiveTab] = useState('orders');

  // Core Data State
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [salesReport, setSalesReport] = useState(null);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [orderFilter, setOrderFilter] = useState('All'); // All, Pending, Confirmed, Delivered, Cancelled
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockAdjustProduct, setStockAdjustProduct] = useState(null);
  const [stockAdjustUnit, setStockAdjustUnit] = useState('packet');
  const [stockDelta, setStockDelta] = useState(0);
  const [stockReason, setStockReason] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  // Notifications banner
  const [actionAlert, setActionAlert] = useState('');

  const showAlert = (msg) => {
    setActionAlert(msg);
    setTimeout(() => setActionAlert(''), 4000);
  };

  const fetchAllData = async () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [ordRes, prodRes, repRes, custRes, logsRes, catsRes] = await Promise.all([
        fetch('/api/admin/orders', { headers }).then((r) => r.json()),
        fetch('/api/admin/products', { headers }).then((r) => r.json()),
        fetch('/api/admin/reports', { headers }).then((r) => r.json()),
        fetch('/api/admin/customers', { headers }).then((r) => r.json()),
        fetch('/api/admin/inventory/logs', { headers }).then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json())
      ]);

      if (ordRes.success) setOrders(ordRes.orders || []);
      if (prodRes.success) setProducts(prodRes.products || []);
      if (repRes.success) setSalesReport(repRes.report || null);
      if (custRes.success) setCustomers(custRes.customers || []);
      if (logsRes.success) setInventoryLogs(logsRes.logs || []);
      if (catsRes.success) setCategories(catsRes.categories || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      showAlert('Failed to connect to server. Please verify login.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      showAlert(`Order status updated to ${newStatus}`);
      fetchAllData();
      if (onProductUpdated) onProductUpdated();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  // Save Product (Create or Edit)
  const handleSaveProduct = async (productData) => {
    const isEdit = Boolean(editingProduct && editingProduct.id);
    const url = isEdit ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      showAlert(isEdit ? 'Product updated successfully!' : 'Product created successfully!');
      setIsProductModalOpen(false);
      setEditingProduct(null);
      fetchAllData();
      if (onProductUpdated) onProductUpdated();
    } catch (err) {
      alert(err.message || 'Failed to save product');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      showAlert('Product deleted successfully');
      fetchAllData();
      if (onProductUpdated) onProductUpdated();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  // Clear Demo Products
  const handleClearDemoProducts = async () => {
    if (!window.confirm('Are you sure you want to remove all DEMO products and replace them with your real catalogue?')) return;
    try {
      const res = await fetch('/api/admin/clear-demo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      showAlert('Demo products safely purged!');
      fetchAllData();
      if (onProductUpdated) onProductUpdated();
    } catch (err) {
      alert(err.message || 'Failed to purge demo products');
    }
  };

  // Adjust Stock
  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!stockAdjustProduct) return;
    try {
      const res = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: stockAdjustProduct.id,
          unit: stockAdjustUnit,
          delta: Number(stockDelta),
          reason: stockReason || 'Manual inventory adjustment'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      showAlert('Inventory updated and logged successfully!');
      setIsStockModalOpen(false);
      setStockAdjustProduct(null);
      setStockDelta(0);
      setStockReason('');
      fetchAllData();
      if (onProductUpdated) onProductUpdated();
    } catch (err) {
      alert(err.message || 'Failed to update stock');
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setPasswordMsg('Password successfully changed!');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordMsg('');
        setNewPassword('');
      }, 1500);
    } catch (err) {
      setPasswordMsg(`Error: ${err.message}`);
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesFilter = orderFilter === 'All' || o.status === orderFilter;
    const q = orderSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.orderRef?.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.phone?.includes(q);
    return matchesFilter && matchesSearch;
  });

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const q = productSearch.toLowerCase().trim();
    return !q || p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
  });

  // Filtered Customers
  const filteredCustomers = customers.filter((c) => {
    const q = customerSearch.toLowerCase().trim();
    return !q || c.name?.toLowerCase().includes(q) || c.phone?.includes(q);
  });

  const hasDemoProducts = products.some((p) => p.isDemoProduct || p.isDemoPrice);

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col text-slate-800">
      
      {/* Top Header */}
      <header className="bg-[#0f382c] border-b border-[#c5a059]/30 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <img src="/icons/logo.svg" alt="Crazy Crunch" className="w-10 h-10 rounded-xl border border-[#d4af37]/40 shadow-sm" />
              <div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight brand-font text-white flex items-center gap-2">
                  <span>CRAZY CRUNCH</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37] text-[#0f382c] font-black uppercase">
                    Owner Portal
                  </span>
                </h1>
                <p className="text-[11px] text-[#e5c07b]">
                  Kolhapur Delivery Service • Store Management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="p-2 text-emerald-200 hover:text-white rounded-xl hover:bg-[#1b4332] text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Change Owner Password"
              >
                <Key className="w-4 h-4 text-[#d4af37]" />
                <span className="hidden sm:inline">Password</span>
              </button>

              <button
                onClick={fetchAllData}
                className="p-2 text-emerald-200 hover:text-white rounded-xl hover:bg-[#1b4332] text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Refresh All Data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={onCloseDashboard}
                className="px-3 py-1.5 bg-[#1b4332] hover:bg-[#2d6a4f] text-emerald-100 rounded-xl text-xs font-bold transition-colors"
              >
                View Website
              </button>

              <button
                onClick={onLogout}
                className="px-3 py-1.5 bg-red-900/60 hover:bg-red-800 text-red-100 border border-red-700/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs (5 Dedicated Sections) */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 pt-1 border-t border-[#c5a059]/20 text-xs font-bold scrollbar-none">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-[#d4af37] text-[#0f382c] shadow-sm'
                  : 'text-emerald-100 hover:bg-[#1b4332]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>A. Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'products'
                  ? 'bg-[#d4af37] text-[#0f382c] shadow-sm'
                  : 'text-emerald-100 hover:bg-[#1b4332]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>B. Products & Photos ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('stock')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'stock'
                  ? 'bg-[#d4af37] text-[#0f382c] shadow-sm'
                  : 'text-emerald-100 hover:bg-[#1b4332]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>C. Stock Management</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'bg-[#d4af37] text-[#0f382c] shadow-sm'
                  : 'text-emerald-100 hover:bg-[#1b4332]'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>D. Sales Reports</span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'customers'
                  ? 'bg-[#d4af37] text-[#0f382c] shadow-sm'
                  : 'text-emerald-100 hover:bg-[#1b4332]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>E. Customer Records ({customers.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Action Notification Banner */}
      {actionAlert && (
        <div className="bg-[#1b4332] text-[#d4af37] px-4 py-2.5 text-center text-xs font-bold shadow-md animate-fade-in flex items-center justify-center gap-2 border-b border-[#d4af37]/40">
          <Sparkles className="w-4 h-4" />
          <span>{actionAlert}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">

        {/* ================================================================= */}
        {/* SECTION A: ORDER MANAGEMENT */}
        {/* ================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-3xl border border-[#c5a059]/30 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {['All', 'Pending', 'Confirmed', 'Delivered', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      orderFilter === st
                        ? 'bg-[#1b4332] text-[#d4af37] shadow-xs'
                        : 'bg-[#fdfbf7] text-slate-600 hover:bg-[#f4ede2]'
                    }`}
                  >
                    {st} ({st === 'All' ? orders.length : orders.filter((o) => o.status === st).length})
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by order ID, name, or phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#fdfbf7] border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>
            </div>

            {/* Orders Table */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-[#c5a059]/20 shadow-xs">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-700 text-sm">No orders found in this filter</h3>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredOrders.map((order) => {
                  const customerPhone = order.customer?.phone || '';
                  const updateMsg = `Hello ${order.customer?.name}, your Crazy Crunch order ${order.orderRef} status is now: ${order.status}. Thank you!`;
                  const customerWaUrl = `https://wa.me/91${customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(updateMsg)}`;

                  return (
                    <div
                      key={order.id}
                      className="bg-white p-4 sm:p-5 rounded-3xl border border-[#c5a059]/25 shadow-xs hover:shadow-md transition-all space-y-3"
                    >
                      {/* Top Row */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-black text-sm text-[#0f382c] bg-[#fdfbf7] px-2.5 py-1 rounded-xl border border-[#c5a059]/30">
                            {order.orderRef}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {/* Status Switcher (Pending, Confirmed, Delivered, Cancelled) */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500">Status:</span>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black border cursor-pointer focus:outline-none ${
                              order.status === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : order.status === 'Confirmed'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : order.status === 'Cancelled'
                                ? 'bg-red-50 text-red-800 border-red-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled (Releases Stock)</option>
                          </select>

                          {/* Direct WhatsApp Customer Message */}
                          <a
                            href={customerWaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                            title="Message customer order status on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">WhatsApp Customer</span>
                          </a>
                        </div>
                      </div>

                      {/* Middle Row: Customer Info & Items */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1 bg-[#fdfbf7] p-3 rounded-2xl border border-slate-100">
                          <div className="font-bold text-[#0f382c] text-sm">
                            {order.customer?.name}
                          </div>
                          <div className="text-slate-600 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#1b4332]" />
                            <a href={`tel:+91${customerPhone}`} className="font-mono font-bold hover:underline">
                              +91 {customerPhone}
                            </a>
                          </div>
                          <div className="text-slate-600 leading-relaxed">
                            <strong>Address:</strong> {order.customer?.address}
                            {order.customer?.area ? `, ${order.customer?.area}` : ''}
                            {order.customer?.city ? `, ${order.customer?.city}` : ''}
                            {order.customer?.pincode ? ` - ${order.customer?.pincode}` : ''}
                          </div>
                          {order.customer?.notes && (
                            <div className="text-amber-800 italic">
                              <strong>Note:</strong> {order.customer?.notes}
                            </div>
                          )}
                        </div>

                        {/* Order Items */}
                        <div className="space-y-1 bg-[#fdfbf7] p-3 rounded-2xl border border-slate-100 flex flex-col justify-between">
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-slate-700">
                                <span>
                                  {item.name} ({item.unit === 'kg' ? 'kg' : (item.weight || 'packet')}) × <strong>{item.quantity}</strong>
                                </span>
                                <span className="font-mono font-bold">₹{item.total}</span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-[#0f382c]">
                            <span>Grand Total: ₹{order.grandTotal}</span>
                            <span className="text-emerald-700">Cash on Delivery</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION B: PRODUCT MANAGEMENT */}
        {/* ================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            
            {/* Demo Products Safe Banner */}
            {hasDemoProducts && (
              <div className="bg-[#fef8ea] border-2 border-[#fde68a] p-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <h4 className="font-black text-[#92400e] text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#d97706]" />
                    <span>Demo Catalogue Active</span>
                  </h4>
                  <p className="text-xs text-[#92400e] mt-0.5">
                    The 4 demo products (Milk Toast, Maska Khari, Milk Cookies, Farsan Mix) can be edited individually or safely replaced with your actual business inventory.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleClearDemoProducts}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    Clear Demo Products
                  </button>
                </div>
              </div>
            )}

            {/* Top Product Action Bar */}
            <div className="bg-white p-4 rounded-3xl border border-[#c5a059]/30 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by name or category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#fdfbf7] border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2.5 bg-[#1b4332] hover:bg-[#0f382c] text-[#d4af37] font-black text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-[#0f382c]/20 border border-[#d4af37]/40 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((p) => {
                const packetPrice = p.pricePacket !== undefined ? p.pricePacket : p.price;
                const packetStock = p.stockPacket !== undefined ? p.stockPacket : p.stock;
                const kgPrice = p.priceKg !== undefined ? p.priceKg : (packetPrice * 2);
                const kgStock = p.stockKg !== undefined ? p.stockKg : Math.floor(packetStock / 2);

                return (
                  <div
                    key={p.id}
                    className="bg-white p-4 rounded-3xl border border-[#c5a059]/25 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image || '/icons/logo.svg'}
                          alt={p.name}
                          className="w-14 h-14 object-contain rounded-xl p-1 bg-[#fdfbf7] border border-[#c5a059]/30 shrink-0"
                          onError={(e) => { e.target.src = '/icons/logo.svg'; }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#1b4332] uppercase tracking-wider">
                              {p.category}
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              p.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {p.isPublished ? 'Published' : 'Hidden'}
                            </span>
                          </div>
                          <h4 className="font-black text-sm text-[#0f382c] truncate">{p.name}</h4>
                          <span className="text-[10px] text-slate-400">Order: #{p.displayOrder || 1}</span>
                        </div>
                      </div>

                      {/* Selling Units Summary */}
                      <div className="mt-3 p-2.5 bg-[#fdfbf7] rounded-2xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">Packet ({p.packetWeight || '250 g'})</span>
                          <strong className="text-[#0f382c] font-black">₹{packetPrice}</strong>
                          <span className="text-[10px] text-slate-500 block">Stock: {packetStock}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">Per Kg (1 kg)</span>
                          <strong className="text-[#0f382c] font-black">₹{kgPrice}</strong>
                          <span className="text-[10px] text-slate-500 block">Stock: {kgStock} kg</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setStockAdjustProduct(p);
                          setIsStockModalOpen(true);
                        }}
                        className="text-xs text-[#1b4332] hover:underline font-bold"
                      >
                        Adjust Stock
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsProductModalOpen(true);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Edit product details & photos"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION C: STOCK MANAGEMENT */}
        {/* ================================================================= */}
        {activeTab === 'stock' && (
          <div className="space-y-6">
            
            {/* Live Stock Table */}
            <div className="bg-white rounded-3xl border border-[#c5a059]/25 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-[#0f382c] tracking-tight">Real-Time Inventory Status</h3>
                  <p className="text-xs text-slate-500">Atomic stock tracking for both Kg and Packet selling units</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fdfbf7] text-slate-700 uppercase font-black tracking-wider text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Stock (Packets)</th>
                      <th className="p-3.5">Stock (Kg)</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => {
                      const packetStock = p.stockPacket !== undefined ? p.stockPacket : p.stock;
                      const kgStock = p.stockKg !== undefined ? p.stockKg : Math.floor(packetStock / 2);
                      const isLow = packetStock <= 5 || kgStock <= 5;
                      const isOut = packetStock === 0 && kgStock === 0;

                      return (
                        <tr key={p.id} className="hover:bg-[#fdfbf7]/50">
                          <td className="p-3.5 font-bold text-[#0f382c] flex items-center gap-2">
                            <img src={p.image || '/icons/logo.svg'} alt="" className="w-8 h-8 rounded-lg object-contain bg-slate-50" />
                            <span>{p.name}</span>
                          </td>
                          <td className="p-3.5 text-slate-600">{p.category}</td>
                          <td className="p-3.5 font-bold">{packetStock} pkts ({p.packetWeight || '250 g'})</td>
                          <td className="p-3.5 font-bold">{kgStock} kg</td>
                          <td className="p-3.5">
                            {isOut ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700">Out of Stock</span>
                            ) : isLow ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 animate-pulse">Low Stock</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">Optimal</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => {
                                setStockAdjustProduct(p);
                                setIsStockModalOpen(true);
                              }}
                              className="px-3 py-1 bg-[#1b4332] text-[#d4af37] font-bold text-xs rounded-xl hover:bg-[#0f382c] transition-colors"
                            >
                              Update Stock
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inventory Adjustment Audit History */}
            <div className="bg-white rounded-3xl border border-[#c5a059]/25 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-[#0f382c] tracking-tight flex items-center gap-2">
                    <History className="w-4 h-4 text-[#1b4332]" />
                    <span>Inventory Change Audit Trail</span>
                  </h3>
                  <p className="text-xs text-slate-500">Log of stock deductions, order cancellations, and manual adjustments</p>
                </div>
              </div>

              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fdfbf7] text-slate-700 uppercase font-black tracking-wider text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="p-3">Time</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Unit</th>
                      <th className="p-3">Change</th>
                      <th className="p-3">New Balance</th>
                      <th className="p-3">Reason / Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventoryLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#fdfbf7]/50">
                        <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-3 font-bold text-[#0f382c]">{log.productName}</td>
                        <td className="p-3 uppercase font-semibold text-[10px]">{log.unit}</td>
                        <td className="p-3 font-mono font-bold">
                          <span className={log.delta > 0 ? 'text-emerald-700' : 'text-red-600'}>
                            {log.delta > 0 ? `+${log.delta}` : log.delta}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold">{log.newStock}</td>
                        <td className="p-3 text-slate-600">{log.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION D: SALES REPORTS */}
        {/* ================================================================= */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            
            {/* Summary Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-white p-4 rounded-3xl border border-[#c5a059]/25 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Revenue (Delivered)</span>
                <span className="text-xl font-black text-[#0f382c] mt-1 block">
                  ₹{salesReport?.revenue?.Delivered || 0}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">Excludes cancelled orders</span>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-[#c5a059]/25 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Orders Placed</span>
                <span className="text-xl font-black text-[#0f382c] mt-1 block">
                  {salesReport?.counts?.Total || 0}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">All statuses</span>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-[#c5a059]/25 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivered Orders</span>
                <span className="text-xl font-black text-emerald-700 mt-1 block">
                  {salesReport?.counts?.Delivered || 0}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">Fulfilled in Kolhapur</span>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-[#c5a059]/25 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cancelled Orders</span>
                <span className="text-xl font-black text-red-600 mt-1 block">
                  {salesReport?.counts?.Cancelled || 0}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">Stock released</span>
              </div>
            </div>

            {/* Daily & Monthly Sales Breakdown */}
            <div className="bg-white p-5 rounded-3xl border border-[#c5a059]/25 shadow-xs space-y-4">
              <h3 className="text-base font-black text-[#0f382c] tracking-tight">Daily Sales Log</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fdfbf7] text-slate-700 uppercase font-black tracking-wider text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Total Orders</th>
                      <th className="p-3">Gross Amount</th>
                      <th className="p-3">Delivered Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {salesReport?.dailyBreakdown?.map((day) => (
                      <tr key={day.date} className="hover:bg-[#fdfbf7]/50">
                        <td className="p-3 font-bold text-[#0f382c]">{day.date}</td>
                        <td className="p-3 font-semibold">{day.count}</td>
                        <td className="p-3 font-mono font-bold">₹{day.total}</td>
                        <td className="p-3 font-mono font-bold text-emerald-700">₹{day.delivered}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION E: CUSTOMER RECORDS */}
        {/* ================================================================= */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-3xl border border-[#c5a059]/30 shadow-xs flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customers by name or mobile..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#fdfbf7] border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((c) => (
                <div key={c.phone} className="bg-white p-4 rounded-3xl border border-[#c5a059]/25 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="font-black text-sm text-[#0f382c]">{c.name}</h4>
                      <a href={`tel:+91${c.phone}`} className="text-xs text-[#1b4332] font-mono font-bold hover:underline">
                        +91 {c.phone}
                      </a>
                    </div>
                    <span className="text-xs font-black bg-[#f4ede2] text-[#0f382c] px-2.5 py-1 rounded-xl">
                      {c.totalOrders} {c.totalOrders === 1 ? 'order' : 'orders'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div><strong>Lifetime Spent:</strong> ₹{c.totalSpent}</div>
                    <div className="truncate"><strong>Primary Address:</strong> {c.addresses?.[0]}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={`https://wa.me/91${c.phone}?text=${encodeURIComponent('Hello from Crazy Crunch!')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Customer</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Product Add/Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={handleSaveProduct}
        token={token}
      />

      {/* Quick Stock Adjustment Modal */}
      {isStockModalOpen && stockAdjustProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-[#c5a059]/30 space-y-3">
            <h4 className="font-black text-[#0f382c] text-sm">Update Stock: {stockAdjustProduct.name}</h4>
            <form onSubmit={handleAdjustStock} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Unit to Adjust:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStockAdjustUnit('packet')}
                    className={`py-1.5 rounded-xl text-xs font-bold border ${
                      stockAdjustUnit === 'packet' ? 'bg-[#1b4332] text-[#d4af37]' : 'bg-slate-50'
                    }`}
                  >
                    Packets
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockAdjustUnit('kg')}
                    className={`py-1.5 rounded-xl text-xs font-bold border ${
                      stockAdjustUnit === 'kg' ? 'bg-[#1b4332] text-[#d4af37]' : 'bg-slate-50'
                    }`}
                  >
                    Kilograms (kg)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Quantity Delta (+/-):</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. +10 or -5"
                  value={stockDelta}
                  onChange={(e) => setStockDelta(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fdfbf7] border rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Reason / Note:</label>
                <input
                  type="text"
                  placeholder="e.g. Fresh morning baking batch"
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fdfbf7] border rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#1b4332] text-[#d4af37] rounded-xl text-xs font-black shadow-sm"
                >
                  Apply Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-[#c5a059]/30 space-y-3">
            <h4 className="font-black text-[#0f382c] text-sm">Change Owner Password</h4>
            {passwordMsg && <div className="text-xs p-2 bg-slate-100 rounded-xl font-bold">{passwordMsg}</div>}
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password (min 6 characters):</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fdfbf7] border rounded-xl text-xs"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#1b4332] text-[#d4af37] rounded-xl text-xs font-black shadow-sm"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
