'use client';

import { useState } from 'react';
import Toast from './Toast';

export default function AdminNotificationManager() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    url: '',
    targetType: 'all' // all, active_7days, high_score
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setToast({ 
        message: `Sent to ${data.targetedUsers} users (${data.pushSent} pushes)`, 
        type: 'success' 
      });
      
      // Reset form
      setFormData({ ...formData, title: '', message: '' });
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to send', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Broadcast Announcements</h2>
          <p className="text-sm text-slate-500">Send push notifications to your users</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        {/* Target Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Target Audience
            </label>
            <select
              value={formData.targetType}
              onChange={e => setFormData({ ...formData, targetType: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Everyone (All Users)</option>
              <option value="active_7days">Active Recently (7 Days)</option>
              <option value="high_score">High Achievers (1000+ XP)</option>
            </select>
          </div>
          
           <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Link URL (Optional)
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={e => setFormData({ ...formData, url: e.target.value })}
              placeholder="/shop or https://..."
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Notification Title
          </label>
          <input
            required
            type="text"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., New Challenge Available! 🚀"
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Message Body
          </label>
          <textarea
            required
            rows={3}
            value={formData.message}
            onChange={e => setFormData({ ...formData, message: e.target.value })}
            placeholder="e.g., Log in now to claim your daily bonus..."
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
             <>
               <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               <span>Sending...</span>
             </>
          ) : (
             <>
               <span className="text-xl">📢</span>
               <span>Send Broadcast</span>
             </>
          )}
        </button>
      </form>
    </div>
  );
}
