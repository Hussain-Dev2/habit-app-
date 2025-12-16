/**
 * API Route: Notification Settings Management
 * GET/POST /api/notifications/settings
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { getNotificationSettings, updateNotificationSettings } from '@/lib/reminder-service';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const settings = await getNotificationSettings(user.id);

    // Return default settings if not found
    const defaultSettings = {
      enabled: true,
      reminderTime: '21:00',
      reminderDays: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
      pushEnabled: true,
      emailEnabled: false,
      timezone: 'UTC',
    };

    return Response.json({
      settings: settings || defaultSettings,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch settings';
    console.error('Error fetching notification settings:', error);
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const data = await req.json();

    // Validate reminder time format (HH:MM)
    if (data.reminderTime && !/^\d{2}:\d{2}$/.test(data.reminderTime)) {
      return Response.json(
        { error: 'Invalid reminder time format. Use HH:MM' },
        { status: 400 }
      );
    }

    const settings = await updateNotificationSettings(user.id, data);

    return Response.json({
      success: true,
      settings,
      message: '✅ Notification settings updated',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
    console.error('Error updating notification settings:', error);
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
