# Advertising System Guide

Complete guide to the integrated Google AdSense and Adsterra advertising system.

## Overview

The advertising system provides two types of ad integrations:

1. **Display Ads** (Google AdSense & Adsterra): Non-intrusive ads placed in various locations
2. **Rewarded Ads** (Adsterra): Users watch ads to earn points

## Architecture

### Components

```
components/ads/
├── GoogleAdSense.tsx       # Google AdSense display component
├── AdsterraAd.tsx         # Adsterra display ads
├── RewardedAdButton.tsx   # Button to watch rewarded ads
├── AdContainer.tsx        # Wrapper for ad placement
└── index.ts              # Barrel export

lib/ads/
├── ad-config.ts          # Configuration constants
└── ad-utils.ts           # Utility functions
```

### Key Features

✅ Server-safe: Works with Next.js App Router & React Server Components
✅ No 'document is not defined' errors: All client-side code uses 'use client'
✅ Vercel compatible: Uses environment variables for configuration
✅ Cooldown system: Prevents ad spam
✅ Daily limits: Restricts how many ads users can watch
✅ Automatic tracking: Logs all ad activity to database
✅ Point updates: Database automatically updated after ad viewing

## Setup Instructions

### 1. Google AdSense Setup

#### Create AdSense Account
1. Go to https://adsense.google.com
2. Sign up with your Google account
3. Add your website domain
4. Wait for approval (usually 24-48 hours)

#### Get Your Publisher ID
1. In AdSense dashboard, go to Settings → Account Information
2. Copy your Publisher ID (format: `ca-pub-xxxxxxxxxxxxxxxx`)

#### Create Ad Units
1. Go to Ads → By ad unit
2. Create new ad units for each placement:
   - Header ads (728x90 leaderboard)
   - Sidebar ads (300x250 medium rectangle)
   - Footer ads (728x90 leaderboard)
   - Modal ads (300x250 medium rectangle)
   - Between sections (responsive)

3. For each unit, copy the Slot ID (numeric ID)

#### Update Environment Variables
Add to `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID="ca-pub-xxxxxxxxxxxxxxxx"
NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_HEADER="1234567890"
NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_SIDEBAR="0987654321"
NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_FOOTER="1357924680"
NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_MODAL="2468013579"
NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_BETWEEN="3691357802"
```

### 2. Adsterra Setup

#### Create Account
1. Go to https://adsterra.com
2. Sign up for a publisher account
3. Complete verification

#### Create Zone
1. In Adsterra dashboard, go to Zones
2. Create new zone:
   - Zone name: "Clicker App Rewarded"
   - Zone type: Rewarded ads
   - Format: Choose appropriate size (336x280, 300x250, etc.)

3. Copy your Zone ID (numeric, e.g., `1234567890`)

#### Update Environment Variables
Add to `.env.local`:
```env
NEXT_PUBLIC_ADSTERRA_ZONE_ID="1234567890"
```

## Usage Examples

### Using Display Ads

#### Google AdSense
```tsx
import { GoogleAdSense, AdContainer } from '@/components/ads';

export default function MyPage() {
  return (
    <>
      <h1>My Content</h1>
      
      {/* Header ad */}
      <AdContainer placement="header">
        <GoogleAdSense placement="header" />
      </AdContainer>

      <p>Page content...</p>

      {/* Footer ad */}
      <AdContainer placement="footer">
        <GoogleAdSense placement="footer" />
      </AdContainer>
    </>
  );
}
```

#### Adsterra Display Ads
```tsx
import { AdsterraAd, AdContainer } from '@/components/ads';

export default function MyPage() {
  return (
    <AdContainer placement="sidebar">
      <AdsterraAd width={728} height={90} />
    </AdContainer>
  );
}
```

### Using Rewarded Ads

```tsx
'use client';

import { RewardedAdButton } from '@/components/ads';

export default function RewardSection() {
  const handleReward = (points: number) => {
    console.log(`User earned ${points} points!`);
    // Update UI, show notification, etc.
  };

  return (
    <div>
      <h2>Earn Extra Points</h2>
      <RewardedAdButton onRewardEarned={handleReward} />
    </div>
  );
}
```

## API Endpoints

### POST `/api/points/reward-ad`

Awards points after watching a rewarded ad.

**Request Body:**
```json
{
  "adType": "adsterra" | "google"
}
```

**Response (Success):**
```json
{
  "success": true,
  "reward": 50,
  "user": {
    "id": "user-id",
    "points": 1250,
    "lifetimePoints": 5000,
    "clicks": 150
  },
  "message": "Earned 50 points from watching ad!"
}
```

**Response (Cooldown):**
```json
{
  "error": "Cooldown active",
  "remainingMinutes": 3
}
```

**Response (Daily Limit):**
```json
{
  "error": "Daily limit reached",
  "dailyLimit": 10
}
```

## Configuration

### Reward Settings

Edit `lib/ads/ad-config.ts`:

```typescript
export const REWARDED_AD_CONFIG = {
  pointsReward: 50,      // Points earned per ad
  cooldownMinutes: 5,    // Wait time between ads
  dailyLimit: 10,        // Max ads per day
};
```

### Ad Cooldowns

Edit `app/api/points/reward-ad/route.ts`:

```typescript
const AD_COOLDOWN_MINUTES = {
  adsterra: 5,   // 5 minutes
  google: 10,    // 10 minutes
};

const AD_DAILY_LIMITS = {
  adsterra: 10,  // 10 ads per day
  google: 20,    // 20 ads per day
};

const AD_REWARDS = {
  adsterra: 50,  // 50 points
  google: 30,    // 30 points
};
```

## Security

### Database Updates
- All ad rewards are processed server-side
- User authentication verified before granting points
- Activity logged to `PointsHistory` table
- No client-side point manipulation possible

### Rate Limiting
- Cooldown prevents rapid repeated viewing
- Daily limits prevent abuse
- Database checks prevent duplicate rewards

### Environment Variables
- All sensitive IDs stored in environment variables
- Never hardcoded in source code
- Different values for dev/production

## Troubleshooting

### Ads Not Showing

1. **Check environment variables:**
   ```bash
   echo $NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID
   echo $NEXT_PUBLIC_ADSTERRA_ZONE_ID
   ```

2. **Verify component is client-side:**
   - Must have `'use client'` directive
   - Can't be in Server Component directly

3. **Check browser console for errors:**
   - Open DevTools → Console tab
   - Look for script loading errors

4. **Wait for AdSense approval:**
   - AdSense takes 24-48 hours to approve
   - Test ads show during approval period

### Points Not Updating

1. **Check API route:**
   - Verify `/api/points/reward-ad` exists
   - Check for `dynamic = 'force-dynamic'`

2. **Check authentication:**
   - Ensure user is logged in
   - Verify session is valid

3. **Check database:**
   - Verify `lastAdWatch` and `adWatchCount` fields exist in User model
   - Run migrations if needed

4. **Review server logs:**
   - Check terminal for errors during API call
   - Check database connection

### Cooldown Not Working

1. **Check `lastAdWatch` field:**
   - Must be updated in database
   - Verify migration created field

2. **Check client-side tracking:**
   - Open DevTools → Application → Local Storage
   - Look for `lastRewardedAdTime`

3. **Clear localStorage:**
   ```javascript
   localStorage.clear();
   // Refresh page
   ```

## Vercel Deployment

### Required Configuration

Add environment variables in Vercel dashboard:

1. Go to Project → Settings → Environment Variables
2. Add all `NEXT_PUBLIC_*` variables (visible to client)
3. Add any server-only variables

**Note:** Only `NEXT_PUBLIC_*` variables are available to client-side code in Next.js.

### Build Verification

Before deploying, run:
```bash
npm run build
```

Ensure no errors related to:
- Missing environment variables
- 'document is not defined'
- Prisma client generation

## Performance Considerations

### Script Loading
- Google AdSense and Adsterra scripts loaded lazily
- Scripts only loaded once, even if component renders multiple times
- No impact on initial page load

### Database Queries
- Single query for user points update
- Activity logging runs asynchronously
- Minimal database load

### Client Storage
- localStorage used for client-side cooldown tracking
- Backup server-side cooldown in database
- ~1KB per user

## Analytics

### Tracking Views

All ad impressions and clicks logged to `PointsHistory`:

```prisma
type: "ad_watch_adsterra" | "ad_watch_google"
amount: 50 | 30  // Points earned
description: "Watched adsterra/google advertisement"
```

Query all ad rewards:
```sql
SELECT type, COUNT(*) as count, SUM(amount) as total_points
FROM "PointsHistory"
WHERE type LIKE 'ad_watch_%'
GROUP BY type;
```

### Revenue Tracking

- Google AdSense: Track in AdSense dashboard
- Adsterra: Track in Adsterra dashboard
- Both provide detailed analytics and payouts

## Best Practices

1. **Don't overload ads:** Limit to 2-3 placements per page
2. **Responsive design:** Use responsive ad sizes
3. **User experience:** Don't force ads, make them optional
4. **Placement:** Place ads near relevant content
5. **Testing:** Use test ad IDs first
6. **Transparency:** Tell users how to earn points via ads

## Disable Ads

### Temporarily Disable During Testing

```typescript
// lib/ads/ad-config.ts
export const GOOGLE_ADSENSE_CONFIG = {
  clientId: '',  // Empty to disable
  enabled: false,
};

export const ADSTERRA_CONFIG = {
  zonId: '',     // Empty to disable
  enabled: false,
};
```

### Or use environment variables:

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID=""
NEXT_PUBLIC_ADSTERRA_ZONE_ID=""
```

## Support

For issues with:
- **Google AdSense:** https://support.google.com/adsense
- **Adsterra:** https://adsterra.com/support
- **Next.js:** https://nextjs.org/docs

## Changelog

### Version 1.0 (Current)
- ✅ Google AdSense display ads
- ✅ Adsterra display ads
- ✅ Rewarded ad button with cooldown
- ✅ Database point updates
- ✅ Vercel compatible
- ✅ Server/Client component safe
