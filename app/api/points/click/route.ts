/**
 * Click Points API Route (DEPRECATED)
 * 
 * This route was part of the legacy Clicker Game concept.
 * It has been disabled as the application has migrated to a Habit Tracker.
 * 
 * @deprecated Use /api/habits/complete instead
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    { error: 'Clicker game functionality has been removed. Please use the Habit Tracker features.' },
    { status: 410 }
  );
}

