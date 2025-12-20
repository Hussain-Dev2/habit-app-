/**
 * Habit Reminder Service
 * 
 * Handles sending reminders for uncompleted habits
 * Uses Cron job to run daily at specified times
 */

import { prisma } from '@/lib/prisma';
import { sendPushNotification as sendWebPush } from '@/lib/web-push';


interface ReminderOptions {
  hoursBeforeMidnight?: number; // How many hours before midnight to send reminder
}

/**
 * Send reminders for incomplete habits
 * This function should be called by a cron job daily
 */
export async function sendHabitReminders(options: ReminderOptions = {}) {
  const { hoursBeforeMidnight = 3 } = options;

  try {
    console.log('🔔 Starting habit reminder process...');

    // Get all users with notification settings enabled
    const usersWithReminders = await prisma.notificationSettings.findMany({
      where: { enabled: true },
      include: {
        user: {
          include: {
            habits: {
              where: { isActive: true },
              include: {
                completions: {
                  where: {
                    completedAt: {
                      gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    let remindersSent = 0;
    let remindersFailed = 0;

    for (const settings of usersWithReminders) {
      const user = settings.user;
      const reminderHour = parseInt(settings.reminderTime.split(':')[0]);
      const reminderMinute = parseInt(settings.reminderTime.split(':')[1] || '0');

      // Check if it's the right time to send reminder
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Allow 10-minute window for cron job flexibility
      const isReminderTime =
        (currentHour === reminderHour && currentMinute >= reminderMinute && currentMinute < reminderMinute + 10) ||
        (currentHour === reminderHour && reminderMinute === 0 && currentMinute < 10);

      if (!isReminderTime) continue;

      // Check if today is in reminder days
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const currentDay = dayNames[now.getDay()];
      const reminderDays = settings.reminderDays.split(',').map(d => d.trim());

      if (!reminderDays.includes(currentDay)) continue;

      // Get incomplete habits
      const incompleteHabits = user.habits.filter(habit => habit.completions.length === 0);

      if (incompleteHabits.length === 0) continue;

      for (const habit of incompleteHabits) {
        try {
          // Check if reminder already sent today
          const alreadySent = await prisma.habitReminder.findFirst({
            where: {
              habitId: habit.id,
              userId: user.id,
              sentAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
              },
            },
          });

          if (alreadySent) continue;

          // Calculate urgency and message based on streak
          let message = '';
          let type = 'habit_reminder';
          
          if (habit.streak > 0) {
            // Streak Rescue Mode
            type = 'streak_rescue';
            const flameIcon = '🔥';
            message = `${flameIcon} STREAK DANGER! You're about to lose your ${habit.streak}-day streak for "${habit.name}". Complete it now to keep it burning!`;
          } else {
            // Standard Reminder
            type = 'habit_reminder';
            message = `⏰ Time to build a habit! Don't forget to complete "${habit.name}" today.`;
          }

          if (settings.pushEnabled) {
             // Pass the calculated type/urgency to the sender
            await sendPushNotification(user.id, habit.id, message, type);
            remindersSent++;
          }

          // Log the reminder
          await prisma.habitReminder.create({
            data: {
              habitId: habit.id,
              userId: user.id,
              type: 'push', // Channel type
              status: 'sent',
              message,
            },
          });
        } catch (error) {
          console.error(`Failed to send reminder for habit ${habit.id}:`, error);
          remindersFailed++;
        }
      }
    }

    console.log(`✅ Reminder process complete. Sent: ${remindersSent}, Failed: ${remindersFailed}`);
    return { success: true, sent: remindersSent, failed: remindersFailed };
  } catch (error) {
    console.error('Error in sendHabitReminders:', error);
    throw error;
  }
}

/**
 * Send a push notification
 */
async function sendPushNotification(userId: string, habitId: string, message: string, type: string = 'habit_reminder') {
  try {
    // Create in-app notification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { pushSubscriptions: true }
    });

    if (!user) throw new Error('User not found');

    await prisma.notification.create({
      data: {
        userId,
        type, // Use the passed type (e.g., 'streak_rescue')
        title: type === 'streak_rescue' ? '🔥 Streak Rescue' : '🔔 Habit Reminder',
        message,
      },
    });

    // Send Web Push to all subscriptions
    const payload = {
      title: 'Habit Reminder',
      body: message,
      icon: '/icons/icon-192x192.png',
      url: `/habits?id=${habitId}`
    };

    const promises = user.pushSubscriptions.map(sub => {
      const subscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };
      return sendWebPush(subscription, payload);
    });

    await Promise.all(promises);

    console.log(`📤 Push notification sent to user ${userId}`);
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

/**
 * Get user's notification settings
 */
export async function getNotificationSettings(userId: string) {
  return prisma.notificationSettings.findUnique({
    where: { userId },
  });
}

/**
 * Update user's notification settings
 */
export async function updateNotificationSettings(
  userId: string,
  data: {
    enabled?: boolean;
    reminderTime?: string;
    reminderDays?: string;
    pushEnabled?: boolean;
    emailEnabled?: boolean;
    timezone?: string;
  }
) {
  return prisma.notificationSettings.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    },
  });
}

/**
 * Get reminder statistics
 */
export async function getReminderStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reminders = await prisma.habitReminder.findMany({
    where: {
      userId,
      sentAt: {
        gte: today,
      },
    },
  });

  return {
    totalSent: reminders.length,
    sent: reminders.filter(r => r.status === 'sent').length,
    failed: reminders.filter(r => r.status === 'failed').length,
    clicked: reminders.filter(r => r.status === 'clicked').length,
  };
}
