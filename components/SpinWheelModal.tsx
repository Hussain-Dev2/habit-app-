'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpin: () => Promise<number>; // Returns the reward amount
  reward: number | null;
}

const SEGMENTS = [
  { color: '#FF6B6B', points: 10, label: '10' },
  { color: '#4ECDC4', points: 15, label: '15' },
  { color: '#FFE66D', points: 20, label: '20' },
  { color: '#95E1D3', points: 25, label: '25' },
  { color: '#F38181', points: 30, label: '30' },
  { color: '#AA96DA', points: 35, label: '35' },
  { color: '#FCBAD3', points: 40, label: '40' },
  { color: '#A8E6CF', points: 50, label: '50' },
];

export default function SpinWheelModal({ isOpen, onClose, onSpin, reward }: SpinWheelModalProps) {
  const { t } = useLanguage();
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    if (reward !== null) {
      const timer = setTimeout(() => setShowReward(true), 0);
      return () => clearTimeout(timer);
    }
  }, [reward]);

  const handleSpin = async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowReward(false);

    try {
      const rewardAmount = await onSpin();
      
      // Find which segment matches the reward
      const segmentIndex = SEGMENTS.findIndex(s => s.points === rewardAmount);
      const segmentAngle = 360 / SEGMENTS.length;
      const targetRotation = 360 * 5 + (segmentIndex * segmentAngle) + (segmentAngle / 2);

      setRotation(targetRotation);

      // Show reward after spin completes
      setTimeout(() => {
        setIsSpinning(false);
        setShowReward(true);
      }, 4000);
    } catch (error) {
      setIsSpinning(false);
      console.error('Spin failed:', error);
    }
  };

  const handleClose = () => {
    if (!isSpinning) {
      setRotation(0);
      setShowReward(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-cyan-50 dark:from-gray-900 dark:to-cyan-950 rounded-3xl p-8 max-w-lg w-full shadow-2xl border-4 border-cyan-400 dark:border-cyan-600 relative">
        {!isSpinning && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
          >
            ✕
          </button>
        )}

        <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-cyan-600 via-orange-500 to-emerald-600 bg-clip-text text-transparent">
          🎡 {t.spinWheelActivity || 'Spin the Wheel'}
        </h2>

        {/* Wheel Container */}
        <div className="relative w-80 h-80 mx-auto mb-6">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 -translate-y-2">
            <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-500 drop-shadow-lg"></div>
          </div>

          {/* Wheel */}
          <div className="relative w-full h-full">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
              }}
            >
              {SEGMENTS.map((segment, index) => {
                const angle = (360 / SEGMENTS.length) * index;
                const nextAngle = (360 / SEGMENTS.length) * (index + 1);
                const startX = 100 + 95 * Math.cos((angle - 90) * Math.PI / 180);
                const startY = 100 + 95 * Math.sin((angle - 90) * Math.PI / 180);
                const endX = 100 + 95 * Math.cos((nextAngle - 90) * Math.PI / 180);
                const endY = 100 + 95 * Math.sin((nextAngle - 90) * Math.PI / 180);

                return (
                  <g key={index}>
                    <path
                      d={`M 100 100 L ${startX} ${startY} A 95 95 0 0 1 ${endX} ${endY} Z`}
                      fill={segment.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                    <text
                      x={100 + 60 * Math.cos(((angle + nextAngle) / 2 - 90) * Math.PI / 180)}
                      y={100 + 60 * Math.sin(((angle + nextAngle) / 2 - 90) * Math.PI / 180)}
                      fill="white"
                      fontSize="16"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {segment.label}
                    </text>
                  </g>
                );
              })}
              {/* Center circle */}
              <circle cx="100" cy="100" r="15" fill="white" stroke="#333" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Spin Button or Result */}
        {showReward && reward !== null ? (
          <div className="text-center">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 text-white rounded-2xl p-6 mb-4 animate-bounce">
              <div className="text-6xl mb-2">🎉</div>
              <div className="text-4xl font-extrabold">+{reward}</div>
              <div className="text-xl font-semibold">{t.points || 'Points'}</div>
            </div>
            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 shadow-lg"
            >
              {t.close || 'Close'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`w-full font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 shadow-lg ${
              isSpinning
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:from-orange-600 hover:via-pink-600 hover:to-purple-600 text-white'
            }`}
          >
            {isSpinning ? '🎡 Spinning...' : '🎯 Spin Now!'}
          </button>
        )}
      </div>
    </div>
    </>
  );
}
