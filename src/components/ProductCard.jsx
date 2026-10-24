import React, { useState } from 'react';
import { Plus, Minus, ShoppingBag, Eye, Check, AlertCircle } from 'lucide-react';

export default function ProductCard({
  product,
  cart = [],
  onAddToCart,
  onUpdateQuantity,
  onBuyNow,
  onOpenDetails
}) {
  // Default to packet if available, otherwise kg
  const [selectedUnit, setSelectedUnit] = useState('packet'); // 'packet' or 'kg'

  // Extract unit-specific prices, stocks, and weights
  const packetPrice = product.pricePacket !== undefined ? product.pricePacket : (product.price || 50);
  const packetWeight = product.packetWeight || product.weight || '250 g';
  const packetStock = product.stockPacket !== undefined ? product.stockPacket : (product.stock || 0);

  const kgPrice = product.priceKg !== undefined ? product.priceKg : (packetPrice * 2);
  const kgStock = product.stockKg !== undefined ? product.stockKg : Math.floor(packetStock / 2);

  // Active unit properties
  const isKg = selectedUnit === 'kg';
  const activePrice = isKg ? kgPrice : packetPrice;
  const activeStock = isKg ? kgStock : packetStock;
  const activeWeight = isKg ? '1 kg' : packetWeight;

  // Cart item for this specific product & unit
  const cartItemId = `${product.id}_${selectedUnit}`;
  const cartItem = cart.find(
    (item) => item.id === cartItemId || (item.productId === product.id && item.unit === selectedUnit)
  );
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const isOutOfStock = activeStock <= 0;
  const isLowStock = activeStock > 0 && activeStock <= 5;
  const canAddMore = inCartQty < activeStock;

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart({
      productId: product.id,
      name: product.name,
      category: product.category,
      unit: selectedUnit,
      price: activePrice,
      weight: activeWeight,
      image: product.image,
      stock: activeStock
    });
  };

  const handleBuy = () => {
    if (isOutOfStock) return;
    if (onBuyNow) {
      onBuyNow({
        productId: product.id,
        name: product.name,
        category: product.category,
        unit: selectedUnit,
        price: activePrice,
        weight: activeWeight,
        image: product.image,
        stock: activeStock
      });
    } else {
      handleAdd();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#c5a059]/20 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-1">
      
      {/* Product Image Area with Click-to-Preview */}
      <div 
        onClick={() => onOpenDetails && onOpenDetails(product)}
        className="relative aspect-[4/3] bg-gradient-to-b from-[#fdfbf7] to-[#f4ede2] overflow-hidden flex items-center justify-center p-4 cursor-pointer"
      >
        <img
          src={product.image || '/icons/logo.svg'}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.src = '/icons/logo.svg';
          }}
        />

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 bg-[#0f382c]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="px-3 py-1.5 bg-white/95 text-[#0f382c] rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#1b4332]" />
            <span>View Gallery</span>
          </span>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start pointer-events-none">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0f382c] text-[#d4af37] shadow-sm border border-[#d4af37]/30 tracking-wide uppercase">
            {product.category || 'Snack'}
          </span>
          {(product.isDemoProduct || product.isDemoPrice) && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#faf5dc] text-[#996515] border border-[#e5c07b] shadow-xs">
              Demo Product
            </span>
          )}
        </div>

        {/* Stock Badge for Active Unit */}
        <div className="absolute top-2.5 right-2.5 pointer-events-none">
          {isOutOfStock ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 shadow-xs">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fef8ea] text-[#92400e] border border-[#fde68a] animate-pulse">
              Only {activeStock} left
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#e8f5e9] text-[#1b4332] border border-[#c8e6c9]">
              In Stock ({activeStock})
            </span>
          )}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 
            onClick={() => onOpenDetails && onOpenDetails(product)}
            className="font-bold text-[#0f382c] text-base leading-snug hover:text-[#2d6a4f] cursor-pointer transition-colors line-clamp-1"
          >
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description || 'Freshly made authentic traditional snack prepared with natural ingredients.'}
          </p>

          {/* Dual Unit Selector (Packet vs Kg) */}
          <div className="mt-3 bg-[#fdfbf7] p-1 rounded-2xl border border-[#c5a059]/30 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedUnit('packet')}
              className={`flex-1 py-1 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                !isKg
                  ? 'bg-[#1b4332] text-[#d4af37] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Packet ({packetWeight})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedUnit('kg')}
              className={`flex-1 py-1 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                isKg
                  ? 'bg-[#1b4332] text-[#d4af37] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Per Kg</span>
            </button>
          </div>
        </div>

        {/* Pricing & Add/Quantity Actions */}
        <div className="mt-4 pt-3 border-t border-[#c5a059]/15 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              {isKg ? 'Price / Kg' : `Price / ${packetWeight}`}
            </div>
            <div className="text-xl font-black text-[#0f382c] tracking-tight">
              ₹{activePrice}
            </div>
          </div>

          <div>
            {isOutOfStock ? (
              <button
                disabled
                className="px-3.5 py-2 bg-slate-100 text-slate-400 text-xs font-bold rounded-full cursor-not-allowed border border-slate-200"
              >
                Out of Stock
              </button>
            ) : inCartQty > 0 ? (
              /* Inline Quantity Selector */
              <div className="flex items-center gap-1.5 bg-[#f4ede2] border border-[#c5a059]/50 rounded-full p-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(cartItemId, inCartQty - 1)}
                  className="w-7 h-7 flex items-center justify-center bg-white text-[#0f382c] rounded-full shadow-sm hover:bg-[#e8dcce] active:scale-95 transition-all"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-black text-[#0f382c]">
                  {inCartQty}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (canAddMore) {
                      onUpdateQuantity(cartItemId, inCartQty + 1);
                    }
                  }}
                  disabled={!canAddMore}
                  className={`w-7 h-7 flex items-center justify-center rounded-full shadow-sm transition-all ${
                    canAddMore
                      ? 'bg-[#1b4332] text-[#d4af37] hover:bg-[#0f382c] active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                  aria-label="Increase quantity"
                  title={!canAddMore ? 'Maximum available stock reached' : ''}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* Action Buttons: Add to Cart and Buy */
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex items-center gap-1 px-3 py-2 bg-[#f4ede2] hover:bg-[#e8dcce] text-[#0f382c] border border-[#c5a059]/40 active:scale-95 text-xs font-black rounded-full transition-all shadow-xs"
                  title="Add selected unit to shopping cart"
                >
                  <Plus className="w-3.5 h-3.5 text-[#1b4332]" />
                  <span>Add</span>
                </button>
                <button
                  type="button"
                  onClick={handleBuy}
                  className="px-3.5 py-2 bg-[#1b4332] hover:bg-[#0f382c] active:scale-95 text-[#d4af37] text-xs font-black rounded-full shadow-md shadow-[#0f382c]/20 transition-all border border-[#d4af37]/40"
                  title="Order immediately with 1-click checkout"
                >
                  Buy
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
