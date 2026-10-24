import React, { useState } from 'react';
import { X, ShieldCheck, Banknote, AlertCircle, Loader2, MapPin, ShoppingBag, Truck } from 'lucide-react';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart = [],
  settings,
  onSubmitOrder
}) {
  if (!isOpen) return null;

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    area: '',
    city: 'Kolhapur',
    pincode: '416001',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const deliveryCharge = 0; // Free delivery in Kolhapur
  const grandTotal = subtotal + deliveryCharge;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');

    if (!customer.name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    if (!customer.address.trim()) {
      setError('Please enter your complete delivery house/flat number and street address.');
      return;
    }

    if (!cart || cart.length === 0) {
      setError('Your shopping cart is empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitOrder({
        customer: {
          name: customer.name.trim(),
          phone: cleanPhone.slice(-10),
          address: customer.address.trim(),
          area: customer.area ? customer.area.trim() : 'Kolhapur',
          city: customer.city ? customer.city.trim() : 'Kolhapur',
          pincode: customer.pincode ? customer.pincode.trim() : '416001',
          notes: customer.notes ? customer.notes.trim() : ''
        },
        items: cart.map((i) => ({
          id: i.productId || i.id,
          unit: i.unit || 'packet',
          quantity: i.quantity,
          price: i.price,
          name: i.name,
          weight: i.weight
        })),
        paymentMethod: 'Cash on Delivery'
      });
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8 border border-[#c5a059]/30 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-[#0f382c] tracking-tight brand-font">Guest Checkout</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cash on Delivery only • No customer account or password needed
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-3.5 space-y-4 pr-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Delivery & Payment Badges */}
          <div className="p-3 bg-[#fdfbf7] rounded-2xl border border-[#c5a059]/30 space-y-1.5 text-xs text-[#0f382c]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span>Delivery: Our Own Delivery Service</span>
              </span>
              <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                FREE (₹0)
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Coverage: Kolhapur and nearby areas. Payment is made in cash directly upon order arrival.
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-[#f9f6f0] p-3.5 rounded-2xl border border-[#c5a059]/25 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#0f382c] border-b border-[#c5a059]/20 pb-1.5">
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-[#1b4332]" />
                <span>Order Summary ({cart.length} snacks)</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-700">
                ₹0 Delivery
              </span>
            </div>

            <div className="max-h-28 overflow-y-auto space-y-1 text-xs pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-slate-700">
                  <span className="truncate pr-2">
                    {item.name} ({item.unit === 'kg' ? '1 kg' : item.weight}) × <strong>{item.quantity}</strong>
                  </span>
                  <span className="font-bold shrink-0 text-[#0f382c]">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#c5a059]/20 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">Subtotal: ₹{subtotal}</span>
              <span className="font-black text-sm text-[#0f382c]">Final Total: ₹{grandTotal}</span>
            </div>
          </div>

          {/* Customer Details Form */}
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#0f382c] uppercase tracking-wider mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                placeholder="e.g. Ramesh Patil"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#c5a059]/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4332] disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0f382c] uppercase tracking-wider mb-1">
                Mobile Number (10 Digits) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  disabled={isSubmitting}
                  maxLength={10}
                  placeholder="9876543210"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full pl-12 pr-3.5 py-2.5 bg-[#fdfbf7] border border-[#c5a059]/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4332] disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0f382c] uppercase tracking-wider mb-1">
                Complete Delivery Address <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                disabled={isSubmitting}
                rows={2}
                placeholder="House / Flat No., Building name, Street name..."
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#c5a059]/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4332] resize-none disabled:opacity-60"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-[#0f382c] uppercase tracking-wider mb-1">
                  Area / Locality
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  placeholder="e.g. Rajarampuri"
                  value={customer.area}
                  onChange={(e) => setCustomer({ ...customer, area: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fdfbf7] border border-[#c5a059]/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4332] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0f382c] uppercase tracking-wider mb-1">
                  City
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  placeholder="Kolhapur"
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fdfbf7] border border-[#c5a059]/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4332] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0f382c] uppercase tracking-wider mb-1">
                  PIN Code
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  maxLength={6}
                  placeholder="416001"
                  value={customer.pincode}
                  onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fdfbf7] border border-[#c5a059]/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4332] disabled:opacity-60 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0f382c] uppercase tracking-wider mb-1">
                Optional Landmark / Delivery Instructions
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                placeholder="e.g. Near temple, call on arrival, deliver after 4 PM..."
                value={customer.notes}
                onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#fdfbf7] border border-[#c5a059]/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4332] disabled:opacity-60"
              />
            </div>

            {/* Payment Method Display (Locked to COD) */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-[#0f382c] uppercase tracking-wider mb-1">
                Payment Method
              </label>
              <div className="p-3 bg-[#fdfbf7] border-2 border-[#1b4332] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Banknote className="w-5 h-5 text-emerald-700" />
                  <div>
                    <div className="text-xs font-bold text-[#0f382c]">Cash on Delivery (COD)</div>
                    <div className="text-[10px] text-slate-500">Pay cash upon arrival. Zero advance online payment needed.</div>
                  </div>
                </div>
                <span className="w-3.5 h-3.5 rounded-full bg-[#1b4332] border-2 border-white shadow-xs"></span>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 bg-[#1b4332] hover:bg-[#0f382c] active:scale-[0.98] disabled:bg-slate-300 text-[#d4af37] rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-[#0f382c]/25 transition-all text-xs border border-[#d4af37]/40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" />
                <span>Verifying Stock & Creating Order...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm Order • Cash on Delivery (₹{grandTotal})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
