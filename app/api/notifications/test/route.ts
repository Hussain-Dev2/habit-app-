
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { messaging } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  // 1. Auth Check (Admin or User? User asked for admin dashboard, but usually test is for self)
  // Let's verify admin status if this is strictly for admin tools
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
     const userId = (session.user as any).id;

     // 2. Get User's Tokens
     const tokens = await prisma.fcmToken.findMany({
        where: { userId }
     });

     if (tokens.length === 0) {
        return NextResponse.json({ error: 'No device tokens found for this user.' }, { status: 404 });
     }

     const deviceTokens = tokens.map(t => t.token);

     // 3. Send Message
     const message = {
        notification: {
            title: '🔔 Test Notification',
            body: 'This is a test notification from the Admin Dashboard!'
        },
        data: {
            url: '/admin'
        },
        tokens: deviceTokens
    };

    const response = await messaging.sendMulticast(message);

    return NextResponse.json({ 
        success: true, 
        message: `Sent to ${response.successCount} devices`,
        failures: response.failureCount 
    });

  } catch (error: any) {
    console.error('Test notification error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send' }, { status: 500 });
  }
}
