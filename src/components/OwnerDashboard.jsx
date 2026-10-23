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
  Truck,
  Clock,
  ChevronDown
} from 'lucide-react';
import ProductModal from './ProductModal';

export default function OwnerDashboard({
  token,
  onLogout,
  onProductUpdated,
  onCloseDashboard
}) {
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'orders', 'analytics'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState('All');

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch products
      const pRes = await fetch('/api/admin/products', { headers });
      const pData = await pRes.json();
      if (pData.success) setProducts(pData.products);

      // Fetch orders
      const oRes = await fetch('/api/admin/orders', { headers });
      const oData = await oRes.json();
      if (oData.success) setOrders(oData.orders);

      // Fetch stats
      const sRes = await fetch('/api/admin/stats', { headers });
      const sData = await sRes.json();
      if (sData.success) setStats(sData.stats);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // Product actions
  const handleSaveProduct = async (formData) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    try {
      if (editingProduct && editingProduct.id) {
        // Update
        const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          fetchDashboardData();
          if (onProductUpdated) onProductUpdated();
        }
      } else {
        // Create
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers,
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          fetchDashboardData();
          if (onProductUpdated) onProductUpdated();
        }
      }
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  const handleTogglePublish = async (product) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPublished: !product.isPublished })
      });
      if (res.ok) {
        fetchDashboardData();
        if (onProductUpdated) onProductUpdated();
      }
    } catch (err) {
      console.error('Failed to toggle publish:', err);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDeleteConfirmId(null);
        fetchDashboardData();
        if (onProductUpdated) onProductUpdated();
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  // Order actions
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
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const filteredOrders =
    orderFilter === 'All' ? orders : orders.filter((o) => o.status === orderFilter);

  const statusColors = {
    Confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    Preparing: 'bg-amber-100 text-amber-800 border-amber-200',
    'Out for Delivery': 'bg-purple-100 text-purple-800 border-purple-200',
    Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/icons/icon-192.svg" alt="Logo" className="w-9 h-9 rounded-xl shadow" />
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Owner Dashboard
                </h1>
                <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">
                  Crazy Crunch Admin Panel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={fetchDashboardData}
                className="p-2 text-slate-500 hover:text-orange-600 hover:bg-slate-100 rounded-xl transition-colors"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={onCloseDashboard}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Back to Store
              </button>

              <button
                onClick={onLogout}
                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 -mb-px text-xs sm:text-sm font-bold">
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'products'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products & Stock ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Customer Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Summary Stats</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Catalogue Management</h2>
                <p className="text-xs text-slate-500">Edit snack names, demo prices, weights, stock, and publish status</p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Snack</span>
              </button>
            </div>

            {/* Products Table / Cards */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Snack</th>
                      <th className="px-3 py-3">Category</th>
                      <th className="px-3 py-3">Weight</th>
                      <th className="px-3 py-3">Price</th>
                      <th className="px-3 py-3">Stock</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => {
                      const isLow = p.stock <= 5;
                      const isOut = p.stock <= 0;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image || '/images/chakli.svg'}
                                alt={p.name}
                                className="w-10 h-10 object-contain rounded-lg bg-orange-50/50 p-1 border border-slate-200/60 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                                {p.isDemoPrice && (
                                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                    Demo Price
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-slate-600 font-medium">{p.category}</td>
                          <td className="px-3 py-3 text-slate-600 font-bold">{p.weight}</td>
                          <td className="px-3 py-3 font-black text-slate-900 text-sm">₹{p.price}</td>
                          <td className="px-3 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                                isOut
                                  ? 'bg-red-100 text-red-700'
                                  : isLow
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {p.stock} packs
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <button
                              onClick={() => handleTogglePublish(p)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                                p.isPublished
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                              }`}
                              title="Click to toggle publish status"
                            >
                              {p.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              <span>{p.isPublished ? 'Published' : 'Hidden'}</span>
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsProductModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Edit product"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setDeleteConfirmId(p.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Customer Orders</h2>
                <p className="text-xs text-slate-500">Live order queue with status updates & WhatsApp contact</p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['All', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                      orderFilter === st
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700">No orders found</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Customer orders will automatically appear here once placed on the website or PWA.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((order) => {
                  const whatsappUrl = `https://wa.me/91${order.customer.phone}?text=${encodeURIComponent(
                    `Hello ${order.customer.name}, your Crazy Crunch order ${order.orderRef} is currently: ${order.status}. Thank you for ordering!`
                  )}`;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
                    >
                      <div>
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-orange-600 block">
                              {order.orderRef}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm mt-0.5">{order.customer.name}</h4>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              <span>+91 {order.customer.phone}</span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              statusColors[order.status] || 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>

                        {/* Delivery Address */}
                        <div className="mt-2.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="font-semibold text-slate-700 block mb-0.5">Delivery Address:</span>
                          <p className="leading-snug">{order.customer.address}</p>
                          {order.customer.pincode && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              PIN: {order.customer.pincode}
                            </span>
                          )}
                          {order.customer.notes && (
                            <p className="text-[10px] text-amber-700 italic mt-1 border-t border-slate-200/50 pt-1">
                              Note: {order.customer.notes}
                            </p>
                          )}
                        </div>

                        {/* Items ordered */}
                        <div className="mt-3 space-y-1 text-xs">
                          <div className="font-semibold text-slate-500 text-[11px]">Ordered Items:</div>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-slate-700">
                              <span className="truncate pr-2">
                                {item.name} ({item.weight}) × {item.quantity}
                              </span>
                              <span className="font-bold shrink-0">₹{item.total}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total & Status Selector */}
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-400 text-[10px] block">Payment ({order.paymentMethod})</span>
                            <span className="text-base font-black text-slate-900">₹{order.grandTotal}</span>
                          </div>

                          {/* WhatsApp Customer Action */}
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>

                        {/* Status Change Dropdown */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-500 shrink-0">Update:</span>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="flex-1 px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ANALYTICS */}
        {activeTab === 'analytics' && stats && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Sales & Store Performance</h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
                <div className="text-2xl font-black text-slate-900 mt-1">₹{stats.totalRevenue}</div>
                <span className="text-[11px] text-emerald-600 font-medium">From verified orders</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalOrders}</div>
                <span className="text-[11px] text-slate-500">Lifetime orders placed</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Orders</span>
                <div className="text-2xl font-black text-orange-600 mt-1">{stats.activeOrders}</div>
                <span className="text-[11px] text-orange-700 font-medium">Pending or out for delivery</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low Stock Snacks</span>
                <div className="text-2xl font-black text-amber-600 mt-1">{stats.lowStockCount}</div>
                <span className="text-[11px] text-amber-700 font-medium">5 or fewer packs left</span>
              </div>
            </div>

            {/* Low stock alert table */}
            {stats.lowStockProducts.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-700" />
                  <h3 className="text-sm font-bold text-amber-900">Low Stock Attention Required</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {stats.lowStockProducts.map((p) => (
                    <div key={p.id} className="bg-white p-3 rounded-2xl border border-amber-200/80 flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900">{p.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black">
                        {p.stock} packs remaining
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center border border-red-100">
            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Delete this product?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              This product will be permanently removed from your catalog and customer store.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirmId)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
