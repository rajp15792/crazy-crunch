import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  products,
  onUpdateQuantity,
  onClearCart,
  onProceedToCheckout,
  settings
}) {
  if (!isOpen) return null;

  const minForFree = settings?.minOrderForFreeDelivery || 299;
  const standardDelivery = settings?.deliveryCharge || 30;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isFreeDelivery = subtotal >= minForFree;
  const deliveryCharge = cart.length === 0 ? 0 : isFreeDelivery ? 0 : standardDelivery;
  const grandTotal = subtotal + deliveryCharge;
  const remainingForFree = Math.max(0, minForFree - subtotal);

  // Map product stock for limit checking
  const productMap = new Map(products.map((p) => [p.id, p]));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-orange-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-bold text-slate-900">Your Snack Cart</h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                {cart.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Bar */}
          {cart.length > 0 && (
            <div className="bg-amber-50/80 px-4 py-2.5 border-b border-amber-200/50">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-900 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-orange-600" />
                  {isFreeDelivery ? (
                    <span className="text-emerald-700 font-bold">🎉 Congratulations! You have FREE Delivery!</span>
                  ) : (
                    <span>Add ₹{remainingForFree} more for <strong>FREE Delivery</strong></span>
                  )}
                </div>
              </div>
              <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-orange-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (subtotal / minForFree) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Craving delicious homemade chakli, sev, or laddus? Explore our menu and add your favourites!
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-orange-600/20"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const liveProd = productMap.get(item.id);
                const maxStock = liveProd ? liveProd.stock : item.quantity;
                const canAddMore = item.quantity < maxStock;

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <img
                      src={item.image || '/images/chakli.svg'}
                      alt={item.name}
                      className="w-16 h-16 object-contain rounded-xl bg-white p-1 border border-slate-200/60 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 0)}
                          className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-semibold text-slate-500">{item.weight}</span>
                        <span className="text-xs font-bold text-orange-600">₹{item.price} each</span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-1.5 py-0.5">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-full"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              if (canAddMore) onUpdateQuantity(item.id, item.quantity + 1);
                            }}
                            disabled={!canAddMore}
                            className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                              canAddMore ? 'text-orange-600 hover:bg-orange-50' : 'text-slate-300 cursor-not-allowed'
                            }`}
                            title={!canAddMore ? 'Max stock reached' : ''}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-sm font-black text-slate-900">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery Charges</span>
                  <span>
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-600 font-bold uppercase tracking-wider">FREE</span>
                    ) : (
                      <span className="font-semibold text-slate-900">₹{deliveryCharge}</span>
                    )}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-black text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-orange-600">₹{grandTotal}</span>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 transition-all text-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={onClearCart}
                  className="text-[11px] text-slate-400 hover:text-red-500 font-medium transition-colors"
                >
                  Clear all items
                </button>
                <span className="text-[11px] text-slate-400">Cash on Delivery & UPI available</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
