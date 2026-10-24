import React, { useState, useEffect, useRef } from 'react';
import { X, Check, AlertCircle, Image as ImageIcon, Upload, Loader2, Trash2, Star, ArrowLeft, ArrowRight, Plus } from 'lucide-react';

const DEFAULT_CATEGORIES = ['Khari', 'Toast', 'Cookies', 'Farsan', 'Other Products'];

export default function ProductModal({ isOpen, onClose, product, onSave, token }) {
  if (!isOpen) return null;

  const isEditing = Boolean(product && product.id);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Khari',
    description: '',
    image: '/icons/logo.svg',
    gallery: ['/icons/logo.svg'],
    priceKg: 120,
    stockKg: 20,
    pricePacket: 35,
    packetWeight: '250 g',
    stockPacket: 40,
    isPublished: true,
    isDemoProduct: false,
    displayOrder: 1
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      const galleryList = Array.isArray(product.gallery) && product.gallery.length > 0
        ? product.gallery
        : (product.image ? [product.image] : ['/icons/logo.svg']);

      setFormData({
        name: product.name || '',
        category: product.category || 'Khari',
        description: product.description || '',
        image: product.image || galleryList[0] || '/icons/logo.svg',
        gallery: galleryList,
        priceKg: product.priceKg !== undefined ? product.priceKg : (product.price ? product.price * 2 : 120),
        stockKg: product.stockKg !== undefined ? product.stockKg : Math.floor((product.stock || 40) / 2),
        pricePacket: product.pricePacket !== undefined ? product.pricePacket : (product.price || 50),
        packetWeight: product.packetWeight || product.weight || '250 g',
        stockPacket: product.stockPacket !== undefined ? product.stockPacket : (product.stock || 30),
        isPublished: product.isPublished !== undefined ? Boolean(product.isPublished) : true,
        isDemoProduct: Boolean(product.isDemoProduct),
        displayOrder: product.displayOrder || 1
      });
    } else {
      setFormData({
        name: '',
        category: 'Khari',
        description: '',
        image: '/icons/logo.svg',
        gallery: ['/icons/logo.svg'],
        priceKg: 120,
        stockKg: 20,
        pricePacket: 35,
        packetWeight: '250 g',
        stockPacket: 40,
        isPublished: true,
        isDemoProduct: false,
        displayOrder: 1
      });
    }
  }, [product]);

  // Handle Photo Upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadError('');
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];

    for (const file of files) {
      if (!allowed.includes(file.type) && !/jpeg|jpg|png|webp|svg/.test(file.name.toLowerCase())) {
        setUploadError('Invalid format. Please upload JPG, PNG, or WebP images only.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`Photo "${file.name}" exceeds the maximum 5 MB file size limit.`);
        return;
      }
    }

    setUploading(true);
    try {
      const activeToken = token || localStorage.getItem('cc_admin_token') || '';
      const newUrls = [];

      for (const file of files) {
        const data = new FormData();
        data.append('photo', file);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${activeToken}` },
          body: data
        });

        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Failed to upload photo.');
        }
        newUrls.push(result.url);
      }

      setFormData((prev) => {
        // Remove default placeholder if adding real photos
        const currentGallery = prev.gallery.filter((img) => img !== '/icons/logo.svg');
        const updatedGallery = [...currentGallery, ...newUrls];
        return {
          ...prev,
          gallery: updatedGallery,
          image: prev.image === '/icons/logo.svg' || !prev.image ? newUrls[0] : prev.image
        };
      });
    } catch (err) {
      setUploadError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Set Primary Photo
  const handleSetPrimary = (photoUrl) => {
    setFormData((prev) => ({
      ...prev,
      image: photoUrl
    }));
  };

  // Delete Photo from Gallery
  const handleDeletePhoto = (idx) => {
    setFormData((prev) => {
      const filtered = prev.gallery.filter((_, i) => i !== idx);
      const safeGallery = filtered.length > 0 ? filtered : ['/icons/logo.svg'];
      return {
        ...prev,
        gallery: safeGallery,
        image: prev.image === prev.gallery[idx] ? safeGallery[0] : prev.image
      };
    });
  };

  // Reorder Gallery Photo
  const handleMovePhoto = (idx, direction) => {
    setFormData((prev) => {
      const gallery = [...prev.gallery];
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= gallery.length) return prev;

      const temp = gallery[idx];
      gallery[idx] = gallery[targetIdx];
      gallery[targetIdx] = temp;
      return { ...prev, gallery };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Product name is required.');
      return;
    }

    onSave({
      ...formData,
      name: formData.name.trim(),
      priceKg: Number(formData.priceKg),
      stockKg: Number(formData.stockKg),
      pricePacket: Number(formData.pricePacket),
      stockPacket: Number(formData.stockPacket),
      displayOrder: Number(formData.displayOrder) || 1
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative my-8 border border-[#c5a059]/30 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-[#0f382c] tracking-tight">
              {isEditing ? `Edit "${formData.name || 'Product'}"` : 'Add New Product'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure dual selling units (kg & packet), multi-photo gallery, and stocks.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#0f382c] uppercase tracking-wider mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Milk Toast, Maska Khari"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#c5a059]/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0f382c] uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#c5a059]/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0f382c] uppercase tracking-wider mb-1">
                Product Description
              </label>
              <textarea
                rows={2}
                placeholder="Fresh ingredients, crispy texture, authentic baking recipe..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#c5a059]/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4332] resize-none"
              ></textarea>
            </div>

            {/* Photo Gallery Manager (Section 4) */}
            <div className="p-3.5 bg-[#fdfbf7] border border-[#c5a059]/30 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-[#0f382c] uppercase tracking-wider">
                    Product Photos & Gallery
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Upload new photos, set primary image, or reorder gallery. Max 5 MB (JPG, PNG, WebP).
                  </p>
                </div>

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-3 py-1.5 bg-[#1b4332] hover:bg-[#0f382c] text-[#d4af37] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photos</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {uploadError && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded-xl">
                  {uploadError}
                </div>
              )}

              {/* Gallery Previews Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {formData.gallery.map((photoUrl, idx) => {
                  const isPrimary = formData.image === photoUrl;
                  return (
                    <div
                      key={idx}
                      className={`relative rounded-xl border-2 p-1.5 bg-white transition-all group ${
                        isPrimary ? 'border-[#1b4332] shadow-sm' : 'border-slate-200'
                      }`}
                    >
                      <img
                        src={photoUrl}
                        alt=""
                        className="w-full h-20 object-contain rounded-lg"
                        onError={(e) => { e.target.src = '/icons/logo.svg'; }}
                      />

                      {/* Primary Badge / Action */}
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        {isPrimary ? (
                          <span className="flex items-center gap-1 text-[#1b4332] font-black">
                            <Star className="w-3 h-3 fill-[#d4af37] text-[#d4af37]" />
                            Primary
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(photoUrl)}
                            className="text-slate-500 hover:text-[#1b4332] font-semibold underline"
                          >
                            Set Primary
                          </button>
                        )}

                        {/* Move & Delete Actions */}
                        <div className="flex items-center gap-1">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMovePhoto(idx, -1)}
                              className="p-0.5 text-slate-400 hover:text-slate-700"
                              title="Move left"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {idx < formData.gallery.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMovePhoto(idx, 1)}
                              className="p-0.5 text-slate-400 hover:text-slate-700"
                              title="Move right"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(idx)}
                            className="p-0.5 text-red-500 hover:text-red-700 ml-0.5"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selling Unit 1: Packet Configuration */}
            <div className="p-3.5 bg-white border border-[#c5a059]/30 rounded-2xl space-y-2.5">
              <h4 className="text-xs font-black text-[#0f382c] uppercase tracking-wider flex items-center gap-1.5">
                <span>Selling Unit 1: Packet</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Packet Weight *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 250 g, 500 g"
                    value={formData.packetWeight}
                    onChange={(e) => setFormData({ ...formData, packetWeight: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fdfbf7] border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Packet Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.pricePacket}
                    onChange={(e) => setFormData({ ...formData, pricePacket: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fdfbf7] border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Available Stock (Packets) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stockPacket}
                    onChange={(e) => setFormData({ ...formData, stockPacket: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fdfbf7] border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Selling Unit 2: Kilogram (Kg) Configuration */}
            <div className="p-3.5 bg-white border border-[#c5a059]/30 rounded-2xl space-y-2.5">
              <h4 className="text-xs font-black text-[#0f382c] uppercase tracking-wider flex items-center gap-1.5">
                <span>Selling Unit 2: Kilogram (Per Kg)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Price Per Kg (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.priceKg}
                    onChange={(e) => setFormData({ ...formData, priceKg: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fdfbf7] border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Available Stock in Kg *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stockKg}
                    onChange={(e) => setFormData({ ...formData, stockKg: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fdfbf7] border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Display Order & Visibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Catalogue Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#fdfbf7] border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0f382c]">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 accent-[#1b4332] rounded"
                  />
                  <span>Visible to Customers on Website</span>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="product-form"
            className="py-2.5 px-6 bg-[#1b4332] hover:bg-[#0f382c] text-[#d4af37] rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-[#0f382c]/20 transition-all border border-[#d4af37]/40"
          >
            <Check className="w-4 h-4" />
            <span>{isEditing ? 'Save Product Changes' : 'Create Product'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
