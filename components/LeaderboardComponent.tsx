'use client';

/**
 * Leaderboard Component
 * 
 * Displays competitive rankings with multiple view modes:
 * - Global all-time leaderboard
 * - Weekly leaderboard
 * - Monthly leaderboard
 * - Rank by points, clicks, or level
 * 
 * Features:
 * - Real-time user rankings
 * - Current user highlight
 * - Podium display (top 3)
 * - Pagination
 * - Auto-refresh every 30 seconds
 * - Responsive design
 */

import { useState, useEffect } from 'react';
import Loader from '@/components/Loader';
import { apiFetch } from '@/lib/client';

interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  points: number;
  clicks: number;
  lifetimePoints: number;
  level: number;
  levelName: string;
  levelIcon: string;
  streakDays: number;
  totalReferrals: number;
  isCurrentUser: boolean;
}

interface UserRank {
  rank: number;
  username: string;
  points: number;
  clicks: number;
  lifetimePoints: number;
  level: number;
  levelName: string;
  levelIcon: string;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  userRank: UserRank | null;
  type: string;
  rankBy: string;
  totalUsers: number;
  lastUpdated: string;
}

type LeaderboardType = 'global' | 'weekly' | 'monthly';
type RankBy = 'points' | 'level' | 'clicks';

export default function LeaderboardComponent() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<LeaderboardType>('global');
  const [rankBy, setRankBy] = useState<RankBy>('points');

  useEffect(() => {
    fetchLeaderboard();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [type, rankBy]);

  const fetchLeaderboard = async () => {
    try {
      const response = await apiFetch<LeaderboardResponse>(
        `/leaderboard?type=${type}&rankBy=${rankBy}&limit=100`
      );
      setData(response);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400'; // Gold
    if (rank === 2) return 'text-gray-300'; // Silver
    if (rank === 3) return 'text-orange-400'; // Bronze
    return 'text-slate-400';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getDisplayValue = (entry: LeaderboardEntry) => {
    switch (rankBy) {
      case 'level':
        return `${entry.levelIcon} Lv.${entry.level}`;
      case 'points':
      default:
        return entry.points.toLocaleString();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Period Selector */}
        <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg">
          <button
            onClick={() => setType('global')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              type === 'global'
                ? 'bg-blue-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🌍 All Time
          </button>
          <button
            onClick={() => setType('weekly')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              type === 'weekly'
                ? 'bg-blue-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📅 Weekly
          </button>
          <button
            onClick={() => setType('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              type === 'monthly'
                ? 'bg-blue-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📆 Monthly
          </button>
        </div>

        {/* Rank By Selector */}
        <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg">
          <button
            onClick={() => setRankBy('points')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              rankBy === 'points'
                ? 'bg-purple-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            💎 Points
          </button>
          <button
            onClick={() => setRankBy('level')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              rankBy === 'level'
                ? 'bg-purple-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Level
          </button>
        </div>
      </div>

      {/* Current User Rank Card */}
      {data?.userRank && (
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Your Rank</p>
              <p className="text-3xl font-bold text-white">#{data.userRank.rank}</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm mb-1">{data.userRank.levelIcon} {data.userRank.levelName}</p>
              <p className="text-2xl font-bold text-white">{getDisplayValue(data.userRank as any)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Podium (Top 3) */}
      {data && data.leaderboard.length >= 3 && (
        <div className="mb-8 flex justify-center items-end gap-4">
          {/* 2nd Place */}
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-2">🥈</div>
            <div className="bg-slate-800/50 rounded-xl p-4 w-32 text-center">
              <p className="text-sm text-gray-300 truncate">{data.leaderboard[1].username}</p>
              <p className="text-xl font-bold text-gray-300 mt-1">{getDisplayValue(data.leaderboard[1])}</p>
              <p className="text-xs text-gray-400 mt-1">{data.leaderboard[1].levelIcon} Lv.{data.leaderboard[1].level}</p>
            </div>
            <div className="w-32 h-20 bg-gradient-to-t from-gray-600 to-gray-500 rounded-t-lg mt-2"></div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <div className="text-5xl mb-2 animate-bounce">🥇</div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 w-32 text-center shadow-lg">
              <p className="text-sm text-yellow-900 font-bold truncate">{data.leaderboard[0].username}</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{getDisplayValue(data.leaderboard[0])}</p>
              <p className="text-xs text-yellow-800 mt-1">{data.leaderboard[0].levelIcon} Lv.{data.leaderboard[0].level}</p>
            </div>
            <div className="w-32 h-28 bg-gradient-to-t from-yellow-600 to-yellow-500 rounded-t-lg mt-2"></div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-2">🥉</div>
            <div className="bg-slate-800/50 rounded-xl p-4 w-32 text-center">
              <p className="text-sm text-orange-300 truncate">{data.leaderboard[2].username}</p>
              <p className="text-xl font-bold text-orange-300 mt-1">{getDisplayValue(data.leaderboard[2])}</p>
              <p className="text-xs text-orange-400 mt-1">{data.leaderboard[2].levelIcon} Lv.{data.leaderboard[2].level}</p>
            </div>
            <div className="w-32 h-16 bg-gradient-to-t from-orange-600 to-orange-500 rounded-t-lg mt-2"></div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="bg-slate-800/30 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Player</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Level</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">
                  {rankBy === 'clicks' ? 'Clicks' : rankBy === 'level' ? 'Level' : 'Points'}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {data?.leaderboard.map((entry) => (
                <tr
                  key={entry.id}
                  className={`transition-colors ${
                    entry.isCurrentUser 
                      ? 'bg-blue-500/20 border-l-4 border-blue-500' 
                      : 'hover:bg-slate-700/30'
                  }`}
                >
                  <td className="px-4 py-4">
                    <span className={`text-lg font-bold ${getRankColor(entry.rank)}`}>
                      {getRankBadge(entry.rank)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium truncate max-w-[200px]">
                        {entry.username}
                      </span>
                      {entry.isCurrentUser && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">You</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-300">
                      {entry.levelIcon} {entry.levelName}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-lg font-bold text-white">
                      {getDisplayValue(entry)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-sm text-orange-400">
                      🔥 {entry.streakDays}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-4 text-center text-sm text-slate-400">
        Last updated: {data && new Date(data.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
}
