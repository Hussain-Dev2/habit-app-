'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/client';

interface Product {
  id: string;
  title: string;
  description: string;
  costPoints: number;
  stock: number | null;
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
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await apiFetch<Product[]>('/admin/products', { method: 'GET' });
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
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
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      costPoints: 100,
      stock: null,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const body = JSON.stringify({
        title: formData.title,
        description: formData.description,
        costPoints: formData.costPoints,
        stock: formData.stock,
      });

      if (editingId) {
        // Update product
        const updated = await apiFetch<Product>(`/admin/products/${editingId}`, {
          method: 'PUT',
          body,
        });
        setProducts(products.map((p) => (p.id === editingId ? updated : p)));
      } else {
        // Create new product
        const newProduct = await apiFetch<Product>('/admin/products', {
          method: 'POST',
          body,
        });
        setProducts([newProduct, ...products]);
      }

      handleCancel();
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await apiFetch(`/admin/products/${productId}`, { method: 'DELETE' });
      setProducts(products.filter((p) => p.id !== productId));
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Product Form */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {editingId ? '✏️ Edit Product' : '➕ Add New Product'}
          </h2>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
          >
            {showForm ? '✕ Cancel' : ''}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      costPoints: Math.max(1, parseInt(e.target.value)),
                    })
                  }
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

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
          >
            + Add New Product
          </button>
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
                    <h3 className="text-lg font-semibold text-white">{product.title}</h3>
                    <p className="text-sm text-slate-400">{product.description}</p>
                    <div className="flex gap-4 text-sm text-slate-400 mt-2">
                      <span>💰 {product.costPoints} points</span>
                      {product.stock !== null && (
                        <span>📦 Stock: {product.stock}</span>
                      )}
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
