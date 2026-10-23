import React from 'react';
import { Sparkles, Truck, ShieldCheck, Flame, Info } from 'lucide-react';

export default function HeroBanner({
  categories,
  selectedCategory,
  onSelectCategory
}) {
  return (
    <div className="relative overflow-hidden mb-8">
      {/* Background Graphic */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-3 text-orange-50">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            100% Authentic Homemade Taste
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-3">
            Pure Crunch. Irresistible Taste. <br className="hidden sm:inline" />
            <span className="text-yellow-200">Fresh To Your Doorstep!</span>
          </h1>

          <p className="text-orange-100 text-sm sm:text-base mb-6 max-w-xl font-normal leading-relaxed">
            Handcrafted Indian festive snacks, traditional laddus, and golden savouries. 
            Prepared fresh in small batches with pure ingredients.
          </p>

          {/* Quick Perks */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-2 bg-black/15 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/10">
              <Truck className="w-4 h-4 text-yellow-300 shrink-0" />
              <span>Free Delivery on ₹299+</span>
            </div>
            <div className="flex items-center gap-2 bg-black/15 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/10">
              <ShieldCheck className="w-4 h-4 text-yellow-300 shrink-0" />
              <span>Cash on Delivery</span>
            </div>
            <div className="flex items-center gap-2 bg-black/15 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
              <Flame className="w-4 h-4 text-yellow-300 shrink-0" />
              <span>Always Freshly Packed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo notice banner */}
      <div className="mt-4 px-4 py-2.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Note:</strong> Catalog displays editable temporary demo prices. The store owner can update prices and stock anytime via the Owner Panel.
          </span>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25 scale-105'
                  : 'bg-white text-slate-700 hover:bg-orange-50 hover:text-orange-700 border border-slate-200/80'
              }`}
            >
              {cat.label}
              {cat.count !== undefined && (
                <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-orange-700 text-orange-100' : 'bg-slate-100 text-slate-500'}`}>
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
