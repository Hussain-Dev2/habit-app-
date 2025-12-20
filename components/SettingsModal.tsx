'use client';

import ThemeToggle from './ThemeToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import Toast from './Toast';
import { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { language, setLanguage, t } = useLanguage();
  const { subscribeToNotifications, subscription } = usePushNotifications();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Force LTR for consistent layout */}
      <div 
        dir="ltr"
        className="relative bg-slate-800/95 backdrop-blur-xl border-2 border-slate-700 rounded-xl shadow-2xl w-full max-w-sm mx-auto my-auto max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-800/95 backdrop-blur-xl border-b border-slate-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <span>{t.settings}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Language Section */}
          <div className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-lg p-4 border border-slate-600/50 shadow-lg">
            <label className="block text-white font-bold mb-3 flex items-center gap-2 text-sm">
              <span className="text-lg">🌐</span>
              <span>{t.language}</span>
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setLanguage('en')}
                className={`w-full px-3 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-between shadow-md text-sm ${
                  language === 'en'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-xl">🇬🇧</span>
                  <span>English</span>
                </span>
                {language === 'en' && (
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => setLanguage('ar')}
                className={`w-full px-3 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-between shadow-md text-sm ${
                  language === 'ar'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-xl">🇸🇦</span>
                  <span>العربية</span>
                </span>
                {language === 'ar' && (
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>


          {/* Theme Section */}
          <div className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-lg p-4 border border-slate-600/50 shadow-lg">
            <label className="block text-white font-bold mb-3 flex items-center gap-2 text-sm">
              <span className="text-lg">🎨</span>
              <span>{t.theme}</span>
            </label>
            <div className="flex items-center justify-between bg-slate-700/60 px-3 py-2.5 rounded-lg shadow-md">
              <span className="text-slate-200 font-medium text-xs">Toggle Dark/Light</span>
              <div className="flex-shrink-0">
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-lg p-4 border border-slate-600/50 shadow-lg">
             <label className="block text-white font-bold mb-3 flex items-center gap-2 text-sm">
               <span className="text-lg">🔔</span>
               <span>Notifications</span>
             </label>
             
             {!subscription ? (
               <button
                 onClick={async () => {
                   try {
                     setToast({ message: 'Requesting permission...', type: 'info' });
                     await subscribeToNotifications();
                     setToast({ message: 'Notifications enabled!', type: 'success' });
                   } catch (e: any) {
                     setToast({ message: e.message || 'Failed to enable', type: 'error' });
                   }
                 }}
                 className="w-full px-3 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-between shadow-md text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500"
               >
                 <span className="flex items-center gap-2">
                   <span>Enable Push Notifications</span>
                 </span>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                 </svg>
               </button>
             ) : (
               <button
                 onClick={async () => {
                   try {
                     await fetch('/api/notifications/test', { method: 'POST' });
                     setToast({ message: 'Test notification sent!', type: 'success' });
                   } catch (e: any) {
                     setToast({ message: 'Failed to send test', type: 'error' });
                   }
                 }}
                 className="w-full px-3 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-between shadow-md text-sm bg-slate-700/60 text-green-400 border border-green-500/30 hover:bg-slate-700"
               >
                 <span className="flex items-center gap-2">
                   <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                   <span>Test Notification</span>
                 </span>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                 </svg>
               </button>
             )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-800/95 backdrop-blur-xl border-t border-slate-700 px-4 py-3">
          <button
            onClick={onClose}
            className="w-full px-3 py-2 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-xl text-sm"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
