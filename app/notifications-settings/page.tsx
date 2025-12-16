'use client';

/**
 * Notification Settings Page
 * 
 * Users can configure habit reminders:
 * - Enable/disable notifications
 * - Set reminder time
 * - Choose which days to remind
 * - Select notification channels (push, email, SMS)
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Toast from '@/components/Toast';
import Loader from '@/components/Loader';
import { apiFetch } from '@/lib/client';

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
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await apiFetch('/notifications/settings', {
        method: 'POST',
        body: JSON.stringify(settings),
      });

      setToast({ message: '✅ Settings saved successfully!', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to save settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    if (!settings) return;

    const days = settings.reminderDays.split(',').map(d => d.trim());
    const index = days.indexOf(day);

    if (index > -1) {
      days.splice(index, 1);
    } else {
      days.push(day);
    }

    setSettings({
      ...settings,
      reminderDays: days.join(','),
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <Loader size="lg" color="cyan" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!settings) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">Failed to load settings</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const selectedDays = settings.reminderDays.split(',').map(d => d.trim());

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Header */}
          <div className="mb-8 sm:mb-10 lg:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              🔔 Notification Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
              Customize how and when you receive habit reminders
            </p>
          </div>

          {/* Settings Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 space-y-8">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Enable Reminders
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Receive notifications for incomplete habits
                </p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.enabled
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.enabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.enabled && (
              <>
                {/* Reminder Time */}
                <div>
                  <label className="block text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                    ⏰ Reminder Time
                  </label>
                  <input
                    type="time"
                    value={settings.reminderTime}
                    onChange={(e) => setSettings({ ...settings, reminderTime: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white text-lg"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    You'll receive a reminder at this time each day
                  </p>
                </div>

                {/* Days Selection */}
                <div>
                  <label className="block text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                    📅 Remind Me On
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {DAYS.map((day, index) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`p-3 rounded-xl font-semibold transition-all ${
                          selectedDays.includes(day)
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="text-xs">{day}</div>
                        <div className="text-lg mt-1">{FULL_DAYS[index].substring(0, 3)}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notification Channels */}
                <div>
                  <label className="block text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                    📬 Notification Channels
                  </label>
                  <div className="space-y-3">
                    {/* Push Notifications */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Push Notifications</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">In-app notifications</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, pushEnabled: !settings.pushEnabled })}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          settings.pushEnabled
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            settings.pushEnabled ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Email Notifications */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl opacity-50">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Email Notifications</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Coming soon</p>
                      </div>
                      <button
                        disabled
                        className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                      >
                        <span className="inline-block h-6 w-6 transform rounded-full bg-white translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '💾 Saving...' : '💾 Save Settings'}
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">ℹ️ How it works</h3>
            <ul className="text-sm sm:text-base text-gray-700 dark:text-gray-300 space-y-2">
              <li>✅ You'll get a reminder at your chosen time if a habit is incomplete</li>
              <li>✅ Reminders won't be sent if you've already completed the habit</li>
              <li>✅ You can manage reminders for each habit individually</li>
              <li>✅ Disable reminders anytime by toggling the switch above</li>
            </ul>
          </div>
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </ProtectedRoute>
  );
}
