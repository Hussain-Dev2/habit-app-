// Google AdSense Configuration
export const GOOGLE_ADSENSE_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID || '',
  enabled: !!process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID,
};

// Adsterra Configuration
export const ADSTERRA_CONFIG = {
  zonId: process.env.NEXT_PUBLIC_ADSTERRA_ZONE_ID || '',
  enabled: !!process.env.NEXT_PUBLIC_ADSTERRA_ZONE_ID,
};

// Ad placement locations
export type AdPlacement = 
  | 'header' 
  | 'sidebar' 
  | 'footer' 
  | 'modal'
  | 'between-sections';

// Rewarded ad configuration
export const REWARDED_AD_CONFIG = {
  pointsReward: 50,
  cooldownMinutes: 5,
  dailyLimit: 10,
};
