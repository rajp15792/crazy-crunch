import React from 'react';
import ProductCard from './ProductCard';
import { Search, SearchX, X, SlidersHorizontal, Sparkles } from 'lucide-react';

const POPULAR_SEARCHES = ['Chakli', 'Sev', 'Khari', 'Mamra Laddu', 'Coconut Biscuits', 'Dry Fruit Laddu'];

export default function ProductList({
  products,
  loading,
  cart,
  onAddToCart,
  onUpdateQuantity,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  onClearFilters
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm animate-pulse space-y-3">
            <div className="aspect-[4/3] bg-slate-200 rounded-2xl"></div>
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-5 bg-slate-200 rounded w-3/4"></div>
            <div className="h-3 bg-slate-200 rounded w-full"></div>
            <div className="h-8 bg-slate-200 rounded-full w-full pt-2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Search Product Bar & Quick Filters */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-orange-100 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Main Search Product Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-orange-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products (e.g. Chakli, Sev, Khari, Laddu, 200 g)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all shadow-inner"
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

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex items-center">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-9 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer transition-all"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Popular Search Suggestions */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-orange-500" />
            Popular:
          </span>
          {POPULAR_SEARCHES.map((term) => {
            const isActive = searchQuery.toLowerCase() === term.toLowerCase();
            return (
              <button
                key={term}
                onClick={() => setSearchQuery(isActive ? '' : term)}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all shrink-0 ${
                  isActive
                    ? 'bg-orange-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-700'
                }`}
              >
                {term}
              </button>
            );
          })}
        </div>
      </div>

      {/* Header with Results Count */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Fresh Snacks & Savouries'}
          </h2>
          {searchQuery && (
            <p className="text-xs text-orange-600 font-semibold mt-0.5">
              Showing matching products
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-sm">
            {products.length} {products.length === 1 ? 'snack' : 'snacks'}
          </span>
          {searchQuery && (
            <button
              onClick={onClearFilters}
              className="text-xs text-slate-400 hover:text-red-500 font-semibold underline transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Products Grid or Empty State */}
      {products.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-100 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No matching snacks found</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            {searchQuery
              ? `We couldn't find any snack matching "${searchQuery}". Try searching for Chakli, Sev, Khari, or Laddus.`
              : 'No products are currently available in this category.'}
          </p>
          <button
            onClick={onClearFilters}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-orange-600/20"
          >
            Clear Search & View All
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product) => {
            const cartItem = cart.find((item) => item.id === product.id);
            return (
              <ProductCard
                key={product.id}
                product={product}
                cartItem={cartItem}
                onAddToCart={onAddToCart}
                onUpdateQuantity={onUpdateQuantity}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
