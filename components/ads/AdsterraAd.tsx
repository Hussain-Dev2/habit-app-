'use client';

import { useEffect } from 'react';
import { ADSTERRA_CONFIG } from '@/lib/ads/ad-config';
import { loadAdsterraScript } from '@/lib/ads/ad-utils';

interface AdsterraAdProps {
  className?: string;
  width?: number;
  height?: number;
}

export const AdsterraAd: React.FC<AdsterraAdProps> = ({ 
  className = '', 
  width = 728,
  height = 90
}) => {
  useEffect(() => {
    if (ADSTERRA_CONFIG.enabled) {
      loadAdsterraScript(ADSTERRA_CONFIG.zonId);
    }
  }, []);

  if (!ADSTERRA_CONFIG.enabled) {
    return null;
  }

  return (
    <div className={`ad-container ${className}`}>
      <div
        id={`adsterra-zone-${ADSTERRA_CONFIG.zonId}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          margin: '0 auto',
        }}
      />
    </div>
  );
};

export default AdsterraAd;
