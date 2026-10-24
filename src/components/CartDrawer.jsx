import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart = [],
  products = [],
  onUpdateQuantity,
  onClearCart,
  onProceedToCheckout
}) {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const deliveryCharge = 0; // Guaranteed Free Delivery in Kolhapur
  const grandTotal = subtotal + deliveryCharge;
  const totalItemCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#c5a059]/30">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#c5a059]/20 flex items-center justify-between bg-[#0f382c] text-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
              <h2 className="text-lg font-black tracking-tight text-white brand-font">Your Shopping Cart</h2>
              <span className="text-xs font-black px-2 py-0.5 bg-[#1b4332] text-[#d4af37] border border-[#d4af37]/40 rounded-full">
                {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-emerald-200 hover:text-white hover:bg-[#1b4332] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Notice */}
          <div className="bg-[#fdfbf7] px-4 py-2.5 border-b border-[#c5a059]/30 flex items-center justify-between text-xs font-bold text-[#0f382c]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Delivering to Kolhapur & nearby areas</span>
            </div>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-extrabold">
              FREE DELIVERY (₹0)
            </span>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-[#f4ede2] text-[#1b4332] rounded-full flex items-center justify-center mx-auto border border-[#c5a059]/30">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0f382c] text-base">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Explore our fresh Milk Toast, Maska Khari, Milk Cookies, and Farsan Mix to get started!
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-[#1b4332] hover:bg-[#0f382c] text-[#d4af37] rounded-full text-xs font-bold transition-all shadow-md shadow-[#0f382c]/20 border border-[#d4af37]/40"
                >
                  Browse Catalogue
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemKey = item.id || `${item.productId}_${item.unit}`;
                const unitDesc = item.unit === 'kg' ? 'Per Kg' : `Packet (${item.weight || '250 g'})`;

                return (
                  <div
                    key={itemKey}
                    className="p-3.5 bg-[#fdfbf7] rounded-2xl border border-[#c5a059]/30 shadow-xs flex items-center justify-between gap-3 group"
                  >
                    {/* Item Photo & Details */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 bg-white rounded-xl p-1 border border-[#c5a059]/20 shrink-0 flex items-center justify-center">
                        <img
                          src={item.image || '/icons/logo.svg'}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.src = '/icons/logo.svg'; }}
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-[#0f382c] truncate">
                          {item.name}
                        </h4>
                        <div className="text-[11px] font-semibold text-[#1b4332] mt-0.5">
                          {unitDesc} • ₹{item.price} each
                        </div>
                        <div className="text-xs font-black text-[#0f382c] mt-0.5">
                          Total: ₹{item.price * item.quantity}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls & Delete */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center bg-white border border-[#c5a059]/40 rounded-full p-0.5 shadow-xs">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(itemKey, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-[#0f382c] hover:bg-slate-100 rounded-full transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-[#0f382c]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(itemKey, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#1b4332] text-[#d4af37] hover:bg-[#0f382c] rounded-full transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(itemKey, 0)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#c5a059]/20 bg-[#fdfbf7] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge:</span>
                  <span className="font-extrabold text-emerald-700">₹0 (Free Delivery)</span>
                </div>
                <div className="pt-2 border-t border-[#c5a059]/20 flex justify-between items-center">
                  <span className="text-sm font-black text-[#0f382c]">Final Total:</span>
                  <span className="text-xl font-black text-[#0f382c] tracking-tight">
                    ₹{grandTotal}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClearCart}
                  className="px-3 py-3 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
                >
                  Clear Cart
                </button>
                <button
                  type="button"
                  onClick={onProceedToCheckout}
                  className="flex-1 py-3 px-4 bg-[#1b4332] hover:bg-[#0f382c] text-[#d4af37] rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#0f382c]/20 border border-[#d4af37]/40 active:scale-[0.98] transition-all"
                >
                  <span>Checkout (Cash on Delivery)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
