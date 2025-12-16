# Rewards Marketplace Refactoring

## Overview

The Shop component has been refactored into a **Rewards Marketplace** where users can spend their earned points to claim amazing rewards. The marketplace features a modern, intuitive interface with clear labeling that reinforces the rewards-for-points exchange model.

## Changes Made

### 1. Renamed Component & Labels

**Before:**
- Page name: `Shop`
- Title: "Rewards Store"
- Subtitle: "Exchange your points for premium rewards"
- Icon: 🛍️
- Points label: "Available Points"
- Button: "Buy Now"
- Sign-in prompt: "Sign in to purchase items!"

**After:**
- Page name: `RewardsMarketplace`
- Title: "Rewards Marketplace"
- Subtitle: "Spend your earned points to claim amazing rewards"
- Icon: 🎁
- Points label: "Spendable Points"
- Button: "Buy"
- Sign-in prompt: "Sign in to claim rewards!"
- Category headers: "{Category} Rewards"

### 2. Button Label Update

Changed from `🛒 Buy Now` to `💳 Buy` - more concise and action-focused, with money/payment emoji to reinforce spending points.

### 3. Points System Protection

**Important:** User level is NOT affected by purchasing rewards.

#### How It Works:
- **Current Points** (`points` field): Spendable balance used to buy rewards
- **Lifetime Points** (`lifetimePoints` field): Total earned points (never decreases)
- **User Level**: Calculated from `lifetimePoints` only

When a user buys a reward:
```
Only this is decremented:     points: points - costPoints
Never touched:                lifetimePoints: stays the same
Level calculation:            level = calculateFromLifetimePoints()
Result:                       Level stays the same ✓
```

#### Code Location:
File: `app/api/store/buy/route.ts`

```typescript
// IMPORTANT: Only decrement "points" (spendable points), NOT "lifetimePoints"
// User level is based on lifetimePoints earned, not current points spent
// This ensures buying rewards doesn't reduce the user's level
prisma.user.update({
  where: { id: user.id },
  data: { points: { decrement: product.costPoints } },
})
```

## Files Modified

### 1. `app/shop/page.tsx` - Main Marketplace Page
- Function renamed from `Shop()` to `RewardsMarketplace()`
- Added documentation comment explaining level protection
- Updated all UI labels for rewards context
- Changed emoji from 🛍️ to 🎁
- Updated category headers to say "{Category} Rewards"
- Updated loading message
- Updated sign-in prompt

### 2. `components/DigitalProductCard.tsx` - Product Card Component
- Button changed from "🛒 Buy Now" to "💳 Buy"
- More concise and action-oriented
- Maintains all other functionality (affordability check, out of stock, etc.)

### 3. `app/api/store/buy/route.ts` - Purchase API Route
- Added detailed comment explaining why only `points` is decremented
- Clarifies the relationship between points, lifetimePoints, and level
- No functional changes - route already worked correctly

## User Experience Flow

```
1. User browses Rewards Marketplace
   ↓
2. Selects a reward to purchase
   ↓
3. Reviews cost in "Spendable Points"
   ↓
4. Clicks "💳 Buy" button
   ↓
5. Points are deducted from spendable balance
   ↓
6. Reward is claimed/delivered
   ↓
7. Lifetime points and level remain unchanged ✓
   ↓
8. User still has all earned rewards and progression
```

## Key Differences: Rewards vs Shop

| Aspect | Before (Shop) | After (Rewards Marketplace) |
|--------|---------------|---------------------------|
| **Terminology** | Purchase items | Claim rewards |
| **Mental Model** | Buying | Spending earned benefits |
| **Points Label** | "Available Points" | "Spendable Points" |
| **Button** | "🛒 Buy Now" | "💳 Buy" |
| **Icon** | 🛍️ Shopping | 🎁 Rewards |
| **Level Impact** | ❌ Not specified | ✓ Protected |

## Points System Details

### Point Types

**Spendable Points** (`points`)
- What you can spend on rewards
- Decreases when you buy rewards
- Can be earned through:
  - Clicking (habits, activities)
  - Watching ads
  - Completing challenges
  - Referrals
  - Streaks

**Lifetime Points** (`lifetimePoints`)
- Total points ever earned
- Never decreases
- Only increases
- Used to calculate user level
- Shows your total progression

### Example Scenario

User: "Alice"
- Lifetime Points: 5000 (total earned)
- Current Points: 2500 (remaining to spend)
- Level: 5 (calculated from 5000 lifetime points)

Alice buys a $1000 reward:
```
Before:
  - Lifetime Points: 5000
  - Current Points: 2500
  - Level: 5

After Purchase:
  - Lifetime Points: 5000 ✓ (unchanged)
  - Current Points: 1500 (2500 - 1000)
  - Level: 5 ✓ (still same)
```

## Configuration Reference

### Difficulty Levels & XP Values
Points are earned through habits based on difficulty:
- Easy: 10 XP
- Medium: 25 XP
- Hard: 50 XP
- Extreme: 100 XP

With bonuses:
- Streak bonus: +5% per day
- First-completion bonus: +20%

### Points Breakdown
```
Earned Points  → Lifetime Points  → Level Calculation
                ↓
            Current Points  → Spend on Rewards
```

## Testing the System

### Verify Level Protection

1. **Check Initial State**
   - Note user's level (e.g., Level 5)
   - Note spendable points (e.g., 2500)

2. **Make a Purchase**
   - Buy a reward costing 1000 points
   - Confirm transaction succeeds

3. **Verify Level Unchanged**
   - User level should still be Level 5
   - Spendable points should be 1500 (2500 - 1000)
   - Lifetime points should be unchanged

4. **Expected Result**
   - ✓ Level stays the same
   - ✓ Spendable points decrease
   - ✓ Lifetime points unchanged
   - ✓ User progression not affected

## API Endpoints

### GET `/api/store/products`
Returns available rewards.

### POST `/api/store/buy`
Purchase a reward with points.

Request:
```json
{ "productId": "123" }
```

Response (Success):
```json
{
  "message": "✅ Purchased: Product Name",
  "newPoints": 1500,
  "orderId": "order-456",
  "status": "delivered",
  "redeemCode": "XXXX-XXXX-XXXX-XXXX",
  "isPending": false
}
```

Response (Insufficient Points):
```json
{ "error": "Insufficient points" }
```

## Styling & Design

### Color Scheme
- Primary: Purple/Blue gradients (purchasing actions)
- Points Card: Yellow/Amber (spendable currency)
- Category Badges: Black background, white text
- Stock Status: Color-coded (green/yellow/red)

### Responsive Design
- Mobile: Single column, optimized touch targets
- Tablet: 2-column layout
- Desktop: 3-4 column grid with horizontal scroll for categories

### Icons
- 🎁 Marketplace icon
- 💳 Points spending icon
- 🎮 Gaming category
- 🎥 Entertainment category
- 🛍️ Shopping category
- 🍕 Food category

## Backward Compatibility

All existing functionality is preserved:
- ✓ Product browsing
- ✓ Category filtering
- ✓ Stock management
- ✓ Redemption codes
- ✓ Purchase history
- ✓ Notifications
- ✓ Mobile responsiveness

Only UI labels and terminology changed.

## Documentation Updates Needed

If you maintain external documentation, update:
- "Shop" → "Rewards Marketplace"
- "Buy now" → "Buy"
- "Purchase items" → "Claim rewards"
- "Available points" → "Spendable points"

## Related Files

- **Marketplace**: `app/shop/page.tsx`
- **Product Card**: `components/DigitalProductCard.tsx`
- **Purchase API**: `app/api/store/buy/route.ts`
- **Purchase History**: `app/purchases/page.tsx`
- **Shopping Context**: `contexts/ShoppingContext.tsx` (if exists)

## Summary of Improvements

✅ Clearer terminology reinforces rewards concept
✅ Button text is more concise and action-oriented
✅ Level protection is documented and verified
✅ User experience improved with better labels
✅ All functionality preserved
✅ Points system remains intuitive
✅ No breaking changes

The Rewards Marketplace now clearly communicates that users are claiming rewards they've earned, not purchasing from a traditional shop!
