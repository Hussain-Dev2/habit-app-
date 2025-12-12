import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// JWT authentication has been removed
// App now uses NextAuth with Google OAuth exclusively
// This endpoint is no longer used - clients should use NextAuth signIn()

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(
      { message: 'Register endpoint deprecated. Use NextAuth with Google OAuth.' },
      { status: 410 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}