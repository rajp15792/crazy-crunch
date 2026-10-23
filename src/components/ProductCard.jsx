import React from 'react';
import { Plus, Minus, ShoppingBag, AlertTriangle, Check } from 'lucide-react';

export default function ProductCard({
  product,
  cartItem,
  onAddToCart,
  onUpdateQuantity
}) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const canAddMore = inCartQty < product.stock;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
      
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] bg-orange-50/50 overflow-hidden flex items-center justify-center p-3">
        <img
          src={product.image || '/images/chakli.svg'}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = '/icons/icon-192.svg';
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-700 shadow-sm border border-slate-200/50 backdrop-blur-sm">
            {product.weight || '200 g'}
          </span>
          {product.isDemoPrice && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Demo Price
            </span>
          )}
        </div>

        {/* Stock Badge */}
        <div className="absolute top-2.5 right-2.5">
          {isOutOfStock ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 animate-pulse">
              Only {product.stock} left
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              In Stock
            </span>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-semibold text-orange-600 uppercase tracking-wider mb-0.5">
            {product.category || 'Snack'}
          </div>
          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-orange-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description || 'Fresh and crispy homemade Indian snack made with quality ingredients.'}
          </p>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-xs text-slate-400 font-medium leading-none">Price</div>
            <div className="text-lg font-black text-slate-900 leading-tight">
              ₹{product.price}
            </div>
          </div>

          <div>
            {isOutOfStock ? (
              <button
                disabled
                className="px-3 py-2 bg-slate-100 text-slate-400 text-xs font-bold rounded-full cursor-not-allowed"
              >
                Unavailable
              </button>
            ) : inCartQty > 0 ? (
              /* Quantity Selector */
              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full p-1">
                <button
                  onClick={() => onUpdateQuantity(product.id, inCartQty - 1)}
                  className="w-7 h-7 flex items-center justify-center bg-white text-orange-700 rounded-full shadow-sm hover:bg-orange-100 active:scale-95 transition-all"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-black text-slate-900">
                  {inCartQty}
                </span>
                <button
                  onClick={() => {
                    if (canAddMore) {
                      onUpdateQuantity(product.id, inCartQty + 1);
                    }
                  }}
                  disabled={!canAddMore}
                  className={`w-7 h-7 flex items-center justify-center rounded-full shadow-sm transition-all ${
                    canAddMore
                      ? 'bg-orange-600 text-white hover:bg-orange-700 active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                  aria-label="Increase quantity"
                  title={!canAddMore ? 'Maximum available stock reached' : ''}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* Add to Cart Button */
              <button
                onClick={() => onAddToCart(product)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-bold rounded-full shadow-md shadow-orange-600/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
