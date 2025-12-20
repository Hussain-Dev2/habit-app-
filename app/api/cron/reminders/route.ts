
import { NextResponse } from 'next/server';
import { sendHabitReminders } from '@/lib/reminder-service';

export async function GET(request: Request) {
  // Verify Cron Secret to prevent public access
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await sendHabitReminders();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
