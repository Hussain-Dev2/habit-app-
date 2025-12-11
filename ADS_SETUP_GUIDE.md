# Ad Setup Guide

## Issues Fixed

### 1. **Script Loading Conflicts** ✅
- **Problem**: Adsterra scripts were loading on every component mount/unmount, causing conflicts
- **Solution**: Added global flags to prevent duplicate script loading
- **Result**: Scripts now load once and persist across component lifecycle

### 2. **Cleanup Issues** ✅
- **Problem**: Script cleanup wasn't working properly, causing memory leaks
- **Solution**: Removed aggressive cleanup, scripts persist globally
- **Result**: Better performance and no script conflicts

### 3. **Ad Container Visibility** ✅
- **Problem**: Ad containers had no background, making them invisible
- **Solution**: Added light gray background with "Advertisement" placeholder
- **Result**: Users can see where ads will appear

### 4. **Google AdSense Test IDs** ⚠️
- **Problem**: Using placeholder IDs like "1234567890"
- **Action Needed**: Replace with real AdSense slot IDs from your account

## Google AdSense Setup

### Current Configuration
- **Publisher ID**: `ca-pub-4681103183883079`
- **Ad Slots**: Using test IDs (need to be replaced)

### How to Get Real Ad Slot IDs

1. **Go to your AdSense account**: https://www.google.com/adsense
2. **Click "Ads" → "By ad unit"**
3. **Create new ad units** for each placement:
   - Top Banner (Horizontal - 728x90 or responsive)
   - Sidebar/Rectangle ads (300x250)
   - In-article ads (Fluid/responsive)
   - Footer banner (Horizontal)

4. **Copy the ad slot IDs** and replace in [page.tsx](app/page.tsx):

```tsx
// Replace these lines:
<GoogleAdsense adSlot="1234567890" /> // ❌ Test ID
// With your real IDs:
<GoogleAdsense adSlot="1234567890" /> // ✅ Real ID from AdSense
```

### Ad Placements in Your App

Current ad locations in [page.tsx](app/page.tsx):

1. **Line 296**: Top Banner (after Quick Start section)
2. **Line 304**: Adsterra Social Bar
3. **Line 309-318**: Dual Display Ads (2 rectangle ads side by side)
4. **Line 322**: In-Article Ad (fluid format)
5. **Line 330**: Display Ad (auto format)
6. **Line 338**: Adsterra Native Bar
7. **Line 344**: Footer Banner

## Adsterra Setup

### Current Configuration

#### Display Ads (Working)
Your Adsterra display ads are configured with these IDs:
- **Native Bar**: `233a167aa950834c2307f2f53e2c8726`
- **Social Bar**: `c4060cbdd4dfbfe5344b0066a43948ca`

#### Rewarded Ads (Needs Configuration) ⚠️
The "Watch to Earn" feature uses **Adsterra Rewarded Ads** but requires setup:

**Why It's Not Working:**
- Missing environment variable: `NEXT_PUBLIC_ADSTERRA_REWARDED_KEY`
- The component needs your Adsterra Rewarded Ad zone key

**How to Fix:**

1. **Log into Adsterra Dashboard**: https://publishers.adsterra.com
2. **Create a Rewarded Ad Zone**:
   - Go to "Websites & Apps"
   - Click "Add New Zone"
   - Select "Rewarded Video" format
   - Follow the setup wizard
3. **Get Your Key**: Copy the zone key (looks like: `a1b2c3d4e5f6g7h8`)
4. **Create `.env.local` file** in your project root:
   ```bash
   NEXT_PUBLIC_ADSTERRA_REWARDED_KEY="your-key-here"
   ```
5. **Restart your development server**: `npm run dev`

**Alternative Method (Custom Script):**
If you have a custom script URL instead:
```bash
NEXT_PUBLIC_ADSTERRA_REWARDED_SCRIPT_URL="https://your-script-url.com/script.js"
```

### Verify These Are Correct
1. Log into your Adsterra account
2. Check your ad zones
3. Verify the IDs match

## Why Ads May Not Show

### Common Issues:

1. **Ad Blockers** 🚫
   - Most users have ad blockers installed
   - Ads won't show if blocked
   - Solution: Add anti-adblock detection (optional)

2. **Domain Not Verified** 🌐
   - AdSense requires domain verification
   - Ads won't show until approved
   - Check AdSense dashboard for approval status

3. **Insufficient Traffic** 📊
   - AdSense may not serve ads on low-traffic sites
   - Need consistent traffic for ads to appear
   - Test with real domain in production

4. **Test/Placeholder IDs** 🔧
   - Current AdSense slots use test IDs
   - Replace with real IDs from your account

5. **Content Policy Violations** ⚠️
   - AdSense has strict content policies
   - Ensure your app complies with policies
   - Check for policy violations in dashboard

## Testing Ads

### In Development (localhost)
- Ads may not show on localhost
- Some networks block local testing
- Deploy to production domain to test

### Production Testing
1. Deploy your app to your domain
2. Wait 24-48 hours for AdSense to review
3. Check if ads appear
4. View real-time reports in AdSense dashboard

## Performance Improvements Made

1. ✅ **Global script loading** - Scripts load once, not on every component
2. ✅ **Error handling** - Console warnings instead of crashes
3. ✅ **Async loading** - Scripts don't block page rendering
4. ✅ **Fallback content** - Shows "Advertisement" placeholder
5. ✅ **Background styling** - Visible ad containers

## Next Steps

### For AdSense:
1. [ ] Replace all test slot IDs with real IDs
2. [ ] Verify domain in AdSense account
3. [ ] Wait for approval (can take days)
4. [ ] Check AdSense dashboard for policy issues

### For Adsterra:
1. [ ] Verify ad zone IDs are correct
2. [ ] Check Adsterra dashboard for approval status
3. [ ] Ensure domain is added to your account

### For Better Ad Revenue:
1. [ ] Reduce number of ads (currently 7 units is a lot)
2. [ ] Focus on quality placements
3. [ ] Monitor viewability and CTR
4. [ ] Test different ad formats
5. [ ] Consider user experience vs. revenue

## Recommended Ad Layout

Instead of 7 ad units, consider:
1. One top banner (after main content)
2. One sidebar ad (if you add a sidebar)
3. One in-content ad (middle of page)
4. One footer banner

This improves user experience and may increase ad performance.
