# Complete Advertising System Setup Guide

This guide will help you set up Google AdSense and Adsterra ads in your Clicker-App.

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Google AdSense Setup](#google-adsense-setup)
3. [Adsterra Setup](#adsterra-setup)
4. [Environment Variables](#environment-variables)
5. [Database Migration](#database-migration)
6. [Testing](#testing)
7. [Deployment](#deployment-to-vercel)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Google AdSense and Adsterra accounts (can use test mode first)

### Installation Steps

1. **Pull the latest code** with the ad system:
```bash
git pull origin main
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Run database migration:**
```bash
npx prisma migrate dev --name add_ad_system
```

5. **Start development server:**
```bash
npm run dev
```

6. **Visit the dashboard:**
   - Go to http://localhost:3000
   - You should see the "Earn More Points with Ads" section

---

## Google AdSense Setup

### Step 1: Create a Google AdSense Account

1. Go to https://adsense.google.com
2. Click "Sign in" with your Google account
3. Click "Let's go" to start the setup
4. Enter your website URL (e.g., yoursite.vercel.app)
5. Complete the signup form

### Step 2: Get Your Publisher ID

1. Once approved (24-48 hours), go to **Settings → Account information**
2. Find your **Publisher ID** (looks like `ca-pub-xxxxxxxxxxxxxxxx`)
3. Copy it

### Step 3: Create Ad Units

For each ad placement, you need to create an ad unit in Google AdSense:

1. Go to **Ads → By ad unit**
2. Click **"New ad unit"**
3. Choose ad format:
   - **Display ads** for standard placements (header, sidebar, footer)
   - **In-article ads** if using in articles
   - **Matched content** for recommendations

4. Configure ad unit:
   - Name it (e.g., "Sidebar 300x250")
   - Select responsive for automatic sizing
   - Click "Create"

5. Copy the **Slot ID** from the generated code

### Step 4: Repeat for Each Placement

Create ad units for:
- ✅ Header (728x90 Leaderboard)
- ✅ Sidebar (300x250 Medium Rectangle)
- ✅ Footer (728x90 Leaderboard)
- ✅ Modal (300x250 Medium Rectangle)
- ✅ Between sections (Responsive)

### Step 5: Update Environment Variables

Edit `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID="ca-pub-xxxxxxxxxxxxxxxx"
NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_HEADER="1234567890"
NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_SIDEBAR="0987654321"
NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_FOOTER="1357924680"
NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_MODAL="2468013579"
NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_BETWEEN="3691357802"
```

Replace with your actual Publisher ID and Slot IDs.

---

## Adsterra Setup

### Step 1: Create Adsterra Account

1. Go to https://adsterra.com
2. Click "Become a Publisher"
3. Fill in signup form:
   - Email address
   - Website name
   - Website URL (e.g., yoursite.vercel.app)
   - Traffic sources
4. Submit and wait for approval (usually 1-24 hours)

### Step 2: Verify Your Website

1. After approval, go to **My Sites**
2. Select your website
3. Follow verification steps (usually add meta tag to HTML head)
4. Verify ownership

### Step 3: Create Ad Zones

1. Go to **Zones** → **Create New Zone**
2. Configure zone:
   - Zone name: "Clicker App Rewarded"
   - Zone type: Select **"Rewarded video"** or **"Banner"**
   - Zone dimensions: Choose based on placement
   - Billing model: CPM recommended
3. Click "Create"
4. Copy your **Zone ID** (numeric, e.g., `1234567890`)

### Step 4: Create Multiple Zones (Optional)

Create separate zones for:
- Rewarded ads (main earning activity)
- Display ads (sidebar, header, footer)

### Step 5: Update Environment Variables

Edit `.env.local`:

```env
NEXT_PUBLIC_ADSTERRA_ZONE_ID="1234567890"
```

Replace with your actual Zone ID.

---

## Environment Variables

Complete list of all variables needed:

```env
# ============================================
# DATABASE (Required)
# ============================================
DATABASE_URL="postgresql://user:password@localhost:5432/clicker_app"
DIRECT_URL="postgresql://user:password@localhost:5432/clicker_app"

# ============================================
# AUTHENTICATION (Required)
# ============================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-generated-key"

# ============================================
# GOOGLE ADSENSE (Optional - Leave empty to disable)
# ============================================
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID="ca-pub-xxxxxxxxxxxxxxxx"
NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_HEADER="1234567890"
NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_SIDEBAR="0987654321"
NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_FOOTER="1357924680"
NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_MODAL="2468013579"
NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_BETWEEN="3691357802"

# ============================================
# ADSTERRA (Optional - Leave empty to disable)
# ============================================
NEXT_PUBLIC_ADSTERRA_ZONE_ID="1234567890"
```

**Note:** All `NEXT_PUBLIC_*` variables are visible to the client (this is required).

---

## Database Migration

The ad system requires new fields in your User model:

### What Gets Added

```prisma
// In User model:
lastAdWatch       DateTime?   // Last time user watched an ad
adWatchCount      Int @default(0)  // Number of ads watched today
```

### Run Migration

```bash
# Automatically generates migration from schema changes
npx prisma migrate dev --name add_ad_system

# Or manually apply migration if needed
npx prisma migrate deploy
```

### Verify Changes

```bash
npx prisma studio
# Navigate to User table - you should see the new fields
```

---

## Testing

### Test Without Real Ad Networks

To test the system without setting up Google AdSense or Adsterra:

1. **Keep environment variables empty** or commented out
2. Ad components will automatically disable themselves
3. RewardedAdButton will still work but won't show real ads

### Local Testing

1. Start the dev server:
```bash
npm run dev
```

2. Go to http://localhost:3000/login
3. Create a test account
4. Click "Watch Ad" button
5. Verify:
   - Dialog appears
   - Points are awarded
   - User points update
   - Cooldown is enforced

### Check Browser Console

Open DevTools (F12) and check:
- **Console tab:** Any JavaScript errors
- **Network tab:** API calls to `/api/points/reward-ad`
- **Application tab:** localStorage for cooldown tracking

### Database Verification

```bash
# Open Prisma Studio
npx prisma studio

# Navigate to PointsHistory table
# You should see entries with type: "ad_watch_*"
```

---

## Deployment to Vercel

### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Add complete advertising system"
git push origin main
```

### Step 2: Add Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add all variables from `.env.example`:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (set to your Vercel domain)
   - `NEXTAUTH_SECRET` (generate new one with `openssl rand -base64 32`)
   - `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID`
   - All `NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_*` variables
   - `NEXT_PUBLIC_ADSTERRA_ZONE_ID`

### Step 3: Update NEXTAUTH_URL for Production

```
NEXTAUTH_URL="https://your-app.vercel.app"
```

### Step 4: Deploy

```bash
# Just push to main - Vercel auto-deploys
git push origin main

# Or manually trigger from Vercel dashboard
# Click "Deploy" on your project
```

### Step 5: Verify on Production

1. Go to your production URL: https://your-app.vercel.app
2. Login with test account
3. Check if ads are loading (might need 24+ hours for Google AdSense approval)
4. Test rewarded ad button
5. Check browser console for errors

---

## Ad Placements in Code

### Current Placements

The dashboard (`app/page.tsx`) includes:

1. **Rewarded Ad Section:**
   ```tsx
   <RewardedAdButton onRewardEarned={(points) => { ... }} />
   ```

2. **Google AdSense Sidebar:**
   ```tsx
   <AdContainer placement="sidebar">
     <GoogleAdSense placement="sidebar" />
   </AdContainer>
   ```

3. **Adsterra Display:**
   ```tsx
   <AdContainer placement="sidebar">
     <AdsterraAd width={300} height={250} />
   </AdContainer>
   ```

### Add More Placements

To add ads to other pages:

```tsx
import { GoogleAdSense, AdsterraAd, RewardedAdButton, AdContainer } from '@/components/ads';

export default function YourPage() {
  return (
    <div>
      {/* Header ad */}
      <AdContainer placement="header">
        <GoogleAdSense placement="header" />
      </AdContainer>

      {/* Your content */}
      <div>Content here</div>

      {/* Footer ad */}
      <AdContainer placement="footer">
        <AdsterraAd width={728} height={90} />
      </AdContainer>

      {/* Rewarded section */}
      <RewardedAdButton />
    </div>
  );
}
```

---

## Troubleshooting

### Problem: Ads Not Showing

**Solution:**
1. Check environment variables are set correctly
2. Restart dev server: `npm run dev`
3. Hard refresh browser: `Ctrl+Shift+R` (or `Cmd+Shift+R`)
4. Check browser console for errors
5. Verify ad units are created in your ad network dashboards

### Problem: "Cooldown active" Error

**Solution:**
1. This is expected - wait 5 minutes between ads
2. Clear localStorage to reset (DevTools → Application → Local Storage → Clear)
3. Or restart browser/incognito window

### Problem: Points Not Updating

**Solution:**
1. Check you're logged in
2. Check `/api/points/reward-ad` endpoint exists
3. Look at server logs for errors
4. Verify database connection working: `npx prisma studio`
5. Check PointsHistory table has new entries

### Problem: 'document is not defined' Error

**Solution:**
1. This means code is running on server when it should run on client
2. Ensure component has `'use client'` at the top
3. Wrap in `typeof window !== 'undefined'` checks
4. Use `useEffect` for DOM manipulation

### Problem: Ads Showing Test Content

**Solution:**
1. You're likely in AdSense or Adsterra test mode
2. This is normal before approval
3. Wait 24-48 hours for AdSense approval
4. Check advertiser networks in your accounts

### Problem: Vercel Build Fails

**Solution:**
1. Make sure build script includes: `prisma generate && next build`
2. Check that all environment variables are set in Vercel
3. Verify `dynamic = 'force-dynamic'` is on all API routes
4. Run locally: `npm run build` to test

---

## File Structure Reference

```
components/ads/
├── GoogleAdSense.tsx       # Google ad component (300 lines)
├── AdsterraAd.tsx         # Adsterra ad component (75 lines)
├── RewardedAdButton.tsx   # Rewarded ad button (180 lines)
├── AdContainer.tsx        # Ad wrapper component (45 lines)
└── index.ts              # Exports

lib/ads/
├── ad-config.ts          # Configuration (70 lines)
└── ad-utils.ts           # Utilities (140 lines)

app/api/points/reward-ad/
└── route.ts              # API endpoint (140 lines)

app/page.tsx              # Updated with ads section
.env.local                # Your configuration
.env.example              # Reference template
```

---

## Security Considerations

### What's Protected

✅ Points awarded only after server-side verification
✅ User authentication required for all ad rewards
✅ Database cooldowns prevent fraud
✅ Activity logged to database for audit trail
✅ No client-side point manipulation possible

### What's Public (By Design)

⚠️ Ad network IDs (`NEXT_PUBLIC_*`) - these are meant to be public
⚠️ Configuration values - used for loading ads

### What Must Stay Secret

🔒 Database URL - kept in server environment only
🔒 NextAuth secret - server-only
🔒 Ad network passwords - never expose these

---

## Monitoring & Analytics

### View Ad Statistics

**In Google AdSense Dashboard:**
- Go to Reports → Performance report
- Filter by ad unit to see impressions, clicks, earnings

**In Adsterra Dashboard:**
- Go to Statistics
- View impressions, clicks, earnings by zone

### View in Your Database

```sql
-- Count ads watched per user
SELECT 
  "userId", 
  COUNT(*) as ads_watched, 
  SUM(amount) as total_points_earned
FROM "PointsHistory"
WHERE type LIKE 'ad_watch_%'
GROUP BY "userId"
ORDER BY ads_watched DESC;

-- View ad revenue over time
SELECT 
  DATE("createdAt") as day,
  COUNT(*) as total_ads,
  SUM(amount) as total_points
FROM "PointsHistory"
WHERE type LIKE 'ad_watch_%'
GROUP BY DATE("createdAt")
ORDER BY day DESC;
```

---

## Next Steps

1. ✅ Complete this setup guide
2. ✅ Create ad accounts and zones
3. ✅ Add environment variables
4. ✅ Run database migration
5. ✅ Test locally
6. ✅ Deploy to Vercel
7. ⬜ Monitor ad performance and user engagement
8. ⬜ Optimize ad placements based on data
9. ⬜ Consider adding more ad activities
10. ⬜ Track revenue and user lifetime value

---

## Support & Resources

- **Google AdSense Help:** https://support.google.com/adsense
- **Adsterra Support:** https://adsterra.com/support
- **Next.js Documentation:** https://nextjs.org/docs
- **Prisma Documentation:** https://www.prisma.io/docs

---

## Quick Reference

### Essential Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Run database migration
npx prisma migrate dev

# Open database UI
npx prisma studio

# Push code to GitHub
git push origin main
```

### Important Files

- `.env.local` - Your configuration
- `app/page.tsx` - Dashboard with ads
- `components/ads/` - Ad components
- `lib/ads/` - Ad utilities
- `app/api/points/reward-ad/route.ts` - API endpoint
- `prisma/schema.prisma` - Database schema

---

**Last Updated:** December 3, 2025
**Version:** 1.0 Complete Advertising System
