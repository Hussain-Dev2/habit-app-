# 🎁 Referral System Implementation

## Overview
Users can now share their unique referral link and earn **200 points** for every person who signs up using their link!

## Features Implemented

### 1. Database Schema (`prisma/schema.prisma`)
Added to User model:
- `referralCode` - Unique 8-character code for each user
- `referredBy` - Code of the user who referred them
- `totalReferrals` - Count of successful referrals
- `referralEarnings` - Total points earned from referrals

### 2. API Routes

#### `/api/referral/link` (GET)
- Generates or retrieves user's referral code
- Returns full referral link: `https://yoursite.com/register?ref=ABC12345`
- Returns referral statistics

#### `/api/referral/stats` (GET)
- Returns detailed referral statistics
- Lists all referred users
- Shows total earnings

#### Updated `/api/auth/register` (POST)
- Accepts optional `referralCode` parameter
- Awards 200 points to referrer automatically
- Creates notification for referrer
- Tracks referral in points history

### 3. UI Components

#### `ShareEarnModal.tsx`
Beautiful modal that shows:
- User's unique referral code
- Full referral link with copy button
- Share buttons for WhatsApp, Twitter, Facebook, Telegram
- Real-time statistics (total referrals, earnings)
- How it works section

#### Updated `ActivitiesPanel.tsx`
- "Share & Earn" activity now opens the referral modal
- No cooldown - users can share anytime

#### Updated `register/page.tsx`
- Detects `?ref=CODE` in URL
- Shows banner when referral code is applied
- Stores code in sessionStorage for OAuth flow

## How It Works

1. **User clicks "Share & Earn"**
   - Modal opens with their unique referral code
   - Example: `ABC12345`
   - Full link generated: `https://yoursite.com/register?ref=ABC12345`

2. **User shares link**
   - Via WhatsApp, Twitter, Facebook, or Telegram
   - Or copies link manually

3. **Friend signs up**
   - Visits link with referral code
   - Registers using Google OAuth
   - Referral code is applied automatically

4. **Referrer gets rewarded**
   - **200 points** added instantly
   - Notification sent: "🎉 Referral Bonus!"
   - Points history updated
   - Stats incremented

## Migration

Run this SQL in your Supabase dashboard:

```sql
-- File: prisma/migrations/manual_add_referral_system.sql
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredBy" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "totalReferrals" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralEarnings" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS "User_referralCode_key" ON "User"("referralCode");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'User_referredBy_fkey'
    ) THEN
        ALTER TABLE "User" 
        ADD CONSTRAINT "User_referredBy_fkey" 
        FOREIGN KEY ("referredBy") 
        REFERENCES "User"("referralCode") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
    END IF;
END $$;
```

## Configuration

### Referral Reward Amount
To change the reward amount, edit `/api/auth/register/route.ts`:
```typescript
const REFERRAL_BONUS = 200; // Change this value
```

### Referral Code Format
8-character alphanumeric code (no confusing characters like O/0, I/1)
Generated in `/api/referral/link/route.ts`

## Testing

1. **Generate referral link:**
   - Sign in
   - Click "Share & Earn" in Activities
   - Copy your link

2. **Test referral:**
   - Open link in incognito window
   - Sign up with different Google account
   - Check that 200 points are awarded

3. **Verify stats:**
   - Open Share & Earn modal
   - Should show 1 referral, 200 earnings

## Future Enhancements

- [ ] Tiered rewards (more points for more referrals)
- [ ] Referral leaderboard
- [ ] Email notifications for new referrals
- [ ] Bonus for referred user (welcome bonus)
- [ ] Analytics dashboard for referrals
- [ ] Social media preview cards
- [ ] QR code generation for offline sharing

## Troubleshooting

**Referral code not generated?**
- Check API route `/api/referral/link`
- Verify user is authenticated
- Check database permissions

**Points not awarded?**
- Verify migration ran successfully
- Check Prisma transactions in register route
- Look for errors in server logs

**Referral code not detected?**
- Check URL parameter: `?ref=CODE`
- Verify sessionStorage in register page
- Check OAuth callback handling
