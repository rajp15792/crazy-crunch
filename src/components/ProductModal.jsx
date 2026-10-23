import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';

const PRESET_IMAGES = [
  { label: 'Chakli', url: '/images/chakli.svg' },
  { label: 'Mini Stuffed', url: '/images/mini-stuffed.svg' },
  { label: 'Crispy Sev', url: '/images/sev.svg' },
  { label: 'Mamra Laddu', url: '/images/mamra-laddu.svg' },
  { label: 'Coconut Biscuits', url: '/images/coconut-biscuits.svg' },
  { label: 'Crispy Khari', url: '/images/khari.svg' },
  { label: 'Dry Fruit Laddu', url: '/images/dryfruit-laddu.svg' },
  { label: 'Crazy Crunch Logo', url: '/icons/icon-192.svg' }
];

export default function ProductModal({ isOpen, onClose, product, onSave }) {
  if (!isOpen) return null;

  const isEditing = Boolean(product && product.id);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Crispy Savouries',
    price: 50,
    weight: '200 g',
    stock: 25,
    description: '',
    image: '/images/chakli.svg',
    isPublished: true,
    isDemoPrice: true
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || 'Crispy Savouries',
        price: product.price !== undefined ? product.price : 50,
        weight: product.weight || '200 g',
        stock: product.stock !== undefined ? product.stock : 25,
        description: product.description || '',
        image: product.image || '/images/chakli.svg',
        isPublished: product.isPublished !== undefined ? product.isPublished : true,
        isDemoPrice: product.isDemoPrice !== undefined ? product.isDemoPrice : false
      });
    } else {
      setFormData({
        name: '',
        category: 'Crispy Savouries',
        price: 50,
        weight: '200 g',
        stock: 25,
        description: '',
        image: '/images/chakli.svg',
        isPublished: true,
        isDemoPrice: false
      });
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter a product name.');
      return;
    }
    if (formData.price === undefined || formData.price < 0) {
      setError('Please enter a valid price.');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8 border border-orange-100 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Snack Product' : 'Add New Snack Product'}
            </h3>
            <p className="text-xs text-slate-500">Update pricing, weight, stock, and photos</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Form */}
        <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Snack / Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Special Chakli"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              >
                <option value="Crispy Savouries">Crispy Savouries</option>
                <option value="Traditional Sweets">Traditional Sweets</option>
                <option value="Bakery & Biscuits">Bakery & Biscuits</option>
                <option value="Festive Special">Festive Special</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pack Weight
              </label>
              <input
                type="text"
                placeholder="e.g. 200 g or 250 g"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Stock Quantity (Packs)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Fresh homemade snacks description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white resize-none"
            ></textarea>
          </div>

          {/* Product Image Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Choose Product Image / Vector Artwork
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {PRESET_IMAGES.map((preset) => (
                <button
                  type="button"
                  key={preset.url}
                  onClick={() => setFormData({ ...formData, image: preset.url })}
                  className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    formData.image === preset.url
                      ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-10 h-10 object-contain rounded-lg" />
                  <span className="text-[9px] font-semibold text-slate-700 truncate w-full text-center">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Or custom image URL (e.g. /images/your-snack.jpg)"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-mono"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 text-orange-600 rounded accent-orange-600 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800">
                Published (Visible in customer catalogue)
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDemoPrice}
                onChange={(e) => setFormData({ ...formData, isDemoPrice: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded accent-amber-600 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-600">
                Mark as "Demo Price" badge
              </span>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-600/20"
          >
            {isEditing ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
