
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { sendPushNotificationToUser } from '@/lib/notification-service';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
       return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }

    await sendPushNotificationToUser(
      userId,
      '🔔 Test Notification',
      'This is a test notification to verify your settings!',
      '/notifications-settings'
    );

    return NextResponse.json({ success: true, message: 'Test notification sent' });
  } catch (error: any) {
    console.error('Test notification error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
