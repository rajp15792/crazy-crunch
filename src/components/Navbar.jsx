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
    <header className="sticky top-0 z-40 bg-[#0f382c] border-b border-[#c5a059]/30 shadow-md transition-all text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Brand Logo & Compact Header */}
          <a href="#" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative">
              <img
                src="/icons/logo.svg"
                alt="Crazy Crunch Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl shadow-md border border-[#d4af37]/40 group-hover:scale-105 transition-transform bg-[#1b4332]"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#0f382c] rounded-full" title="Store Open"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight brand-font group-hover:text-[#d4af37] transition-colors">
                  CRAZY <span className="text-[#d4af37]">CRUNCH</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#e5c07b] font-medium tracking-wider uppercase hidden sm:block">
                Khari • Toast • Cookies • Farsan
              </p>
            </div>
          </a>

          {/* Search Bar (Desktop / Tablet) */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-[#e5c07b] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search khari, toast, cookies, farsan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 bg-[#1b4332]/90 border border-[#c5a059]/40 rounded-full text-sm text-white placeholder-emerald-200/70 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:bg-[#1b4332] transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-emerald-200 hover:text-white rounded-full"
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
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-[#fdfbf7] rounded-full text-xs sm:text-sm font-bold border border-[#c5a059]/40 transition-all hover:shadow-sm"
              title="Install Crazy Crunch on your phone"
            >
              <Download className="w-4 h-4 text-[#d4af37] shrink-0" />
              <span className="hidden sm:inline">Install App</span>
              <span className="sm:hidden font-bold">Install</span>
            </button>

            {/* Owner Portal Link */}
            <button
              onClick={onOpenOwner}
              className={`p-2 sm:px-3 sm:py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isOwnerLoggedIn
                  ? 'bg-[#d4af37] text-[#0f382c] border border-[#d4af37] font-bold shadow-sm'
                  : 'text-emerald-100 hover:text-white hover:bg-[#1b4332]'
              }`}
              title={isOwnerLoggedIn ? "Owner Dashboard Active" : "Owner Login"}
            >
              <ShieldCheck className={`w-4 h-4 ${isOwnerLoggedIn ? 'text-[#0f382c]' : 'text-[#d4af37]'}`} />
              <span className="hidden lg:inline">{isOwnerLoggedIn ? 'Dashboard' : 'Owner'}</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#d4af37] hover:bg-[#c5a059] active:scale-95 text-[#0f382c] rounded-full text-sm font-black shadow-md shadow-black/20 transition-all"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#0f382c]" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-black bg-[#0f382c] text-[#d4af37] rounded-full shadow-inner animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row (Under 768px) */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-[#e5c07b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search khari, toast, cookies, farsan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-[#1b4332]/90 border border-[#c5a059]/40 rounded-full text-sm text-white placeholder-emerald-200/70 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:bg-[#1b4332] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-emerald-200 hover:text-white rounded-full"
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
