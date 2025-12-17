'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/client';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  category: 'Book' | 'Course';
  createdAt: string;
  updatedAt: string;
}

export default function AdminRecommendationManager() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    url: '',
    category: 'Book' as 'Book' | 'Course',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const data = await apiFetch<Recommendation[]>('/recommendations', { method: 'GET' });
      setRecommendations(data);
      setError(null);
    } catch (error: any) {
      console.error('Failed to fetch recommendations:', error);
      // If endpoint doesn't exist yet, we might get an HTML error page or 404
      // We'll just ignore for now or show error
      // setError('Failed to fetch recommendations'); 
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rec: Recommendation) => {
    setEditingId(rec.id);
    setFormData({
      title: rec.title,
      description: rec.description,
      imageUrl: rec.imageUrl,
      url: rec.url,
      category: rec.category,
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
      imageUrl: '',
      url: '',
      category: 'Book',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const body = JSON.stringify(formData);

      if (editingId) {
        // Update
        const updated = await apiFetch<Recommendation>(`/recommendations/${editingId}`, {
          method: 'PUT',
          body,
        });
        setRecommendations(recommendations.map((r) => (r.id === editingId ? updated : r)));
        setSuccess('Recommendation updated successfully! ✅');
      } else {
        // Create
        const newRec = await apiFetch<Recommendation>('/recommendations', {
          method: 'POST',
          body,
        });
        setRecommendations([newRec, ...recommendations]);
        setSuccess('Recommendation created successfully! ✅');
      }

      setTimeout(() => handleCancel(), 1500);
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to save recommendation';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this recommendation?')) return;

    try {
      await apiFetch(`/recommendations/${id}`, { method: 'DELETE' });
      setRecommendations(recommendations.filter((r) => r.id !== id));
      setSuccess('Deleted successfully! ✅');
      setTimeout(() => setSuccess(null), 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-300">
          <p className="font-semibold">❌ Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-green-300">
          <p className="font-semibold">{success}</p>
        </div>
      )}

      {/* Form Area */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {editingId ? '✏️ Edit Recommendation' : '📚 Recommendation Manager'}
          </h2>
          <div className="flex gap-2">
            {!showForm && !editingId && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-bold text-base shadow-lg hover:shadow-xl"
              >
                ➕ Add New
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
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 bg-slate-700/30 p-6 rounded-xl border border-blue-500/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as 'Book' | 'Course' })}
                  required
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Book">📚 Book</option>
                  <option value="Course">🎓 Course</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Link URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg transition-colors font-semibold"
              >
                {submitting ? '⏳ Saving...' : editingId ? '✓ Update' : '✓ Create'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* List */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6">
          📋 Existing Recommendations ({recommendations.length})
        </h2>

        {loading ? (
          <div className="text-slate-400">Loading...</div>
        ) : recommendations.length === 0 ? (
          <div className="text-slate-400 py-8 text-center bg-slate-700/30 rounded-lg">
            No recommendations yet. Add one above!
          </div>
        ) : (
          <div className="grid gap-3">
            {recommendations.map((rec) => (
              <div key={rec.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-blue-500 transition-all flex gap-4">
                {/* Thumbnail */}
                <div className="w-20 h-28 bg-slate-800 rounded-md overflow-hidden flex-shrink-0">
                    {rec.imageUrl ? (
                        <img src={rec.imageUrl} alt={rec.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">No Img</div>
                    )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">{rec.title}</h3>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mb-2 ${rec.category === 'Book' ? 'bg-amber-600/30 text-amber-300' : 'bg-cyan-600/30 text-cyan-300'}`}>
                            {rec.category === 'Book' ? '📚 Book' : '🎓 Course'}
                        </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(rec)} className="px-3 py-1 bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white rounded text-sm transition-colors">✏️ Edit</button>
                      <button onClick={() => handleDelete(rec.id)} className="px-3 py-1 bg-red-600/20 text-red-300 hover:bg-red-600 hover:text-white rounded text-sm transition-colors">🗑️ Delete</button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-400 mb-2 line-clamp-2">{rec.description}</p>
                  
                  {rec.url && (
                    <a href={rec.url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 hover:underline">
                        🔗 {rec.url}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
