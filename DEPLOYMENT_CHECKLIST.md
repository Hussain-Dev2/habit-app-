# 🚀 Production Deployment Checklist

## Before Deploying

### 1. Update Environment Variables
- [ ] Set `NEXTAUTH_URL` to your production domain (e.g., `https://yourapp.com`)
- [ ] Set `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Verify all database credentials are correct
- [ ] Verify Google OAuth credentials (if using)
- [ ] Verify Firebase credentials (if using)
- [ ] Confirm AdSense Publisher ID
- [ ] Confirm Adsterra API token and ad unit IDs

### 2. Verify Domain Setup
- [ ] Domain is live and accessible
- [ ] SSL certificate is active (HTTPS)
- [ ] DNS records properly configured

### 3. Ad Network Configuration
- [ ] Add domain to Google AdSense dashboard
- [ ] Add domain to Adsterra dashboard
- [ ] Verify `ads.txt` is accessible at `https://yourdomain.com/ads.txt`
- [ ] Wait for ad network approval (1-3 days)

### 4. Code Preparation
- [ ] All features tested locally
- [ ] No console errors in browser
- [ ] Build succeeds without errors (`npm run build`)
- [ ] Database migrations applied
- [ ] Seed data loaded (if needed)

## Deployment Steps

### 1. Deploy to Vercel

```bash
# Commit your changes
git add .
git commit -m "Production deployment with ad fixes"
git push origin main
```

### 2. Configure Vercel Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these (Production environment):

```
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
DATABASE_URL=your-database-url
DIRECT_URL=your-direct-database-url
NEXTAUTH_SECRET=your-nextauth-secret
JWT_SECRET=your-jwt-secret
ADMIN_SECRET_KEY=your-admin-secret
SUPABASE_SERVICE_ROLE_KEY=your-supabase-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-supabase-key
NEXT_PUBLIC_ADSTERRA_API_TOKEN=your-token
NEXT_PUBLIC_ADSTERRA_REWARDED_KEY=your-key
NEXT_PUBLIC_ADSTERRA_INTERSTITIAL_KEY=your-key
NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_KEY=your-key
NEXT_PUBLIC_ADSTERRA_NATIVE_BAR_KEY=your-key
```

### 3. Redeploy

After adding environment variables:
- Click "Redeploy" in Vercel dashboard
- OR push another commit to trigger deployment

## Post-Deployment Verification

### 1. Test Core Functionality
- [ ] Can visit the site (no 500 errors)
- [ ] Can register new account
- [ ] Can login
- [ ] Click button works
- [ ] Points are awarded correctly
- [ ] Activities work
- [ ] Shop works

### 2. Test Ads
- [ ] Open site in **Incognito/Private mode** (no ad blocker)
- [ ] Wait 10-15 seconds for ads to load
- [ ] Check browser console (F12) for ad errors
- [ ] Test on multiple browsers:
  - [ ] Chrome Desktop
  - [ ] Firefox Desktop
  - [ ] Safari iOS
  - [ ] Chrome Android
- [ ] Verify ad blocker detector appears when ad blocker is enabled

### 3. Verify Files
```bash
# Check these URLs in your browser:
https://your-domain.com/ads.txt
# Should show Google and Adsterra entries

https://your-domain.com/
# Should load without errors
```

### 4. Monitor Logs
- [ ] Check Vercel deployment logs for errors
- [ ] Check browser console for JavaScript errors
- [ ] Check Network tab for failed requests

## Common Issues & Solutions

### Issue: "Failed to load resource: net::ERR_BLOCKED_BY_CLIENT"
**Solution**: User has ad blocker enabled. Ad blocker detector should show message.

### Issue: "adsbygoogle.push() error: No slot size"
**Solution**: Wait for page to fully load. Ads need DOM to be ready.

### Issue: "Ad request from unsupported domain"
**Solution**: 
1. Verify domain added to Google AdSense
2. Wait 24-48 hours for approval
3. Check `ads.txt` is accessible

### Issue: No ads showing at all
**Checklist**:
1. Is `NEXTAUTH_URL` set correctly?
2. Is domain verified in ad dashboards?
3. Has 24-72 hours passed since verification?
4. Are you testing in incognito mode (no ad blocker)?
5. Are there console errors in browser?
6. Is `ads.txt` accessible?

### Issue: Ads show on desktop but not mobile
**Solution**: 
- Mobile browsers may have built-in ad blocking
- Test on real devices, not emulators
- Telegram/Facebook in-app browsers have limited support

### Issue: "VPN Blocker" blocking legitimate users
**Solution**: Already fixed - now only blocks high-risk VPNs (score > 0.7)

## Timeline Expectations

- **Day 0**: Deploy to production
- **Day 1**: Submit domain to ad networks
- **Day 2-3**: Domain verification pending
- **Day 3-7**: Ads start showing (low fill rate 20-40%)
- **Week 2**: Fill rate improves (40-60%)
- **Month 1**: Full ad inventory (60-80%+ fill rate)

## Success Criteria

### Minimum Requirements
- [ ] Site loads without errors
- [ ] Users can register and login
- [ ] Points system works
- [ ] At least 1 ad format showing

### Optimal Setup
- [ ] All ad formats showing
- [ ] 60%+ ad fill rate
- [ ] No console errors
- [ ] Fast page load (< 3 seconds)
- [ ] Ad blocker detector working
- [ ] Mobile responsive

## Monitoring

### Daily Checks (First Week)
- Check Google AdSense dashboard for impressions
- Check Adsterra dashboard for statistics
- Monitor Vercel analytics for errors
- Check user registration rate

### Weekly Checks (After Launch)
- Review ad performance (CPM, CTR)
- Check for console errors
- Monitor page load speed
- Review user feedback

## Rollback Plan

If critical issues occur:

```bash
# 1. Revert to previous deployment in Vercel dashboard
# OR

# 2. Revert git commit
git revert HEAD
git push origin main

# 3. Fix issues locally and redeploy
```

## Support Resources

- **Google AdSense Help**: https://support.google.com/adsense
- **Adsterra Support**: https://publishers.adsterra.com/support
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## Quick Test Commands

```bash
# Test ads.txt
curl https://your-domain.com/ads.txt

# Test API endpoint
curl https://your-domain.com/api/auth/me

# Test database connection (via Prisma)
npx prisma db push
```

---

**Remember**: Ad networks need time to approve your site and fill ad inventory. Don't expect 100% ad fill on day one. Be patient and monitor over the first 1-2 weeks.
