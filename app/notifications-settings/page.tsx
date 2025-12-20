'use client';

/**
 * Notification Settings Page
 * Premium UI Redesign
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Bell, 
  Clock, 
  Calendar, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle,
  Save,
  Zap,
  Mail,
  Moon,
  Sun
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Toast from '@/components/Toast';
import Loader from '@/components/Loader';
import { apiFetch } from '@/lib/client';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface NotificationSettings {
  id?: string;
  enabled: boolean;
  reminderTime: string;
  reminderDays: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  timezone: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function NotificationSettingsPage() {
  const { status } = useSession();
  const { subscribeToNotifications, isSupported } = usePushNotifications();
  
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ settings: NotificationSettings }>('/notifications/settings');
      setSettings(data.settings);
    } catch (error) {
      setToast({ message: 'Failed to load settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newSettings?: NotificationSettings) => {
    const settingsToSave = newSettings || settings;
    if (!settingsToSave) return;

    try {
      setSaving(true);
      await apiFetch('/notifications/settings', {
        method: 'POST',
        body: JSON.stringify(settingsToSave),
      });

      if (newSettings) setSettings(newSettings);
      
      setToast({ message: 'Settings saved successfully', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to save settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (updates: Partial<NotificationSettings>) => {
    if (!settings) return;
    setSettings({ ...settings, ...updates });
  };

  const handlePushToggle = async () => {
    if (!settings) return;
    
    if (!settings.pushEnabled) {
      if (!isSupported) {
        setToast({ message: 'Push notifications are not supported on this device', type: 'error' });
        return;
      }
      
      try {
        setSaving(true);
        await subscribeToNotifications();
        await handleSave({ ...settings, pushEnabled: true });
        setToast({ message: 'Push notifications enabled!', type: 'success' });
      } catch (error) {
        console.error('Failed to enable push:', error);
        setToast({ message: 'Please allow notifications in your browser settings', type: 'error' });
        setSaving(false);
      }
    } else {
      await handleSave({ ...settings, pushEnabled: false });
    }
  };

  const toggleDay = (day: string) => {
    if (!settings) return;
    const days = settings.reminderDays.split(',').map(d => d.trim());
    const index = days.indexOf(day);
    if (index > -1) days.splice(index, 1);
    else days.push(day);
    updateSettings({ reminderDays: days.join(',') });
  };

  // --- UI Components ---

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <Loader size="lg" color="cyan" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!settings) return null;

  const selectedDays = settings.reminderDays.split(',').map(d => d.trim());

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          
          {/* Header */}
          <header className="mb-12 text-center sm:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
              Notification Settings
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Manage how and when you want to be reminded properly.
            </p>
          </header>

          <div className="space-y-6">
            
            {/* 1. Main Toggle Card */}
            <div className={`
              backdrop-blur-xl rounded-3xl border p-8 shadow-sm transition-all duration-300
              ${settings.enabled 
                ? 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800' 
                : 'bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-90'
              }
            `}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${settings.enabled ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                    <Bell className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daily Reminders</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                      {settings.enabled ? 'Reminders are active' : 'Reminders are paused'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleSave({ ...settings, enabled: !settings.enabled })}
                  className={`
                    relative w-16 h-9 rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/20
                    ${settings.enabled ? 'bg-cyan-600' : 'bg-slate-300 dark:bg-slate-700'}
                  `}
                >
                  <span className={`
                    absolute top-1 left-1 bg-white w-7 h-7 rounded-full shadow-md transform transition-transform duration-300
                    ${settings.enabled ? 'translate-x-7' : 'translate-x-0'}
                  `} />
                </button>
              </div>
            </div>

            {/* Expanded Settings Area */}
            <div className={`space-y-6 transition-all duration-500 ${settings.enabled ? 'opacity-100 translate-y-0' : 'opacity-50 pointer-events-none blur-sm'}`}>
              
              {/* 2. Schedule Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-500" />
                  Schedule
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {/* Time Picker */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Time
                    </label>
                    <div className="relative group">
                      <input
                        type="time"
                        value={settings.reminderTime}
                        onChange={(e) => updateSettings({ reminderTime: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      />
                      <Clock className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Days Selector */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Days
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((day) => {
                        const isSelected = selectedDays.includes(day);
                        return (
                          <button
                            key={day}
                            onClick={() => toggleDay(day)}
                            className={`
                              w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200
                              ${isSelected 
                                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 scale-105' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }
                            `}
                          >
                            {day.charAt(0)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Delivery Method (Push) */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-purple-500" />
                  Delivery
                </h3>

                {/* Push Row */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-xl">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">Push Notifications</h4>
                      <p className="text-sm text-slate-500">Receive alerts on this device</p>
                    </div>
                  </div>
                  <button
                    onClick={handlePushToggle}
                    disabled={saving}
                    className={`
                      relative w-12 h-7 rounded-full transition-colors duration-300
                      ${settings.pushEnabled ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'}
                    `}
                  >
                    <span className={`
                      absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300
                      ${settings.pushEnabled ? 'translate-x-5' : 'translate-x-0'}
                    `} />
                  </button>
                </div>

                {/* Test Button (Visible if active in browser) */}
                {settings.pushEnabled && (
                  <button
                    onClick={async () => {
                      try {
                        setToast({ message: 'Sending test...', type: 'info' });
                        await apiFetch('/notifications/test', { method: 'POST' });
                        setToast({ message: 'Test notification sent!', type: 'success' });
                      } catch (e: any) {
                        setToast({ message: 'Error: ' + e.message, type: 'error' });
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 font-semibold rounded-xl border border-purple-100 dark:border-purple-800/30 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    Send Test Notification
                  </button>
                )}

                {/* Email Row (Disabled) */}
                <div className="flex items-center justify-between p-4 mt-4 opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">Email</h4>
                      <p className="text-sm text-slate-500">Coming soon</p>
                    </div>
                  </div>
                  <div className="w-12 h-7 bg-slate-200 dark:bg-slate-800 rounded-full relative">
                    <div className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex justify-end pt-4">
                 <button
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="
                    flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all
                  "
                 >
                   {saving ? (
                     <Loader size="sm" color={settings.enabled ? 'white' : 'white'} />
                   ) : (
                     <>
                       <Save className="w-5 h-5" />
                       Save Settings
                     </>
                   )}
                 </button>
              </div>

            </div>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <Toast
              message={toast.message}
              type={toast.type === 'info' ? 'success' : toast.type}
              onClose={() => setToast(null)}
            />
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
