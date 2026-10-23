import React, { useState } from 'react';
import { X, ShieldCheck, Banknote, QrCode, AlertCircle, Loader2 } from 'lucide-react';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  settings,
  onSubmitOrder
}) {
  if (!isOpen) return null;

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    pincode: '',
    notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'UPI'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const minForFree = settings?.minOrderForFreeDelivery || 299;
  const standardDelivery = settings?.deliveryCharge || 30;
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = subtotal >= minForFree ? 0 : standardDelivery;
  const grandTotal = subtotal + deliveryCharge;

  // Generate UPI payment intent string
  const upiId = settings?.upiId || 'crazycrunch@upi';
  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    'Crazy Crunch'
  )}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent('Snacks Order')}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!customer.name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number for order updates.');
      return;
    }

    if (!customer.address.trim()) {
      setError('Please provide your complete delivery address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitOrder({
        customer: { ...customer, phone: cleanPhone.slice(-10) },
        items: cart.map((i) => ({ id: i.id, quantity: i.quantity, price: i.price, name: i.name })),
        paymentMethod
      });
      // Submission handled by parent which closes modal and opens success modal
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8 border border-orange-100 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight">Checkout & Delivery</h3>
            <p className="text-xs text-slate-500 mt-0.5">Verified server pricing & stock reservation</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Order Snapshot */}
          <div className="bg-orange-50/60 p-3.5 rounded-2xl border border-orange-200/50 flex justify-between items-center text-xs">
            <div>
              <span className="font-semibold text-slate-700">{cart.length} snack types</span>
              <span className="text-slate-400 mx-1.5">•</span>
              <span className="text-slate-500">
                {deliveryCharge === 0 ? 'FREE Delivery' : `₹${deliveryCharge} Delivery`}
              </span>
            </div>
            <div className="text-sm font-black text-orange-700">
              Total: ₹{grandTotal}
            </div>
          </div>

          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Patil"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full pl-12 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Delivery Pincode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 416001"
                  value={customer.pincode}
                  onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Complete Delivery Address <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="House / Flat No., Building, Street, Landmark..."
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Order Notes / Preferences (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Please ring bell, deliver after 5 PM"
                value={customer.notes}
                onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Choose Payment Method
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* Cash on Delivery */}
                <label
                  className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="accent-orange-600"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Cash on Delivery</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Pay in cash upon arrival</span>
                </label>

                {/* Direct UPI */}
                <label
                  className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <QrCode className="w-5 h-5 text-indigo-600" />
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="UPI"
                      checked={paymentMethod === 'UPI'}
                      onChange={() => setPaymentMethod('UPI')}
                      className="accent-orange-600"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-900">UPI / QR Scan</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">GPay, PhonePe, Paytm</span>
                </label>
              </div>

              {/* UPI Information Box */}
              {paymentMethod === 'UPI' && (
                <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200/80 rounded-2xl text-xs text-indigo-950 space-y-2">
                  <div className="font-semibold flex items-center justify-between">
                    <span>Store UPI ID:</span>
                    <code className="bg-white px-2 py-0.5 rounded font-mono font-bold text-indigo-700">
                      {upiId}
                    </code>
                  </div>
                  <p className="text-[11px] text-indigo-800">
                    You can pay upon order placement using any UPI app. We never ask for your UPI PIN.
                  </p>
                  <a
                    href={upiPayUrl}
                    className="block w-full text-center py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700"
                  >
                    Open UPI App on Phone (₹{grandTotal})
                  </a>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] disabled:bg-slate-300 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 transition-all text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Stock...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm Order (₹{grandTotal})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
