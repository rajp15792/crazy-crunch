import React from 'react';
import ProductCard from './ProductCard';
import { Search, SearchX, X, SlidersHorizontal, Sparkles, Info } from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Products' },
  { id: 'Khari', label: 'Khari' },
  { id: 'Toast', label: 'Toast' },
  { id: 'Cookies', label: 'Cookies' },
  { id: 'Farsan', label: 'Farsan' },
  { id: 'Other Products', label: 'Other Products' }
];

export default function ProductList({
  products = [],
  loading = false,
  cart = [],
  onAddToCart,
  onUpdateQuantity,
  onBuyNow,
  onOpenDetails,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  onClearFilters
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-3xl p-4 border border-[#c5a059]/20 shadow-sm animate-pulse space-y-3">
            <div className="aspect-[4/3] bg-slate-200 rounded-2xl"></div>
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-5 bg-slate-200 rounded w-3/4"></div>
            <div className="h-8 bg-slate-200 rounded-full w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  // Check if any demo products are present
  const hasDemoProducts = products.some((p) => p.isDemoProduct || p.isDemoPrice);

  return (
    <div className="space-y-4">
      
      {/* 2 & 3. Search Bar, Product Categories & Sorting Controls Immediately Below Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#c5a059]/30 shadow-sm space-y-3.5">
        
        {/* Row 1: Search Bar & Sorting Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#1b4332] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by product name (e.g. Milk Toast, Maska Khari, Cookies, Farsan)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 sm:py-3 bg-[#fdfbf7] border border-[#c5a059]/40 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b4332] focus:bg-white transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex items-center w-full sm:w-auto">
              <SlidersHorizontal className="w-4 h-4 text-[#1b4332] absolute left-3.5 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-9 py-2.5 sm:py-3 bg-[#fdfbf7] border border-[#c5a059]/40 rounded-2xl text-xs font-bold text-[#0f382c] hover:bg-[#f9f6f0] focus:outline-none focus:ring-2 focus:ring-[#1b4332] cursor-pointer transition-all shadow-xs"
              >
                <option value="featured">Default Order</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Product Name: A–Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Product Categories Bar Immediately Below Search */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-[#1b4332] text-[#d4af37] shadow-md border border-[#d4af37]/40'
                    : 'bg-[#fdfbf7] text-slate-600 hover:bg-[#f4ede2] border border-[#c5a059]/25 hover:text-[#0f382c]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Demo Products Informational Notice (Section 3) */}
      {hasDemoProducts && (
        <div className="bg-[#fef8ea] border border-[#fde68a] rounded-2xl p-3 flex items-start gap-2.5 text-xs text-[#92400e] shadow-xs">
          <Info className="w-4 h-4 text-[#b45309] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold">Illustrative Demo Products:</strong> Four editable demo snacks (Milk Toast, Maska Khari, Milk Cookies, Farsan Mix) are seeded to preview the website layout. Every field, price, and photo is editable or replaceable through the Owner Dashboard.
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[#0f382c] tracking-tight">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : selectedCategory !== 'all'
              ? `${selectedCategory} Collection`
              : 'Product Catalogue'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Available in per kg and packet selling units • Free delivery in Kolhapur
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#0f382c] font-bold bg-[#f4ede2] px-3 py-1 rounded-full border border-[#c5a059]/30 shadow-xs">
            {products.length} {products.length === 1 ? 'item' : 'items'}
          </span>
          {(searchQuery || selectedCategory !== 'all' || sortBy !== 'featured') && (
            <button
              onClick={onClearFilters}
              className="text-xs text-emerald-800 hover:text-red-600 font-bold underline transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 5. Product Catalogue Directly Below */}
      {products.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#c5a059]/20 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 bg-[#f4ede2] text-[#1b4332] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#c5a059]/30">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#0f382c] mb-1">No matching products found</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            {searchQuery
              ? `No products found matching "${searchQuery}". Try searching for Khari, Toast, Cookies, or Farsan.`
              : 'No products are currently available in this selected category.'}
          </p>
          <button
            onClick={onClearFilters}
            className="px-5 py-2.5 bg-[#1b4332] hover:bg-[#0f382c] text-[#d4af37] rounded-full text-xs font-bold transition-all shadow-md shadow-[#0f382c]/20 border border-[#d4af37]/40"
          >
            Clear Filters & View All
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              cart={cart}
              onAddToCart={onAddToCart}
              onUpdateQuantity={onUpdateQuantity}
              onBuyNow={onBuyNow}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}
