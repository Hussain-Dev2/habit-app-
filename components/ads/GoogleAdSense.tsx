'use client';

import { useEffect } from 'react';
import { GOOGLE_ADSENSE_CONFIG, type AdPlacement } from '@/lib/ads/ad-config';
import { loadGoogleAdSenseScript } from '@/lib/ads/ad-utils';

interface GoogleAdSenseProps {
  placement: AdPlacement;
  className?: string;
}

const SLOT_IDS: Record<AdPlacement, string> = {
  header: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_HEADER || '',
  sidebar: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_SIDEBAR || '',
  footer: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_FOOTER || '',
  modal: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_MODAL || '',
  'between-sections': process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_BETWEEN || '',
};

export const GoogleAdSense: React.FC<GoogleAdSenseProps> = ({ 
  placement, 
  className = '' 
}) => {
  useEffect(() => {
    // Load script only once
    if (GOOGLE_ADSENSE_CONFIG.enabled) {
      loadGoogleAdSenseScript(GOOGLE_ADSENSE_CONFIG.clientId);
    }
  }, []);

  if (!GOOGLE_ADSENSE_CONFIG.enabled) {
    return null;
  }

  const slotId = SLOT_IDS[placement];
  if (!slotId) {
    console.warn(`No Google AdSense slot configured for placement: ${placement}`);
    return null;
  }

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={GOOGLE_ADSENSE_CONFIG.clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <script>
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </script>
    </div>
  );
};

export default GoogleAdSense;
