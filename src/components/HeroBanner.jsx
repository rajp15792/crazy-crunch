import React from 'react';
import { Sparkles, Truck, ShieldCheck, Flame, ChevronRight } from 'lucide-react';

export default function HeroBanner({
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenAbout
}) {
  return (
    <div className="mb-5 space-y-3">
      {/* Top micro-ticker / Quick perks row with About link */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto py-1 px-1 text-[11px] text-slate-600 font-semibold scrollbar-none">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="flex items-center gap-1 text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200/60">
            <Truck className="w-3.5 h-3.5 text-orange-600" />
            <span>Free Delivery on ₹299+</span>
          </span>
          <span className="flex items-center gap-1 text-slate-700 bg-white px-2.5 py-1 rounded-full border border-slate-200/80 hidden sm:inline-flex">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cash on Delivery</span>
          </span>
          <span className="flex items-center gap-1 text-slate-700 bg-white px-2.5 py-1 rounded-full border border-slate-200/80 hidden md:inline-flex">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>100% Fresh Homemade</span>
          </span>
        </div>

        {onOpenAbout && (
          <button
            onClick={onOpenAbout}
            className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-bold bg-white px-3 py-1 rounded-full border border-orange-200/80 hover:bg-orange-50 transition-colors shrink-0 text-[11px]"
          >
            <Sparkles className="w-3 h-3 text-orange-500" />
            <span>About Us & Promise</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Category Pills Slider Directly Above Products */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25 scale-[1.02]'
                  : 'bg-white text-slate-700 hover:bg-orange-50 hover:text-orange-700 border border-slate-200/80'
              }`}
            >
              {cat.label}
              {cat.count !== undefined && (
                <span
                  className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-orange-700 text-orange-100 font-black' : 'bg-slate-100 text-slate-500'
                  }`}
                >
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
