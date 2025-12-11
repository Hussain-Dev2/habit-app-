# 🎬 How to Fix "Watch to Earn" Feature

## Problem
When you click "Watch & Earn" button, nothing happens or you see an error.

## Root Cause
The Adsterra Rewarded Ad component is missing its configuration key.

## Quick Fix (5 Minutes)

### Step 1: Get Your Adsterra Rewarded Ad Key

1. **Login to Adsterra**: https://publishers.adsterra.com
2. **Go to Dashboard** → "Websites & Apps"
3. **Create New Zone**:
   - Click "Add New Zone"
   - Choose "Rewarded Video" or "Rewarded Ad" format
   - Set up your zone (select your website)
   - **Copy the Zone Key** (will look like: `a1b2c3d4e5f6g7h8i9j0`)

### Step 2: Create Environment File

In your project root, create a file named `.env.local` (not `.env.example`):

```bash
# .env.local
NEXT_PUBLIC_ADSTERRA_REWARDED_KEY="paste-your-key-here"
```

**Example:**
```bash
# .env.local
NEXT_PUBLIC_ADSTERRA_REWARDED_KEY="a1b2c3d4e5f6g7h8i9j0"
```

### Step 3: Restart Development Server

Stop your server (Ctrl+C) and restart:
```bash
npm run dev
```

### Step 4: Test

1. Go to your app: http://localhost:3000
2. Find the "Watch Ad" activity card
3. Click "Watch & Earn"
4. You should now see the Adsterra ad player!

## Alternative: Use Custom Script URL

If Adsterra gave you a script URL instead of a key:

```bash
# .env.local
NEXT_PUBLIC_ADSTERRA_REWARDED_SCRIPT_URL="https://pl12345.somecdn.com/your-script.js"
```

## Important Notes

### For Development (localhost):
- Ads may not show on localhost
- Some ad networks block local testing
- The component will show "Configure your Adsterra key" message
- **Deploy to production to test fully**

### For Production:
- Add the same environment variable to your hosting platform
- **Vercel**: Go to Settings → Environment Variables
- **Netlify**: Go to Site settings → Environment
- Add: `NEXT_PUBLIC_ADSTERRA_REWARDED_KEY` with your value

## Troubleshooting

### Issue: "Configure your Adsterra key" message
**Solution**: Environment variable not set correctly
- Check file name is exactly `.env.local` (note the dot at start)
- Check variable name is exactly `NEXT_PUBLIC_ADSTERRA_REWARDED_KEY`
- Restart development server after creating the file

### Issue: "Failed to load Adsterra creative"
**Solution**: Wrong key or network issue
- Verify the key is correct in your Adsterra dashboard
- Check if ad zone is active/approved
- Try using the script URL method instead

### Issue: Ad loads but countdown doesn't work
**Solution**: Check API endpoint
- Make sure `/api/ads/rewarded` endpoint is working
- Check browser console for errors
- Verify your database connection

### Issue: Still showing "Configure" after setting key
**Solution**: Environment variable not loaded
- Did you restart the server? (Must restart after adding .env.local)
- Is the file in the project ROOT folder?
- Check for typos in variable name (must be EXACT)

## File Locations

```
your-project/
├── .env.local              ← Create this file (in root)
├── .env.example            ← Reference file (don't edit)
├── components/
│   └── ads/
│       └── AdsterraRewarded.tsx  ← The rewarded ad component
└── components/
    └── ActivitiesPanel.tsx       ← Where "Watch to Earn" button is
```

## How the Rewarded Ad Works

1. **User clicks "Watch & Earn"**
2. **Modal opens** with AdsterraRewarded component
3. **Ad loads** from Adsterra using your key
4. **User watches** the ad for 25 seconds
5. **Timer completes** automatically
6. **API called** to award points
7. **User receives** +150 points (or configured amount)
8. **Cooldown starts** (3 minutes before next ad)

## Testing Checklist

- [ ] Created `.env.local` file
- [ ] Added `NEXT_PUBLIC_ADSTERRA_REWARDED_KEY`
- [ ] Pasted correct key from Adsterra dashboard
- [ ] Restarted development server
- [ ] Clicked "Watch & Earn" button
- [ ] Saw ad player load
- [ ] Ad completed successfully
- [ ] Points were awarded

## Need Help?

1. Check Adsterra dashboard for zone status
2. Look at browser console (F12) for errors
3. Check the server terminal for API errors
4. Verify `.env.local` is not in `.gitignore` for local testing
   - (But NEVER commit it to Git for production!)

## Production Deployment

When deploying, add the environment variable to your hosting:

**Vercel:**
1. Go to project settings
2. Environment Variables section
3. Add `NEXT_PUBLIC_ADSTERRA_REWARDED_KEY`
4. Add your key value
5. Redeploy

**Netlify:**
1. Site settings
2. Build & deploy → Environment
3. Add variable
4. Redeploy

---

**That's it!** Your "Watch to Earn" feature should now work perfectly! 🎉
