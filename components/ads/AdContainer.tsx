'use client';

import { ReactNode } from 'react';
import { type AdPlacement } from '@/lib/ads/ad-config';

interface AdContainerProps {
  placement: AdPlacement;
  children: ReactNode;
  className?: string;
}

export const AdContainer: React.FC<AdContainerProps> = ({ 
  placement, 
  children, 
  className = '' 
}) => {
  const containerStyles: Record<AdPlacement, string> = {
    header: 'w-full bg-gray-50 border-b border-gray-200 py-2',
    sidebar: 'w-full bg-gray-50 border border-gray-200 rounded-lg p-2',
    footer: 'w-full bg-gray-50 border-t border-gray-200 py-2',
    modal: 'w-full bg-gray-50 border border-gray-200 rounded-lg p-4',
    'between-sections': 'w-full my-4 bg-gray-50 border border-gray-200 rounded-lg p-2',
  };

  return (
    <div className={`ad-wrapper ${containerStyles[placement]} ${className}`}>
      <div className="flex justify-center">
        {children}
      </div>
    </div>
  );
};

export default AdContainer;
