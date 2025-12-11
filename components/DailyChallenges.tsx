'use client';

/**
 * DailyChallenges Component
 * 
 * Displays daily challenges that refresh every 24 hours
 * Challenges encourage specific behaviors to increase engagement
 */

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/client';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  target: number;
  reward: number;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  progress?: number;
  completed?: boolean;
}

export default function DailyChallenges({ onPointsEarned }: { onPointsEarned?: () => void }) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
    const interval = setInterval(fetchChallenges, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchChallenges = async () => {
    try {
      const data = await apiFetch<{ challenges: Challenge[] }>('/challenges/daily');
      setChallenges(data.challenges);
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (challengeId: string) => {
    try {
      await apiFetch('/challenges/claim', {
        method: 'POST',
        body: JSON.stringify({ challengeId }),
      });
      fetchChallenges();
      if (onPointsEarned) onPointsEarned();
    } catch (error) {
      console.error('Failed to claim reward:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500 border-green-500';
      case 'medium': return 'text-yellow-500 border-yellow-500';
      case 'hard': return 'text-red-500 border-red-500';
      default: return 'text-blue-500 border-blue-500';
    }
  };

  const getDifficultyBg = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'from-green-500/20 to-green-600/20';
      case 'medium': return 'from-yellow-500/20 to-yellow-600/20';
      case 'hard': return 'from-red-500/20 to-red-600/20';
      default: return 'from-blue-500/20 to-blue-600/20';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          🎯 Daily Challenges
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Resets in {getTimeUntilReset()}
        </span>
      </div>

      {challenges.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No challenges available today. Check back tomorrow!
        </p>
      ) : (
        <div className="space-y-3">
          {challenges.map((challenge) => {
            const progress = challenge.progress || 0;
            const percentage = Math.min((progress / challenge.target) * 100, 100);
            const isCompleted = challenge.completed || percentage >= 100;

            return (
              <div
                key={challenge.id}
                className={`relative overflow-hidden rounded-lg border-2 ${getDifficultyColor(challenge.difficulty)} p-4 transition-all hover:shadow-md`}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${getDifficultyBg(challenge.difficulty)} opacity-50`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{challenge.icon}</span>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">
                          {challenge.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {challenge.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-500">
                        +{challenge.reward} pts
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(challenge.difficulty)} border`}>
                        {challenge.difficulty.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-300">
                        Progress: {progress}/{challenge.target}
                      </span>
                      <span className="text-gray-600 dark:text-gray-300">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Claim button */}
                  {isCompleted && !challenge.completed && (
                    <button
                      onClick={() => claimReward(challenge.id)}
                      className="mt-3 w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
                    >
                      🎁 Claim Reward!
                    </button>
                  )}
                  
                  {challenge.completed && (
                    <div className="mt-3 text-center text-green-600 dark:text-green-400 font-bold">
                      ✅ Completed!
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getTimeUntilReset() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}
