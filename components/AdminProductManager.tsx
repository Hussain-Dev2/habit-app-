'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/client';

interface Product {
  id: string;
  title: string;
  description: string;
  costPoints: number;
  stock: number | null;
  imageUrl: string | null;
  category: string | null;
  value: string | null;
  region: string | null;
  isDigital: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    costPoints: 100,
    stock: null as number | null,
    imageUrl: '',
    category: '',
    value: '',
    region: '',
    isDigital: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await apiFetch<Product[]>('/admin/products', { method: 'GET' });
      setProducts(data);
      setError(null);
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to fetch products';
      console.error('Failed to fetch products:', error);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      title: product.title,
      description: product.description,
      costPoints: product.costPoints,
      stock: product.stock,
      imageUrl: product.imageUrl || '',
      category: product.category || '',
      value: product.value || '',
      region: product.region || '',
      isDigital: product.isDigital,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setError(null);
    setSuccess(null);
    setFormData({
      title: '',
      description: '',
      costPoints: 100,
      stock: null,
      imageUrl: '',
      category: '',
      value: '',
      region: '',
      isDigital: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate title
    if (!formData.title.trim()) {
      setError('Product title is required');
      return;
    }
    
    // Validate cost points
    if (formData.costPoints <= 0) {
      setError('Cost points must be greater than 0');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const body = JSON.stringify({
        title: formData.title.trim(),
        description: formData.description.trim(),
        costPoints: formData.costPoints,
        stock: formData.stock,
        imageUrl: formData.imageUrl || null,
        category: formData.category || null,
        value: formData.value || null,
        region: formData.region || null,
        isDigital: formData.isDigital,
      });

      if (editingId) {
        // Update product
        const updated = await apiFetch<Product>(`/admin/products/${editingId}`, {
          method: 'PUT',
          body,
        });
        setProducts(products.map((p) => (p.id === editingId ? updated : p)));
        setSuccess('Product updated successfully! ✅');
      } else {
        // Create new product
        const newProduct = await apiFetch<Product>('/admin/products', {
          method: 'POST',
          body,
        });
        setProducts([newProduct, ...products]);
        setSuccess('Product created successfully! ✅');
      }

      setTimeout(() => handleCancel(), 1500);
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to save product';
      console.error('Failed to save product:', error);
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await apiFetch(`/admin/products/${productId}`, { method: 'DELETE' });
      setProducts(products.filter((p) => p.id !== productId));
      setSuccess('Product deleted successfully! ✅');
      setTimeout(() => setSuccess(null), 2000);
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to delete product';
      console.error('Failed to delete product:', error);
      setError(errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-300">
          <p className="font-semibold">❌ Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-green-300">
          <p className="font-semibold">{success}</p>
        </div>
      )}

      {/* Add/Edit Product Form */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {editingId ? '✏️ Edit Product' : '📦 Product Manager'}
          </h2>
          <div className="flex gap-2">
            {!showForm && !editingId && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-bold text-base shadow-lg hover:shadow-xl"
              >
                ➕ Add New Product
              </button>
            )}
            {showForm && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors font-semibold"
              >
                ✕ Cancel
              </button>
            )}
            {editingId && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors font-semibold"
              >
                ✕ Cancel Edit
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 bg-slate-700/30 p-6 rounded-xl border border-blue-500/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Shield Boost"
                  required
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Cost (Points) *
                </label>
                <input
                  type="number"
                  value={formData.costPoints}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setFormData({
                      ...formData,
                      costPoints: isNaN(value) ? 1 : Math.max(1, value),
                    });
                  }}
                  min="1"
                  required
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="e.g., Protects your streak for 1 day"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Category --</option>
                  <option value="Google Play">🎮 Google Play</option>
                  <option value="iTunes">🍎 iTunes / Apple</option>
                  <option value="Steam">🎮 Steam</option>
                  <option value="PlayStation">🎮 PlayStation</option>
                  <option value="Xbox">🎮 Xbox</option>
                  <option value="Nintendo">🎮 Nintendo</option>
                  <option value="Mobile Legends">🎮 Mobile Legends</option>
                  <option value="Free Fire">🎮 Free Fire</option>
                  <option value="PUBG">🎮 PUBG</option>
                  <option value="Roblox">🎮 Roblox</option>
                  <option value="Spotify">🎵 Spotify</option>
                  <option value="Netflix">🎬 Netflix</option>
                  <option value="Amazon">🛒 Amazon</option>
                  <option value="Visa">💳 Visa Gift Card</option>
                  <option value="Mastercard">💳 Mastercard Gift Card</option>
                  <option value="PayPal">💰 PayPal</option>
                  <option value="Other">🎁 Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Value (e.g., $10, $25)
                </label>
                <select
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Value --</option>
                  <option value="$5">💵 $5</option>
                  <option value="$10">💵 $10</option>
                  <option value="$15">💵 $15</option>
                  <option value="$20">💵 $20</option>
                  <option value="$25">💵 $25</option>
                  <option value="$50">💵 $50</option>
                  <option value="$75">💵 $75</option>
                  <option value="$100">💵 $100</option>
                  <option value="50 Coins">🪙 50 Coins</option>
                  <option value="100 Coins">🪙 100 Coins</option>
                  <option value="200 Coins">🪙 200 Coins</option>
                  <option value="500 Coins">🪙 500 Coins</option>
                  <option value="1000 Coins">🪙 1000 Coins</option>
                  <option value="1 Month">📅 1 Month</option>
                  <option value="3 Months">📅 3 Months</option>
                  <option value="6 Months">📅 6 Months</option>
                  <option value="12 Months">📅 12 Months / 1 Year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Region *
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Region --</option>
                  <option value="Global">🌍 Global (Worldwide)</option>
                  <option value="USA">🇺🇸 USA</option>
                  <option value="EU">🇪🇺 Europe (EU)</option>
                  <option value="UK">🇬🇧 United Kingdom</option>
                  <option value="Canada">🇨🇦 Canada</option>
                  <option value="Australia">🇦🇺 Australia</option>
                  <option value="Middle East">🇸🇦 Middle East</option>
                  <option value="Asia">🌏 Asia</option>
                  <option value="Latin America">🌎 Latin America</option>
                  <option value="Africa">🌍 Africa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                💡 Tip: Use image hosting services like Imgur or Cloudinary
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Stock (Leave empty for unlimited)
              </label>
              <input
                type="number"
                value={formData.stock || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="Optional"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || !formData.title}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg transition-colors font-semibold"
              >
                {submitting ? '⏳ Saving...' : editingId ? '✓ Update Product' : '✓ Create Product'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Products List */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6">
          📦 Products ({products.length})
        </h2>

        {loading ? (
          <div className="text-slate-400">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-slate-400 py-8 text-center">
            No products yet. Create your first one!
          </div>
        ) : (
          <div className="grid gap-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-blue-500 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{product.title}</h3>
                      {product.category && (
                        <span className="px-2 py-1 bg-purple-600/50 rounded-full text-xs text-white">
                          {product.category}
                        </span>
                      )}
                      {product.value && (
                        <span className="px-2 py-1 bg-yellow-600/50 rounded-full text-xs text-white">
                          {product.value}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">{product.description}</p>
                    <div className="flex gap-4 text-sm text-slate-400 mt-2">
                      <span>💰 {product.costPoints} points</span>
                      {product.stock !== null ? (
                        <span>📦 Stock: {product.stock}</span>
                      ) : (
                        <span>📦 Unlimited</span>
                      )}
                      {product.imageUrl && <span>🖼️ Has Image</span>}
                      <span>🕐 {new Date(product.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
