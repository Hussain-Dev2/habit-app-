/**
 * API Route: Cron Job for Habit Reminders
 * POST /api/cron/send-habit-reminders
 * 
 * This endpoint is called by a cron service (Vercel Cron, AWS EventBridge, etc.)
 * to send habit reminders to users
 */

import { sendHabitReminders } from '@/lib/reminder-service';

// Verify the request is from a trusted cron service
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key';

export async function POST(req: Request) {
  try {
    // Verify authorization
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Send reminders
    const result = await sendHabitReminders({
      hoursBeforeMidnight: 3, // Send reminder 3 hours before midnight
    });

    return Response.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send reminders';
    console.error('Cron job error:', error);
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return Response.json({
    status: 'ok',
    message: 'Habit reminder cron endpoint is ready',
    endpoint: '/api/cron/send-habit-reminders',
  });
}
