
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { messaging } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  console.log('--- Push Test Started ---');
  
  try {
    const session = await getServerSession(authOptions);
    console.log('Session user:', session?.user?.email);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
       return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }

    // 1. Get User's Tokens
    console.log('Fetching tokens for user:', userId);
    const tokens = await prisma.fcmToken.findMany({
       where: { userId }
    });

    if (tokens.length === 0) {
       console.log('No tokens found');
       return NextResponse.json({ error: 'No device tokens found for this user. Make sure you have allowed notifications in your browser.' }, { status: 404 });
    }

    const deviceTokens = tokens.map(t => t.token);
    console.log(`Found ${deviceTokens.length} tokens. Sending test message...`);

    // 2. Send Message
    const message = {
       notification: {
           title: '🔔 Test Notification',
           body: 'This is a test notification from RECKON!'
       },
       data: {
           url: '/stats'
       },
       tokens: deviceTokens
    };

    try {
      const response = await messaging.sendEachForMulticast(message);
      console.log('Multicast response:', response);
      return NextResponse.json({ 
          success: true, 
          message: `Sent to ${response.successCount} devices`,
          failures: response.failureCount 
      });
    } catch (firebaseError: any) {
      console.error('Firebase messaging error:', firebaseError);
      return NextResponse.json({ error: 'Firebase error: ' + firebaseError.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error('General test notification error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
