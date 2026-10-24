import React from 'react';
import { X, Sparkles, Heart, ShieldCheck, Flame, Truck, Phone, MapPin } from 'lucide-react';

export default function AboutUsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8 border border-orange-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <img src="/icons/icon-192.svg" alt="Crazy Crunch" className="w-9 h-9 rounded-xl shadow-sm" />
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">About Crazy Crunch</h3>
              <p className="text-[11px] text-orange-600 font-bold uppercase tracking-wider">Crunch in Every Munch!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-slate-600 leading-relaxed pr-1">
          
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200/80 rounded-2xl p-4 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-orange-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span>100% Authentic Homemade</span>
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Pure Ingredients. Traditional Recipes. Handcrafted with Care.
            </h4>
            <p>
              Crazy Crunch is dedicated to bringing the authentic taste of festive Indian snacks and traditional savouries straight to your home. Prepared in hygienic small batches, our snacks deliver that nostalgic crunch you love.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Truck className="w-4 h-4 text-orange-600" />
                <span>Fast Delivery</span>
              </div>
              <p className="text-[11px] text-slate-500">Free delivery on orders above ₹299 across the local area.</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cash on Delivery</span>
              </div>
              <p className="text-[11px] text-slate-500">Inspect your snacks and pay cash at your doorstep.</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>Always Fresh</span>
              </div>
              <p className="text-[11px] text-slate-500">Packed in airtight food-grade packs to retain maximum crispiness.</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Zero Preservatives</span>
              </div>
              <p className="text-[11px] text-slate-500">No harmful chemical preservatives or artificial food colors.</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2">
            <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Contact & Bulk Orders</h5>
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-3.5 h-3.5 text-orange-600" />
              <span>WhatsApp / Call: <strong>+91 98765 43210</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              <span>Fresh Snack Kitchen, Main Market Road</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
