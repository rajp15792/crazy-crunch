import React from 'react';
import ProductCard from './ProductCard';
import { SearchX } from 'lucide-react';

export default function ProductList({
  products,
  loading,
  cart,
  onAddToCart,
  onUpdateQuantity,
  searchQuery,
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

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-100 shadow-sm max-w-lg mx-auto">
        <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">No matching snacks found</h3>
        <p className="text-sm text-slate-500 mb-6">
          {searchQuery
            ? `We couldn't find anything matching "${searchQuery}". Try searching for chakli, sev, or laddus.`
            : 'No products are currently available in this category.'}
        </p>
        <button
          onClick={onClearFilters}
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-orange-600/20"
        >
          View All Snacks
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Available Savouries & Snacks
        </h2>
        <span className="text-xs text-slate-500 font-semibold">
          {products.length} {products.length === 1 ? 'snack' : 'snacks'} found
        </span>
      </div>

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
    </div>
  );
}
