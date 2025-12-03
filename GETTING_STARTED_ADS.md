# 🎬 Getting Started - Action Items

Your advertising system is ready! Follow these steps to go live.

## 📋 Phase 1: Setup (Today - 1 Hour)

### Step 1: Database Migration (5 minutes)
```bash
cd "c:\Users\huiq9\OneDrive\Desktop\My-Project\Click-app\Clicker-app-main\Clicker-app-main"
npx prisma migrate dev --name add_ad_system
```

**What it does:**
- Adds `lastAdWatch` and `adWatchCount` fields to User model
- Updates PointsHistory to track ad types
- Creates migration file for safety

**Expected output:**
```
✓ Database reset, and migrations applied
✓ Generated Prisma Client
```

### Step 2: Create Google AdSense Account (30 minutes)

1. Go to https://adsense.google.com
2. Click "Sign In" with Google account
3. Follow signup wizard:
   - Enter your website URL (or use localhost for testing)
   - Accept terms
   - Wait for approval (usually 24-48 hours)

**What to save:**
- Publisher ID: `ca-pub-xxxxxxxxxxxxxxxx` (save this!)

### Step 3: Create Ad Units in Google AdSense (15 minutes)

1. In AdSense dashboard, go to **Ads → By ad unit**
2. Click **"New ad unit"**
3. For SIDEBAR placement:
   - Name: "Sidebar Ad"
   - Format: "Display ads"
   - Size: "300 × 250"
   - Click "Create"
4. Copy the **Slot ID** (numbers only)
5. Repeat for other placements if desired

**Slot IDs to create:**
- [ ] `SLOT_HEADER` (728×90)
- [ ] `SLOT_SIDEBAR` (300×250) - ← Most important, start here
- [ ] `SLOT_FOOTER` (728×90)
- [ ] `SLOT_MODAL` (300×250)
- [ ] `SLOT_BETWEEN` (Responsive)

### Step 4: Create Adsterra Account (30 minutes)

1. Go to https://adsterra.com
2. Click "Become a Publisher"
3. Fill in signup form:
   - Email
   - Website name
   - Website URL
   - Traffic sources
4. Submit for approval (usually 1-24 hours)

### Step 5: Create Adsterra Zone (10 minutes)

1. After approval, go to **Zones**
2. Click **"Create New Zone"**
3. Configure:
   - Zone name: "Clicker App Rewards"
   - Zone type: "Rewarded video" (for RewardedAdButton)
   - Format: 336×280 or 300×250
4. Create zone
5. Copy **Zone ID** (numbers only)

**Save:**
- Zone ID (e.g., `1234567890`)

### Step 6: Update Environment Variables (5 minutes)

Edit `.env.local` in your project:

```env
# Replace these with your actual values:

# Google AdSense (from Step 2-3)
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID="ca-pub-XXXXXXXXXXXXXXXX"
NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_SIDEBAR="1234567890"

# Adsterra (from Step 4-5)
NEXT_PUBLIC_ADSTERRA_ZONE_ID="1234567890"

# Keep your existing variables:
# DATABASE_URL="..."
# NEXTAUTH_URL="..."
# NEXTAUTH_SECRET="..."
```

### Step 7: Test Locally (10 minutes)

```bash
npm run dev
```

1. Open http://localhost:3000
2. Login with your test account
3. Look for "Earn More Points with Ads" section
4. Click "Watch Ad" button
5. Verify:
   - Modal appears
   - Points increase
   - Cooldown message appears after

**Expected behavior:**
- If ad IDs are valid: Real or test ads display
- If ad IDs are empty: Button shows "Rewarded ads not configured"
- Points should always update (if configured correctly)

---

## 📋 Phase 2: Testing (Day 1-3)

### During AdSense & Adsterra Approval

While waiting for approval (normal, takes 24-48 hours):

1. **Code is working:** Test ads will show
2. **Points update:** Works normally
3. **Database tracks:** All activity logged
4. **No revenue:** During approval period (expected)

### What to Test

- [ ] Click "Watch Ad" button
- [ ] Modal appears with ad
- [ ] Wait ~5 seconds
- [ ] Points are awarded
- [ ] Show "Cooldown active" message
- [ ] Try again after 5 minutes
- [ ] Verify daily limit after 10 ads

### Check Database

```bash
npx prisma studio
```

Look for:
- [ ] PointsHistory table has entries with `type: "ad_watch_adsterra"`
- [ ] User.lastAdWatch has a timestamp
- [ ] User.adWatchCount shows correct number

---

## 📋 Phase 3: Deployment (Day 3-7)

### Step 1: Push to GitHub (5 minutes)

```bash
git add .
git commit -m "Add complete advertising system

- Google AdSense integration
- Adsterra rewarded ads
- Automatic database updates
- Full documentation included"

git push origin main
```

### Step 2: Add to Vercel (10 minutes)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add these environment variables:

```
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID = "ca-pub-..."
NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_SIDEBAR = "1234567890"
NEXT_PUBLIC_ADSTERRA_ZONE_ID = "1234567890"
NEXTAUTH_URL = "https://your-project.vercel.app"
NEXTAUTH_SECRET = "generate-new-one"
DATABASE_URL = "your-database-url"
```

**Important:**
- Generate a NEW `NEXTAUTH_SECRET` for production
- Use your Vercel domain URL for `NEXTAUTH_URL`

### Step 3: Deploy (Auto)

Vercel auto-deploys on push, but you can manually trigger:

1. Go to your project in Vercel
2. Click "Deployments"
3. Click "Deploy" button (or just wait for auto-deploy)

### Step 4: Test on Production (10 minutes)

1. Visit https://your-project.vercel.app
2. Login
3. Test "Watch Ad" button
4. Verify points update
5. Check browser console for errors

---

## 📋 Phase 4: Monitoring (Ongoing)

### Weekly Tasks

- [ ] Check Google AdSense dashboard for impressions/revenue
- [ ] Check Adsterra dashboard for impressions/revenue
- [ ] Monitor database for any errors
- [ ] Check server logs for issues
- [ ] Monitor user engagement

### Monthly Tasks

- [ ] Review analytics
- [ ] Analyze which ads get most engagement
- [ ] Adjust reward amounts if needed
- [ ] Update documentation if you change settings
- [ ] Plan for scaling if needed

### Database Queries

Check how many ads were watched:

```sql
SELECT type, COUNT(*) as count, SUM(amount) as total_points
FROM "PointsHistory"
WHERE type LIKE 'ad_watch_%'
GROUP BY type;
```

Check top users by ads watched:

```sql
SELECT "userId", COUNT(*) as ads_watched, SUM(amount) as points_earned
FROM "PointsHistory"
WHERE type LIKE 'ad_watch_%'
GROUP BY "userId"
ORDER BY ads_watched DESC
LIMIT 10;
```

---

## 🆘 Troubleshooting During Setup

### Issue: "database reset" fails on migration

**Solution:** 
```bash
# Delete local database and recreate
npx prisma migrate reset --force
```

### Issue: Can't find my Publisher ID in Google AdSense

**Solution:**
1. Go to https://adsense.google.com
2. Click Settings (gear icon)
3. Select "Account information"
4. Look for "Publisher ID" - it's the number starting with "ca-pub-"

### Issue: Ads don't show but no errors

**Solution:**
1. Check environment variables in `.env.local` are correct
2. Restart `npm run dev`
3. Hard refresh browser (Ctrl+Shift+R)
4. Check browser console (F12) for warnings
5. During approval period (24-48h), test ads should show

### Issue: Points not updating

**Solution:**
1. Are you logged in? (Check top of page)
2. Is database migration applied? (Check `npx prisma studio`)
3. Check server logs: `npm run dev` terminal should show logs
4. Check database: Open `npx prisma studio` and verify User table has `lastAdWatch` field

### Issue: "Cooldown active" even on first click

**Solution:**
```javascript
// In browser console, clear cooldown tracking
localStorage.clear()
location.reload()
```

---

## 📞 Help Resources

### Documentation Files
- **`AD_SYSTEM_GUIDE.md`** - Complete reference
- **`ADVERTISING_SETUP_GUIDE.md`** - Detailed setup steps
- **`QUICK_START_ADS.md`** - Quick reference
- **`ADVERTISING_ARCHITECTURE.md`** - How it works

### External Support
- **Google AdSense Help:** https://support.google.com/adsense
- **Adsterra Support:** https://adsterra.com/support
- **Next.js Docs:** https://nextjs.org/docs

---

## ✅ Success Checklist

### By End of Day 1
- [ ] Database migration applied
- [ ] Google AdSense account created
- [ ] Adsterra account created
- [ ] Environment variables updated
- [ ] Local testing works

### By End of Day 3
- [ ] Google AdSense approved (ads showing)
- [ ] Adsterra approved (ads showing)
- [ ] Deployment to Vercel successful
- [ ] Production ads loading
- [ ] Points updating on production

### By End of Week 1
- [ ] Monitoring setup complete
- [ ] Analytics reviewed
- [ ] Optimization planned
- [ ] Documentation updated

---

## 💡 Quick Reference

### Essential Commands
```bash
# Start development
npm run dev

# Build for production
npm run build

# Database migration
npx prisma migrate dev

# View database
npx prisma studio

# Push to Git
git push origin main
```

### Key Files to Know
- `.env.local` - Your configuration
- `app/page.tsx` - Dashboard (where ads appear)
- `components/ads/` - Ad components
- `app/api/points/reward-ad/route.ts` - Points API

### Configuration Files
- `lib/ads/ad-config.ts` - Ad settings
- `prisma/schema.prisma` - Database schema

---

## 🎯 Success!

Once you complete all phases, you'll have:

✅ A live advertising system earning revenue
✅ Improved user engagement (more earning opportunities)
✅ Automatic point updates to database
✅ Complete audit trail of all ad activity
✅ Security against point hacking
✅ Production-ready code running on Vercel

You're generating revenue while your users have fun!

---

**Let's Go!** 🚀

Start with Phase 1, Step 1: `npx prisma migrate dev --name add_ad_system`

---

*Last Updated: December 3, 2025*
*Status: Ready for You to Execute*
