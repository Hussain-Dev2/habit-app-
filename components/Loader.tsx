'use client';

import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'cyan' | 'orange' | 'emerald' | 'white';
}

export default function Loader({ size = 'md', color = 'cyan' }: LoaderProps) {
  const containerSizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const spanConfig = {
    sm: { width: 'w-5', height: 'h-1', positions: [40, 35, 30, 25, 20, 15, 10, 5] },
    md: { width: 'w-8', height: 'h-1.5', positions: [80, 70, 60, 50, 40, 30, 20, 10] },
    lg: { width: 'w-12', height: 'h-2', positions: [120, 105, 90, 75, 60, 45, 30, 15] },
  };

  const colorClasses = {
    cyan: 'bg-cyan-400 shadow-[0_2px_8px_rgba(34,211,238,0.5)]',
    orange: 'bg-orange-400 shadow-[0_2px_8px_rgba(251,146,60,0.5)]',
    emerald: 'bg-emerald-400 shadow-[0_2px_8px_rgba(52,211,153,0.5)]',
    white: 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.3)]',
  };

  const config = spanConfig[size];

  return (
    <div className={`spinner relative ${containerSizes[size]} flex justify-center items-center rounded-full`}>
      {config.positions.map((leftPos, index) => (
        <span
          key={index}
          className={`absolute top-1/2 -translate-y-1/2 ${config.width} ${config.height} ${colorClasses[color]} rounded-sm animate-domino`}
          style={{
            left: `${leftPos}px`,
            animationDelay: `${0.125 * (index + 1)}s`,
          }}
        />
      ))}
    </div>
  );
}
