# 🚀 Advertising System - Quick Start

## 30-Second Setup

```bash
# 1. Run migration
npx prisma migrate dev --name add_ad_system

# 2. Copy and edit environment file
cp .env.example .env.local
# → Add your Google AdSense Publisher ID
# → Add your Adsterra Zone ID

# 3. Start dev server
npm run dev

# 4. Visit http://localhost:3000
# → See "Earn More Points with Ads" section
```

## Environment Variables Needed

```env
# Google AdSense (get from https://adsense.google.com)
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID="ca-pub-xxxxxxxxxxxxxxxx"
NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_SIDEBAR="1234567890"

# Adsterra (get from https://adsterra.com)
NEXT_PUBLIC_ADSTERRA_ZONE_ID="1234567890"
```

## File Locations

```
📁 components/ads/
  ├─ GoogleAdSense.tsx        (Google ads component)
  ├─ AdsterraAd.tsx          (Adsterra ads component)
  ├─ RewardedAdButton.tsx    (Watch-to-earn button)
  ├─ AdContainer.tsx         (Ad wrapper)
  └─ index.ts               (Exports)

📁 lib/ads/
  ├─ ad-config.ts           (Config & constants)
  └─ ad-utils.ts            (Utility functions)

📁 app/api/points/
  └─ reward-ad/route.ts     (API endpoint)

📄 app/page.tsx             (Updated dashboard)
📄 .env.local              (Your config - edit this!)
📄 .env.example            (Template)
```

## How It Works

1. **User clicks** "Watch Ad" button on dashboard
2. **Adsterra ad displays** in modal (or Google ad)
3. **User watches** ad for ~5 seconds
4. **Backend awards** points (50 points default)
5. **Database updates** lifetimePoints
6. **UI refreshes** with new points

## API Endpoint

```
POST /api/points/reward-ad

Request:
{
  "adType": "adsterra" | "google"
}

Response (Success):
{
  "success": true,
  "reward": 50,
  "user": { id, points, lifetimePoints, clicks }
}

Response (Cooldown):
{
  "error": "Cooldown active",
  "remainingMinutes": 3
}
```

## Configuration Options

Edit `lib/ads/ad-config.ts`:

```typescript
// Change reward amount
pointsReward: 50          // Default

// Change cooldown
cooldownMinutes: 5        // Between ads

// Change daily limit
dailyLimit: 10           // Per user per day
```

Or `app/api/points/reward-ad/route.ts`:

```typescript
AD_REWARDS = {
  adsterra: 50,   // Points for Adsterra ads
  google: 30,     // Points for Google ads
}

AD_COOLDOWN_MINUTES = {
  adsterra: 5,    // Wait time
  google: 10,
}

AD_DAILY_LIMITS = {
  adsterra: 10,   // Max per day
  google: 20,
}
```

## Usage in Components

### Add Rewarded Ad Button
```tsx
import { RewardedAdButton } from '@/components/ads';

<RewardedAdButton 
  onRewardEarned={(points) => {
    console.log(`Earned ${points} points!`);
  }}
/>
```

### Add Display Ad
```tsx
import { GoogleAdSense, AdContainer } from '@/components/ads';

<AdContainer placement="sidebar">
  <GoogleAdSense placement="sidebar" />
</AdContainer>
```

### Add Adsterra Ad
```tsx
import { AdsterraAd, AdContainer } from '@/components/ads';

<AdContainer placement="sidebar">
  <AdsterraAd width={300} height={250} />
</AdContainer>
```

## Placements Available

- `"header"` - Top of page (728x90)
- `"sidebar"` - Side column (300x250)
- `"footer"` - Bottom of page (728x90)
- `"modal"` - Dialog box (300x250)
- `"between-sections"` - Between content (responsive)

## Testing

### Local Testing
```bash
npm run dev
# Visit http://localhost:3000
# Click "Watch Ad" button
# Should see modal and earn points
```

### Check Console
```javascript
// In browser DevTools → Console
localStorage.getItem('lastRewardedAdTime')
localStorage.getItem('rewardedAdCount')
```

### Reset for Testing
```javascript
// In browser console
localStorage.clear()
location.reload()
```

## Deployment to Vercel

1. **Push code:**
```bash
git add .
git commit -m "Add advertising system"
git push origin main
```

2. **Add environment variables in Vercel dashboard:**
   - Settings → Environment Variables
   - Add all `NEXT_PUBLIC_*` variables
   - Update `NEXTAUTH_URL` to your Vercel domain

3. **Redeploy:**
```bash
# Auto-deploys on push, or manually from dashboard
```

## Database

New fields added to User model:
```prisma
lastAdWatch    DateTime?     // Last ad watched timestamp
adWatchCount   Int @default(0)  // Ads watched today
```

Migration created: `prisma/migrations/20251203_add_ad_system/`

Apply with:
```bash
npx prisma migrate dev
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Ads not showing | Check environment variables set, restart `npm run dev`, hard refresh browser |
| Points not updating | Check logged in, verify DB connection, check server logs |
| "Cooldown active" | Expected! Wait 5 min, or clear localStorage |
| Build fails | Run `npm run build` locally to debug |
| Vercel deployment fails | Check env vars added to Vercel dashboard |

## Documentation

- **Full guide:** `AD_SYSTEM_GUIDE.md` (500+ lines)
- **Setup guide:** `ADVERTISING_SETUP_GUIDE.md` (650+ lines)
- **This file:** Quick reference
- **Implementation:** `ADVERTISING_IMPLEMENTATION.md` (summary)

## Key Features

✅ Google AdSense support
✅ Adsterra rewarded ads
✅ Automatic database updates
✅ Cooldown system (prevents spam)
✅ Daily limits per user
✅ Vercel compatible
✅ Works with Server Components
✅ No "document is not defined" errors
✅ Activity logged to database
✅ Responsive & dark mode
✅ Production ready

## Security

- ✅ Server-side point verification
- ✅ User authentication required
- ✅ Database cooldown enforcement
- ✅ Activity audit trail
- ✅ No client-side manipulation possible

## Commands Reference

```bash
# Start dev
npm run dev

# Build
npm run build

# Database migration
npx prisma migrate dev

# Database UI
npx prisma studio

# Git push
git push origin main

# Open in browser
open http://localhost:3000
```

## Important Notes

1. **AdSense approval takes 24-48 hours** after adding your site
2. **Adsterra approval takes 1-24 hours**
3. Test ads will show during approval period
4. Environment variables with `NEXT_PUBLIC_` are visible to client (this is required for ads)
5. Always keep `DATABASE_URL` and `NEXTAUTH_SECRET` private (not in `NEXT_PUBLIC_`)

## Next Steps

1. Create Google AdSense account → https://adsense.google.com
2. Create Adsterra account → https://adsterra.com
3. Add environment variables to `.env.local`
4. Run migration: `npx prisma migrate dev`
5. Test: `npm run dev`
6. Deploy to Vercel

## Earnings

Typical rates:
- Google AdSense: $0.25-$3 per 1000 impressions
- Adsterra: $0.10-$0.50 per 1000 impressions
- User engagement improves (more points = longer playtime = retention)

## Questions?

Check:
1. `AD_SYSTEM_GUIDE.md` - Complete documentation
2. `ADVERTISING_SETUP_GUIDE.md` - Step-by-step setup
3. Browser console - JavaScript errors
4. Server logs - Backend errors
5. Vercel logs - Deployment issues

---

**Status:** ✅ Complete and ready to use
**Version:** 1.0
**Updated:** December 3, 2025
