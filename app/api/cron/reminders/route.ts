
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { messaging } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  // Verify Cron Secret to prevent public access (Optional but recommended)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // return new NextResponse('Unauthorized', { status: 401 });
    // For now, allowing public access for testing, or check param
  }

  try {
    // 1. Find users with active habits
    // This could be optimized to strict "users who have active habits AND haven't completed them all"
    // For scale, we would need batching.
    
    // Get all users who have at least one active habit
    const usersWithHabits = await prisma.user.findMany({
      where: {
        habits: {
          some: {
            isActive: true,
            isCurrentlyFrozen: false
          }
        },
        // Only valid FCM tokens
        fcmTokens: {
            some: {}
        }
      },
      include: {
        habits: {
          where: { isActive: true, isCurrentlyFrozen: false },
          include: {
             completions: {
                where: {
                    completedAt: {
                        gte: new Date(new Date().setHours(0,0,0,0))
                    }
                }
             }
          }
        },
        fcmTokens: true
      }
    });

    let sentCount = 0;

    for (const user of usersWithHabits) {
        const totalHabits = user.habits.length;
        const completedToday = user.habits.filter(h => h.completions.length > 0).length;

        // Condition: Has habits not yet completed
        if (completedToday < totalHabits) {
            const remaining = totalHabits - completedToday;
            
            // Send Notification
            // We notify all tokens for this user
            const tokens = user.fcmTokens.map(t => t.token);
            
            if (tokens.length > 0) {
                try {
                    const message = {
                        notification: {
                            title: '📝 Daily Reminder',
                            body: `You have ${remaining} habit${remaining > 1 ? 's' : ''} left to complete today!`
                        },
                        data: {
                            url: '/habits'
                        },
                        tokens: tokens
                    };
                    
                    const response = await messaging.sendEachForMulticast(message);
                    sentCount += response.successCount;
                    
                    // Cleanup invalid tokens if any (Optional)
                    /* 
                    if (response.failureCount > 0) {
                        const failedTokens = [];
                        response.responses.forEach((resp, idx) => {
                            if (!resp.success) {
                                failedTokens.push(tokens[idx]);
                            }
                        });
                        // await prisma.fcmToken.deleteMany({ where: { token: { in: failedTokens } } });
                    }
                    */

                } catch (e) {
                    console.error(`Failed to send to user ${user.id}`, e);
                }
            }
        }
    }

    return NextResponse.json({ success: true, sent: sentCount, processed: usersWithHabits.length });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
