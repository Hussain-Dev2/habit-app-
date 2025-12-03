# 🎛️ Admin Control Panel - Complete Setup

## How to Use Your Admin Dashboard

### 1. **Getting Admin Access**

First, you need to make yourself an admin. Go to:
- **URL:** `http://localhost:3000/admin-setup`
- **Enter Secret Key:** `admin123secret` (from your `.env` file)
- Click **Become Admin**

Once you're admin, you'll see the **⚙️ Admin** link in the header navigation.

### 2. **Access Admin Dashboard**

Navigate to: `http://localhost:3000/admin`

You'll see three tabs:

#### **📦 Products Tab**
Manage your store products:
- **Add New Product** - Create new items to sell
  - Product Title (required)
  - Description
  - Cost in Points (required)
  - Stock (leave empty for unlimited)
- **Edit Products** - Click ✏️ Edit button on any product
- **Delete Products** - Click 🗑️ Delete button to remove
- View all products with count

#### **👥 Users Tab**
Manage your users:
- **Search Users** - Find by email address
- **View User Stats** - See points, clicks, join date
- **Make Admin** - Toggle ⭐ Admin status
- **Add Points** - Click ➕ Points button to refill user points
  - Shows current points
  - Enter amount to add
  - Auto-updates user balance

#### **📊 Analytics Tab**
(Coming soon) - Future analytics dashboard

---

## Admin Features

### ✅ What You Can Do

1. **Add unlimited products** to your store
2. **Edit any product** - change title, description, cost, or stock
3. **Delete products** - remove items from store
4. **Manage users** - promote/demote admins
5. **Refill user points** - add points to any user instantly
6. **Search users** - find users by email
7. **View all statistics** - see points, clicks, join dates

### 📋 API Endpoints

**Products:**
- `GET /api/admin/products` - List all products
- `POST /api/admin/products` - Create new product
- `PUT /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product

**Users:**
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/[userId]` - Toggle admin status
- `POST /api/admin/users/[userId]/points` - Add points to user

**Admin:**
- `GET /api/admin/check` - Check if current user is admin
- `POST /api/admin/set-admin` - Make user admin (with secret key)

---

## Security Notes

- All admin endpoints require authentication
- Only admin users can access `/admin` page
- Admin routes validate `isAdmin` flag on every request
- Secret key in `.env` can be changed for production

---

## How It Works

1. **Authentication Check** → Verifies user is logged in
2. **Admin Check** → Verifies user has `isAdmin: true` in database
3. **Action Processing** → Creates, updates, or deletes data
4. **Response** → Returns updated data to UI
5. **UI Update** → Admin panel reflects changes immediately

---

## Example Workflows

### 🛍️ Add a New Store Product

1. Go to `/admin`
2. Click **📦 Products** tab
3. Click **+ Add New Product** button
4. Fill in details:
   - Title: "Speed Boost"
   - Description: "Click 2x faster for 1 minute"
   - Cost: 500 points
   - Stock: 10
5. Click **✓ Create Product**
6. Product appears instantly in list

### 💰 Refill User Points

1. Go to `/admin`
2. Click **👥 Users** tab
3. Search for user by email (optional)
4. Find user in table
5. Click **➕ Points** button
6. Enter amount (e.g., 1000)
7. Click **✓ Add**
8. User's points increase instantly

### 🔐 Make User Admin

1. Go to `/admin`
2. Click **👥 Users** tab
3. Find user in table
4. Click **User** button (gray)
5. Button changes to **⭐ Admin** (purple)
6. User can now access `/admin` page

---

## Troubleshooting

**Can't access admin panel?**
- Make sure you completed the admin setup at `/admin-setup`
- Enter correct secret key: `admin123secret`
- Refresh page after becoming admin

**Products not showing up?**
- Check network tab for API errors
- Ensure you're logged in
- Verify you're an admin

**Points not updating?**
- Check browser console for errors
- Verify user ID is correct
- Check that you're entering a valid number

---

## Next Steps

- Customize the secret key in `.env` for production
- Add more analytics to the Analytics tab
- Add user notes/comments feature
- Add bulk import/export for products
- Add role-based permissions (admin levels)

Enjoy your admin panel! 🎉
