# Advertising System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLICKER-APP DASHBOARD                      │
│  (app/page.tsx)                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Level Card   │  │ User Card    │  │ Click Button │          │
│  │              │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    ACTIVITIES PANEL                      │  │
│  │  Daily Bonus | Watch Ad | Spin Wheel | Task | Share     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          📺 EARN MORE POINTS WITH ADS (NEW!)             │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │     [Watch Ad] → +50 pts (Cooldown 5m)         │  │  │
│  │  │     Status: Ready / Cooldown x:xx / Limit hit   │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │  ┌─────────────────┐     ┌─────────────────┐          │  │
│  │  │ Google AdSense  │     │  Adsterra Ad    │          │  │
│  │  │                 │     │                 │          │  │
│  │  │  Display Ads    │     │  Display Ads    │          │  │
│  │  │  (300x250)      │     │  (300x250)      │          │  │
│  │  └─────────────────┘     └─────────────────┘          │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Component Flow

```
                        USER INTERACTION
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
            [Watch Ad Button]   [Display Ads]
            RewardedAdButton    GoogleAdSense
                    │           AdsterraAd
                    │
                    ▼
            ┌──────────────┐
            │ Check Status │
            │ Logged in?   │
            │ Cooldown OK? │
            │ Limit OK?    │
            └──────────────┘
                    │
                ┌───┴───┐
         ALLOWED│       │ BLOCKED
                ▼       ▼
            Show Ad  Show Message
            Modal    "Wait x min"
                │
                ▼
          ┌────────────┐
          │ User Watches│
          │    Ad (~5s) │
          └────────────┘
                │
                ▼
        ┌───────────────────┐
        │  POST /api/points/│
        │   reward-ad       │
        └───────────────────┘
                │
                ▼
        ┌───────────────────────┐
        │ Server Verification:  │
        │ - Auth check          │
        │ - Cooldown check      │
        │ - Daily limit check   │
        └───────────────────────┘
                │
            ┌───┴───┐
         OK │       │ FAIL
            ▼       ▼
        Update   Return
        DB      Error
            │
            ▼
        ┌─────────────────┐
        │ user.points += 50│
        │ user.lifetime += 50│
        │ Log activity    │
        └─────────────────┘
            │
            ▼
        Return
        Updated User
            │
            ▼
        Update Frontend
            │
            ▼
        Show Success
        Message
```

## File Organization

```
ADVERTISING SYSTEM
│
├─ 🎨 COMPONENTS (clients/ads/)
│  ├─ GoogleAdSense.tsx          (Google display ads)
│  ├─ AdsterraAd.tsx            (Adsterra display ads)
│  ├─ RewardedAdButton.tsx      (Watch-to-earn button)
│  ├─ AdContainer.tsx           (Ad wrapper/styling)
│  └─ index.ts                  (Barrel exports)
│
├─ ⚙️  CONFIGURATION (lib/ads/)
│  ├─ ad-config.ts              (Constants & config)
│  │  └─ GOOGLE_ADSENSE_CONFIG
│  │  └─ ADSTERRA_CONFIG
│  │  └─ REWARDED_AD_CONFIG
│  │  └─ SLOT_IDS
│  │
│  └─ ad-utils.ts               (Helper functions)
│     ├─ loadGoogleAdSenseScript()
│     ├─ loadAdsterraScript()
│     ├─ canWatchRewardedAd()
│     ├─ trackAdCompletion()
│     └─ localStorage utilities
│
├─ 🔌 API ENDPOINT (app/api/points/)
│  └─ reward-ad/route.ts        (POST handler)
│     ├─ Auth verification
│     ├─ Cooldown checking
│     ├─ Daily limit checking
│     ├─ Points update
│     └─ Activity logging
│
├─ 🌐 MAIN DASHBOARD
│  └─ app/page.tsx              (Integration point)
│     └─ <RewardedAdButton />
│     └─ <GoogleAdSense />
│     └─ <AdsterraAd />
│
├─ 💾 DATABASE (prisma/)
│  └─ schema.prisma
│     ├─ User.lastAdWatch
│     ├─ User.adWatchCount
│     └─ PointsHistory.type (ad_watch_*)
│  └─ migrations/
│     └─ 20251203_add_ad_system/migration.sql
│
├─ 🔐 ENVIRONMENT (.env)
│  ├─ .env.local                (Your configuration)
│  └─ .env.example              (Template)
│
└─ 📚 DOCUMENTATION
   ├─ AD_SYSTEM_GUIDE.md        (500+ lines)
   ├─ ADVERTISING_SETUP_GUIDE.md (650+ lines)
   ├─ QUICK_START_ADS.md         (Quick reference)
   └─ ADVERTISING_IMPLEMENTATION.md (Summary)
```

## Data Flow Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                         FRONTEND                              │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  User Browser (Next.js Client Component)                     │
│  ├─ app/page.tsx                                             │
│  │  └─ RewardedAdButton component                            │
│  │     ├─ useState: canWatch, message, loading               │
│  │     ├─ useEffect: loadAdsterraScript()                    │
│  │     ├─ handleWatchAd()                                    │
│  │     │  ├─ Show modal with ad                              │
│  │     │  ├─ POST /api/points/reward-ad                      │
│  │     │  ├─ updateState with new points                     │
│  │     │  └─ trackAdCompletion (localStorage)                │
│  │     │                                                      │
│  │  └─ localStorage                                           │
│  │     ├─ lastRewardedAdTime                                 │
│  │     ├─ rewardedAdCount                                    │
│  │     └─ rewardedAdCountLastReset                           │
│  │                                                            │
│  └─ External Ad Networks                                     │
│     ├─ Google AdSense (pagead2.googlesyndication.com)        │
│     └─ Adsterra (ads.adsterra.com)                           │
│                                                               │
└───────────────────────────────────────────────────────────────┘
                           │
                    HTTP POST Request
                   (JSON with adType)
                           │
┌───────────────────────────────────────────────────────────────┐
│                         BACKEND                               │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  API Route Handler (Next.js)                                 │
│  ├─ app/api/points/reward-ad/route.ts                        │
│  │                                                            │
│  │  1. Authentication                                        │
│  │     └─ getServerSession(authOptions)                      │
│  │     └─ Verify user.email exists                           │
│  │                                                            │
│  │  2. Validation                                            │
│  │     ├─ Check adType parameter                             │
│  │     └─ Verify 'adsterra' or 'google'                      │
│  │                                                            │
│  │  3. Database Query (Prisma)                               │
│  │     └─ prisma.user.findUnique({                           │
│  │        where: { email: session.user.email }               │
│  │        select: { points, lifetimePoints, ... }            │
│  │     })                                                     │
│  │                                                            │
│  │  4. Rate Limiting                                         │
│  │     ├─ Check lastAdWatch timestamp                        │
│  │     ├─ Compare with cooldown (5-10 min)                   │
│  │     └─ Return 429 if too soon                             │
│  │                                                            │
│  │  5. Daily Limit Check                                     │
│  │     └─ Check against AD_DAILY_LIMITS                      │
│  │                                                            │
│  │  6. Points Update (Critical Section)                      │
│  │     └─ prisma.user.update({                               │
│  │        data: {                                            │
│  │          points: { increment: reward }                    │
│  │          lifetimePoints: { increment: reward }            │
│  │          lastAdWatch: new Date()                          │
│  │        }                                                   │
│  │     })                                                     │
│  │                                                            │
│  │  7. Activity Logging (Background/Async)                   │
│  │     └─ prisma.pointsHistory.create({                      │
│  │        type: 'ad_watch_adsterra',                         │
│  │        amount: reward,                                    │
│  │        description: 'Watched advertisement'               │
│  │     }).catch(err => console.error(err))                   │
│  │                                                            │
│  │  8. Response                                              │
│  │     └─ Return 200 with updated user data                  │
│  │                                                            │
│  └─ PostgreSQL Database                                      │
│     ├─ User table                                            │
│     │  ├─ points (updated)                                   │
│     │  ├─ lifetimePoints (updated)                           │
│     │  └─ lastAdWatch (updated)                              │
│     │                                                         │
│     └─ PointsHistory table                                   │
│        └─ New record: {                                      │
│           type: 'ad_watch_adsterra',                         │
│           amount: 50,                                        │
│           description: 'Watched advertisement',              │
│           createdAt: now                                     │
│        }                                                      │
│                                                               │
└───────────────────────────────────────────────────────────────┘
                           │
                    HTTP Response
                   (JSON with user data)
                           │
┌───────────────────────────────────────────────────────────────┐
│                      FRONTEND UPDATE                          │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Parse response                                           │
│  2. Update state with new points                             │
│  3. Update localStorage with ad timestamp                    │
│  4. Show success message                                     │
│  5. Refresh user data (optional)                             │
│  6. Re-render UI                                             │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Security Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                      UNTRUSTED ZONE                         │
│              (Browser / Client-side JavaScript)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  - localStorage (can be cleared/modified)                   │
│  - UI state (can be modified with DevTools)                 │
│  - XHR/Fetch requests (can be intercepted)                  │
│  - Variables (can be read with DevTools)                    │
│                                                             │
│  ❌ Points CANNOT be awarded here                           │
│  ❌ No database access                                      │
│  ✅ Can show UI, can request from API                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                          │
                    Verified Request
                      (with session)
                          │
┌─────────────────────────────────────────────────────────────┐
│                     TRUSTED ZONE                            │
│          (Server-side / Next.js API Routes)                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ Session verification (NextAuth)                         │
│  ✅ Database access (Prisma)                                │
│  ✅ Rate limiting checks (in memory/database)               │
│  ✅ Transaction safety                                      │
│  ✅ Audit logging                                           │
│                                                             │
│  Points awarded ONLY after:                                │
│  1. User authentication verified                           │
│  2. Cooldown enforced                                      │
│  3. Daily limits checked                                   │
│  4. Database transaction committed                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Scalability Considerations

```
Current Architecture: Single Instance

┌──────────────────┐
│  Next.js App     │
│  (Full Stack)    │
├──────────────────┤
│ API Routes       │
│ Components       │
└────────┬─────────┘
         │
         ▼
   PostgreSQL DB


Future Scaling Options:

Option 1: Horizontal Scaling
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Next.js App  │ │ Next.js App  │ │ Next.js App  │
│ (Vercel)     │ │ (Vercel)     │ │ (Vercel)     │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        ▼
                   PostgreSQL DB
                   (Connection pooling)

Option 2: Separate Backend
┌──────────────────────┐  ┌──────────────────┐
│ Next.js Frontend     │  │ Node/Go Backend  │
│ (Vercel)             │  │ (Separate Server)│
└──────────┬───────────┘  └────────┬─────────┘
           │                       │
           │      REST API         │
           ├──────────────────────┤
           │                       │
           └───────────────────────┘
                      │
                      ▼
              PostgreSQL + Redis
              (Read replicas, caching)

Option 3: Serverless/Edge
Same as Option 1, but with:
- Prisma Accelerate (connection pooling)
- Edge functions for rate limiting
- Database replicas in multiple regions
```

## Monitoring & Analytics

```
┌─────────────────────────────────────────────────────┐
│            ANALYTICS SOURCES                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Google AdSense Dashboard                       │
│     ├─ Impressions                                 │
│     ├─ Clicks                                      │
│     ├─ Revenue                                     │
│     └─ CPM/RPM trends                              │
│                                                     │
│  2. Adsterra Dashboard                             │
│     ├─ Impressions                                 │
│     ├─ Clicks                                      │
│     ├─ Conversions                                 │
│     └─ Revenue                                     │
│                                                     │
│  3. Your Database                                  │
│     SELECT type, COUNT(*) as count,                │
│            SUM(amount) as total_points             │
│     FROM PointsHistory                             │
│     WHERE type LIKE 'ad_watch_%'                   │
│     GROUP BY type;                                 │
│                                                     │
│  4. Application Metrics                            │
│     ├─ Active users watching ads                   │
│     ├─ Average points per session                  │
│     ├─ Retention (repeated ad viewers)             │
│     └─ Revenue per user                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Environment Variables Flow

```
PRODUCTION ENV VARS (Vercel Dashboard)
        │
        ▼
Next.js Build Process
        │
        ├─ NEXT_PUBLIC_* → Bundled into JavaScript
        │  (Visible to browser, required for ads)
        │
        └─ NEXTAUTH_SECRET, DATABASE_URL → Server only
           (Never sent to browser)
        │
        ▼
Deployed Application
        │
        ├─ Frontend receives NEXT_PUBLIC_* vars
        │  └─ Can request ads with these IDs
        │
        └─ Backend receives all variables
           └─ Can verify, rate limit, update DB
```

## Error Handling Flow

```
Request to /api/points/reward-ad

├─ Not authenticated
│  └─ 401 Unauthorized
│
├─ Invalid adType
│  └─ 400 Bad Request
│
├─ User not found
│  └─ 404 Not Found
│
├─ Cooldown active
│  └─ 429 Too Many Requests
│     (Include remainingMinutes)
│
├─ Daily limit reached
│  └─ 429 Too Many Requests
│     (Include dailyLimit)
│
├─ Database error
│  └─ 500 Internal Server Error
│
└─ Success
   └─ 200 OK
      (Include updated user data)
```

---

**Last Updated:** December 3, 2025
**Status:** Complete Architecture Documentation
