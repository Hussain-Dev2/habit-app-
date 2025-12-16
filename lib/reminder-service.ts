/**
 * Habit Reminder Service
 * 
 * Handles sending reminders for uncompleted habits
 * Uses Cron job to run daily at specified times
 */

import { prisma } from '@/lib/prisma';
import knockClient from '@/lib/knock';


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

          // Send push notification
          const message = `⏰ Don't forget: ${habit.name}! Complete it to maintain your ${habit.streak} day streak.`;

          if (settings.pushEnabled) {
            await sendPushNotification(user.id, habit.id, message);
            remindersSent++;
          }

          // Log the reminder
          await prisma.habitReminder.create({
            data: {
              habitId: habit.id,
              userId: user.id,
              type: 'push',
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
 * Send a push notification (mock implementation)
 * In production, integrate with Firebase Cloud Messaging, OneSignal, etc.
 */
async function sendPushNotification(userId: string, habitId: string, message: string) {
  try {
    // Create in-app notification
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error('User not found');

    await prisma.notification.create({
      data: {
        userId,
        type: 'habit_reminder',
        title: '🔔 Habit Reminder',
        message,
      },
    });

    // Trigger Knock workflow
    try {
      await knockClient.workflows.trigger('f_app', {
        recipients: [userId],
        data: {
          type: 'habit-reminder',
          habitId,
          habitName: message.split(':')[1]?.split('!')[0]?.trim() || 'Habit',
          message,
        },
      });
    } catch (e) {
      console.error('Knock reminder error:', e);
    }

    // TODO: Integrate with actual push notification service
    // Example providers:
    // - Firebase Cloud Messaging (FCM)
    // - OneSignal
    // - Pusher
    // - AWS SNS

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
