import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Check, ShieldCheck, Heart, Sparkles, MapPin } from 'lucide-react';

export default function CustomerProductModal({
  isOpen,
  onClose,
  product,
  cart = [],
  onAddToCart,
  onUpdateQuantity,
  onBuyNow
}) {
  if (!isOpen || !product) return null;

  // Active gallery photo index
  const gallery = Array.isArray(product.gallery) && product.gallery.length > 0
    ? product.gallery
    : [product.image || '/icons/logo.svg'];
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Selected selling unit ('packet' or 'kg')
  const [selectedUnit, setSelectedUnit] = useState('packet');
  const [localQty, setLocalQty] = useState(1);

  const packetPrice = product.pricePacket !== undefined ? product.pricePacket : (product.price || 50);
  const packetWeight = product.packetWeight || product.weight || '250 g';
  const packetStock = product.stockPacket !== undefined ? product.stockPacket : (product.stock || 0);

  const kgPrice = product.priceKg !== undefined ? product.priceKg : (packetPrice * 2);
  const kgStock = product.stockKg !== undefined ? product.stockKg : Math.floor(packetStock / 2);

  const isKg = selectedUnit === 'kg';
  const activePrice = isKg ? kgPrice : packetPrice;
  const activeStock = isKg ? kgStock : packetStock;
  const activeWeight = isKg ? '1 kg' : packetWeight;

  const isOutOfStock = activeStock <= 0;
  const lineTotal = activePrice * localQty;

  const handleAddToCart = () => {
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
    }, localQty);
    onClose();
  };

  const handleBuyNow = () => {
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
      }, localQty);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative my-8 border border-[#c5a059]/30 overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 bg-white/90 text-slate-500 hover:text-slate-900 rounded-full shadow-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Photo Gallery */}
        <div className="md:w-1/2 bg-gradient-to-b from-[#fdfbf7] to-[#f4ede2] p-4 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-[#c5a059]/20">
          <div className="w-full aspect-square relative flex items-center justify-center p-2">
            <img
              src={gallery[activePhotoIndex] || product.image || '/icons/logo.svg'}
              alt={product.name}
              className="w-full h-full object-contain rounded-2xl drop-shadow-md transition-all duration-300"
              onError={(e) => { e.target.src = '/icons/logo.svg'; }}
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0f382c] text-[#d4af37] shadow-sm uppercase tracking-wider">
                {product.category || 'Food Product'}
              </span>
              {(product.isDemoProduct || product.isDemoPrice) && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#faf5dc] text-[#996515] border border-[#e5c07b]">
                  Demo Product
                </span>
              )}
            </div>
          </div>

          {/* Gallery Thumbnails */}
          {gallery.length > 1 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto max-w-full pb-1">
              {gallery.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activePhotoIndex === idx
                      ? 'border-[#1b4332] scale-105 shadow-sm'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details & Unit Selection */}
        <div className="md:w-1/2 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#1b4332] tracking-wider uppercase">
                Crazy Crunch Specialty
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#0f382c] tracking-tight">
                {product.name}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description || 'Authentic traditional food product prepared with highest quality ingredients and hygienic standards.'}
            </p>

            {/* Selling Unit Selection */}
            <div>
              <label className="block text-xs font-bold text-[#0f382c] uppercase tracking-wider mb-2">
                Select Selling Unit:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setSelectedUnit('packet'); setLocalQty(1); }}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    !isKg
                      ? 'border-[#1b4332] bg-[#f4ede2] shadow-sm'
                      : 'border-slate-200 hover:border-[#c5a059]/40'
                  }`}
                >
                  <div className="text-xs font-bold text-[#0f382c]">Packet ({packetWeight})</div>
                  <div className="text-sm font-black text-[#1b4332]">₹{packetPrice}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {packetStock > 0 ? `${packetStock} packets available` : 'Out of stock'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedUnit('kg'); setLocalQty(1); }}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    isKg
                      ? 'border-[#1b4332] bg-[#f4ede2] shadow-sm'
                      : 'border-slate-200 hover:border-[#c5a059]/40'
                  }`}
                >
                  <div className="text-xs font-bold text-[#0f382c]">Per Kilogram (1 kg)</div>
                  <div className="text-sm font-black text-[#1b4332]">₹{kgPrice}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {kgStock > 0 ? `${kgStock} kg available` : 'Out of stock'}
                  </div>
                </button>
              </div>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div>
                <label className="block text-xs font-bold text-[#0f382c] uppercase tracking-wider mb-2">
                  Select Quantity:
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-[#fdfbf7] border border-[#c5a059]/50 rounded-2xl p-1 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setLocalQty(Math.max(1, localQty - 1))}
                      disabled={localQty <= 1}
                      className="w-8 h-8 flex items-center justify-center bg-white text-[#0f382c] rounded-xl shadow-xs disabled:opacity-40"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-black text-sm text-[#0f382c]">
                      {localQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLocalQty(Math.min(activeStock, localQty + 1))}
                      disabled={localQty >= activeStock}
                      className="w-8 h-8 flex items-center justify-center bg-[#1b4332] text-[#d4af37] rounded-xl shadow-xs disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-slate-500">
                    Total: <strong className="text-sm text-[#0f382c] font-black">₹{lineTotal}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Kolhapur Delivery Info */}
            <div className="p-2.5 bg-[#fdfbf7] border border-[#c5a059]/30 rounded-2xl flex items-center gap-2 text-xs text-[#0f382c]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Free Delivery (₹0)</strong> across Kolhapur • Cash on Delivery</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#c5a059]/20 flex items-center gap-2.5 mt-4">
            {isOutOfStock ? (
              <button
                disabled
                className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-2xl text-xs cursor-not-allowed"
              >
                Selected Unit Out of Stock
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-4 bg-[#f4ede2] hover:bg-[#e8dcce] text-[#0f382c] font-black text-xs rounded-2xl border border-[#c5a059]/40 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4 text-[#1b4332]" />
                  <span>Add to Cart (₹{lineTotal})</span>
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 py-3 px-4 bg-[#1b4332] hover:bg-[#0f382c] text-[#d4af37] font-black text-xs rounded-2xl shadow-md shadow-[#0f382c]/20 border border-[#d4af37]/40 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span>Buy Now</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
