/**
 * Leaderboard API Route
 * 
 * Provides global and period-based leaderboards for competitive gameplay.
 * Supports multiple ranking criteria and time periods.
 * 
 * Features:
 * - Global all-time leaderboard
 * - Weekly leaderboard (resets every Monday)
 * - Monthly leaderboard
 * - Ranking by points, clicks, or level
 * - User's current rank
 * - Pagination support
 * 
 * @route GET /api/leaderboard?type=global&limit=100&rankBy=points
 * @access Public (no auth required to view leaderboard)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { calculateLevel } from '@/lib/level-system';

export const dynamic = 'force-dynamic';

/**
 * GET handler for leaderboard data
 * 
 * Query Parameters:
 * - type: 'global' | 'weekly' | 'monthly' (default: 'global')
 * - rankBy: 'points' | 'clicks' | 'level' (default: 'points')
 * - limit: number (default: 100, max: 500)
 * 
 * @returns Leaderboard data with user rankings
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'global';
    const rankBy = searchParams.get('rankBy') || 'points';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);

    // Get current user session (optional - to show their rank)
    const session = await getServerSession(authOptions);
    let currentUser = null;

    if (session?.user?.email) {
      currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, username: true, points: true, clicks: true, lifetimePoints: true, createdAt: true },
      });
    }

    // Determine date filter for period-based leaderboards
    let dateFilter = {};
    const now = new Date();

    if (type === 'weekly') {
      // Get start of current week (Monday)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1);
      startOfWeek.setHours(0, 0, 0, 0);
      
      dateFilter = {
        createdAt: { gte: startOfWeek }
      };
    } else if (type === 'monthly') {
      // Get start of current month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      dateFilter = {
        createdAt: { gte: startOfMonth }
      };
    }

    // Determine order by field
    let orderBy: any;
    switch (rankBy) {
      case 'level':
        orderBy = { lifetimePoints: 'desc' }; // Level is based on lifetime points
        break;
      case 'points':
      default:
        orderBy = { points: 'desc' };
        break;
    }

    // Fetch top users
    const topUsers = await prisma.user.findMany({
      where: {
        ...dateFilter,
        // Exclude users with 0 points to keep leaderboard clean
        points: { gt: 0 }
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        points: true,
        clicks: true,
        lifetimePoints: true,
        streakDays: true,
        totalReferrals: true,
        createdAt: true,
      },
      orderBy,
      take: limit,
    });

    // Calculate levels and format leaderboard
    const leaderboard = topUsers.map((user, index) => {
      const level = calculateLevel(user.lifetimePoints);
      
      return {
        rank: index + 1,
        id: user.id,
        username: user.username || user.name || 'Anonymous',
        points: user.points,
        clicks: user.clicks,
        lifetimePoints: user.lifetimePoints,
        level: level.level,
        levelName: level.name,
        levelIcon: level.icon,
        streakDays: user.streakDays,
        totalReferrals: user.totalReferrals,
        // Hide email for privacy
        isCurrentUser: currentUser?.id === user.id,
      };
    });

    // Find current user's rank (if authenticated)
    let userRank = null;
    if (currentUser) {
      // Count users with more points than current user
      const rankPosition = await prisma.user.count({
        where: {
          ...dateFilter,
          [rankBy === 'clicks' ? 'clicks' : rankBy === 'level' ? 'lifetimePoints' : 'points']: {
            gt: currentUser[rankBy === 'clicks' ? 'clicks' : rankBy === 'level' ? 'lifetimePoints' : 'points']
          }
        }
      });

      const userLevel = calculateLevel(currentUser.lifetimePoints);

      userRank = {
        rank: rankPosition + 1,
        username: currentUser.username,
        points: currentUser.points,
        clicks: currentUser.clicks,
        lifetimePoints: currentUser.lifetimePoints,
        level: userLevel.level,
        levelName: userLevel.name,
        levelIcon: userLevel.icon,
      };
    }

    // Return leaderboard data with cache headers
    return NextResponse.json({
      leaderboard,
      userRank,
      type,
      rankBy,
      totalUsers: leaderboard.length,
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      }
    });

  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
