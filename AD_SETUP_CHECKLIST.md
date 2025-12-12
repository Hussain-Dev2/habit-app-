# 🎯 Ad Setup Checklist for Production

## Current Issues & Solutions

### Why Ads Aren't Showing:

1. **❌ Domain Not Configured in .env**
2. **❌ Ad Networks Need Domain Verification**
3. **❌ Content Security Policy Blocking Ad Scripts** (FIXED)
4. **❌ VPN Blocker Too Strict** (FIXED)
5. **❌ Browser Ad Blockers**

---

## ✅ Step-by-Step Fix

### 1. Update Environment Variables

**URGENT**: Update your `.env` file with your actual production URL:

```env
# Replace localhost with your actual domain
NEXTAUTH_URL="https://your-actual-domain.com"

# If using Vercel, also set:
NEXT_PUBLIC_APP_URL="https://your-actual-domain.com"
```

**In Vercel Dashboard**:
1. Go to your project → Settings → Environment Variables
2. Add/Update: `NEXTAUTH_URL` = `https://your-actual-domain.com`
3. Redeploy the application

---

### 2. Google AdSense Setup

#### A. Verify Your Domain
1. Go to [Google AdSense](https://www.google.com/adsense)
2. Add your site: `your-actual-domain.com`
3. Copy the verification code
4. Add it to your site's `<head>` (already done in layout.tsx)
5. Click "Verify" in AdSense dashboard
6. **Wait 1-3 days** for approval

#### B. Confirm ads.txt
1. Your `ads.txt` file must be accessible at:
   ```
   https://your-actual-domain.com/ads.txt
   ```
2. Content should be:
   ```
   google.com, pub-4681103183883079, DIRECT, f08c47fec0942fa0
   adsterra.com, 9cacea9de1f8feb55aa1427896034a21, DIRECT
   ```

#### C. Ad Placement IDs
Your current AdSense publisher ID: `ca-pub-4681103183883079`

**Create ad units** in AdSense dashboard:
- Display Ads (multiple sizes)
- In-feed Ads
- Matched Content

**Replace placeholder slot IDs** in your components with actual IDs.

---

### 3. Adsterra Setup

#### A. Verify Your Domain
1. Go to [Adsterra Publisher Dashboard](https://publishers.adsterra.com/)
2. Add your domain: `your-actual-domain.com`
3. Wait for domain approval (usually 1-2 hours)

#### B. Get Your Ad Unit IDs
Your current Adsterra API token: `9cacea9de1f8feb55aa1427896034a21`

**Current ad unit IDs in use**:
- Rewarded: `28139013`
- Interstitial: `28139013`
- Social Bar: `c4060cbdd4dfbfe5344b0066a43948ca`
- Native Bar: `233a167aa950834c2307f2f53e2c8726`

**Verify these IDs** in your Adsterra dashboard. If they're placeholder/demo IDs, create real ones:
1. Dashboard → Ad Units → Create New
2. Choose ad format (Banner, Popunder, Native, etc.)
3. Copy the generated code
4. Update `.env` with new IDs

---

### 4. Fix Browser-Specific Issues

#### Why Chrome Shows No Ads:
- **Ad Blocker**: Chrome users often have extensions like uBlock Origin, AdBlock Plus
- **Privacy Settings**: Enhanced tracking protection blocks ad scripts
- **Brave Browser**: Blocks ads by default

#### Why Telegram Shows Some Ads:
- Telegram in-app browser has minimal ad blocking
- But limited JavaScript support may prevent some ad formats

#### Solution:
**You can't force users to disable ad blockers**, but you can:

1. **Detect Ad Blockers** (add this component):

```typescript
// components/AdBlockDetector.tsx
'use client';

import { useEffect, useState } from 'react';

export default function AdBlockDetector() {
  const [adBlockDetected, setAdBlockDetected] = useState(false);

  useEffect(() => {
    // Try to load a known ad script
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    testAd.style.position = 'absolute';
    testAd.style.top = '-1px';
    testAd.style.left = '-1px';
    document.body.appendChild(testAd);

    setTimeout(() => {
      const isBlocked = testAd.offsetHeight === 0;
      setAdBlockDetected(isBlocked);
      document.body.removeChild(testAd);
    }, 100);
  }, []);

  if (!adBlockDetected) return null;

  return (
    <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 p-4 m-4">
      <p className="font-bold">⚠️ Ad Blocker Detected</p>
      <p className="text-sm">
        Please disable your ad blocker to support this free platform and earn maximum rewards!
      </p>
    </div>
  );
}
```

2. **Add to page.tsx**:
```tsx
import AdBlockDetector from '@/components/AdBlockDetector';

// Inside the return statement:
<AdBlockDetector />
```

---

### 5. Testing Ads Properly

#### Development vs Production:
- **Development** (`localhost`): Ads may not show or show test ads
- **Production** (live domain): Real ads after domain verification

#### Test Different Browsers:
| Browser | Ad Support | Notes |
|---------|-----------|-------|
| Chrome (Desktop) | ✅ | If no ad blocker |
| Safari (iOS) | ✅ | Better ad support |
| Telegram Browser | ⚠️ | Limited support |
| Facebook Browser | ⚠️ | Limited support |
| Brave | ❌ | Blocks ads by default |
| Firefox + uBlock | ❌ | If ad blocker installed |

#### Test Checklist:
```
□ Open site in Incognito/Private mode (no extensions)
□ Check browser console for errors (F12)
□ Verify ads.txt is accessible
□ Check Network tab - do ad scripts load?
□ Wait 10-15 seconds for ads to load
□ Test on mobile device (real device, not emulator)
```

---

### 6. Common Ad Loading Issues

#### A. "Ad request from unsupported domain"
**Solution**: Add your domain to ad network dashboard

#### B. "No ad inventory available"
**Solution**: 
- New sites take time to get ad inventory
- Need traffic for ads to show
- Some regions have limited ad inventory

#### C. Ads show in some countries but not others
**Solution**: Normal - ad inventory varies by region

#### D. Ads don't show on first page load
**Solution**: 
- Ads can take 5-10 seconds to load
- Some ad networks require user interaction first
- Check if scripts are blocked by Content Security Policy (CSP)

---

### 7. Production Deployment Steps

1. **Update .env.production** or **Vercel Environment Variables**:
   ```env
   NEXTAUTH_URL=https://your-actual-domain.com
   NEXT_PUBLIC_APP_URL=https://your-actual-domain.com
   ```

2. **Verify ads.txt** is accessible:
   ```
   curl https://your-actual-domain.com/ads.txt
   ```

3. **Deploy to Vercel**:
   ```bash
   git add .
   git commit -m "Configure ads for production"
   git push origin main
   ```

4. **Wait for deployment** to complete

5. **Test ads** in incognito mode on multiple browsers

---

### 8. Monitoring & Optimization

#### Check Ad Performance:
- **Google AdSense**: [Reports Dashboard](https://www.google.com/adsense/new/u/0/pub-4681103183883079/reporting)
- **Adsterra**: [Statistics](https://publishers.adsterra.com/stats/)

#### Expected Timeline:
- **Day 1**: Deploy + domain verification
- **Day 2-3**: Ad networks approve domain
- **Day 3-7**: Ads start showing (low fill rate)
- **Week 2+**: Ad fill rate improves with traffic
- **Month 1**: Full ad inventory available

#### Key Metrics:
- **Impressions**: Number of times ads are shown
- **Fill Rate**: % of ad requests that get ads (aim for 80%+)
- **CPM**: Cost per 1000 impressions
- **Viewability**: % of ads actually seen by users

---

## 🚨 Quick Troubleshooting

### No Ads Showing At All?

1. **Check browser console** (F12 → Console tab):
   ```
   Look for errors like:
   - "Failed to load resource: net::ERR_BLOCKED_BY_CLIENT" → Ad blocker
   - "Refused to load script" → CSP issue (fixed)
   - "adsbygoogle.push() error" → AdSense not approved yet
   ```

2. **Check Network tab** (F12 → Network):
   ```
   Filter by "ads" or "google"
   - Scripts loading? ✅ Good
   - Scripts blocked/red? ❌ Issue
   - Scripts pending forever? ⚠️ Timeout/network issue
   ```

3. **Verify domain in ad dashboards**:
   - Google AdSense → Sites → Check if approved
   - Adsterra → Sites → Check if active

4. **Test with curl**:
   ```bash
   # Test if ads.txt is accessible
   curl https://your-domain.com/ads.txt
   
   # Should return:
   # google.com, pub-4681103183883079, DIRECT, f08c47fec0942fa0
   # adsterra.com, 9cacea9de1f8feb55aa1427896034a21, DIRECT
   ```

---

## 📱 Mobile Testing

Telegram browser has limited capabilities. For better ad support:

1. **Share direct link** instead of opening in Telegram browser
2. **Encourage users** to open in Safari/Chrome
3. **Test on real mobile devices**:
   - iOS Safari ✅
   - Android Chrome ✅
   - iOS Telegram ⚠️
   - Android Telegram ⚠️

---

## ✅ Final Checklist

Before expecting ads to work:

```
□ Domain verified with Google AdSense
□ Domain verified with Adsterra
□ ads.txt accessible at /ads.txt
□ NEXTAUTH_URL set to production domain
□ Deployed to production (not localhost)
□ Waited 24-72 hours for ad approval
□ Tested in incognito mode (no ad blocker)
□ Checked browser console for errors
□ Verified ad scripts load in Network tab
□ Tested on multiple browsers/devices
```

---

## 🆘 Still Having Issues?

1. **Share your production URL** so I can check
2. **Share browser console errors** (screenshot)
3. **Confirm domain verification status** in ad dashboards
4. **Check if you have traffic** - some ad networks require minimum traffic

**Note**: Brand new sites may take 1-2 weeks before ads show consistently. This is normal.
