import React from 'react';
import { ShoppingBag, Search, Download, ShieldCheck, X } from 'lucide-react';

export default function Navbar({
  cartCount,
  onOpenCart,
  onOpenInstall,
  isInstallable,
  onOpenOwner,
  isOwnerLoggedIn,
  searchQuery,
  setSearchQuery
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Brand Logo & Tagline */}
          <a href="#" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative">
              <img
                src="/icons/icon-192.svg"
                alt="Crazy Crunch Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl shadow-sm group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" title="Store Open"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight brand-font group-hover:text-orange-600 transition-colors">
                  CRAZY <span className="text-orange-600">CRUNCH</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-amber-700 font-semibold tracking-wide uppercase hidden sm:block">
                Fresh Homemade Snacks
              </p>
            </div>
          </a>

          {/* Search Bar - Hidden on extra small mobile, visible in sub-bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chakli, sev, khari, laddus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Install PWA Button */}
            <button
              onClick={onOpenInstall}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-full text-xs sm:text-sm font-bold border border-orange-200 transition-all hover:shadow-sm"
              title="Install Crazy Crunch on your phone"
            >
              <Download className="w-4 h-4 text-orange-600 shrink-0" />
              <span className="hidden sm:inline">Install App</span>
              <span className="sm:hidden font-bold">Install</span>
            </button>

            {/* Owner Portal Link */}
            <button
              onClick={onOpenOwner}
              className={`p-2 sm:px-3 sm:py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isOwnerLoggedIn
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
              title={isOwnerLoggedIn ? "Owner Dashboard Active" : "Owner Login"}
            >
              <ShieldCheck className={`w-4 h-4 ${isOwnerLoggedIn ? 'text-amber-700' : 'text-slate-500'}`} />
              <span className="hidden lg:inline">{isOwnerLoggedIn ? 'Dashboard' : 'Owner'}</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white rounded-full text-sm font-bold shadow-md shadow-orange-600/20 transition-all"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-black bg-white text-orange-700 rounded-full shadow-inner animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row (Under 768px) */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search crispy chakli, sev, laddus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
