# Quick Start Guide - Trawally Management System

## Get Started in 5 Minutes

### Step 1: Install Dependencies (1 minute)
```bash
npm install
```

### Step 2: Database Ready (Already Done!)
Using MongoDB Atlas cloud database - no local setup needed!

### Step 3: Create Super Admin (1 minute)
```bash
node scripts/createSuperAdmin.js
```

Enter your details when prompted:
- Username: `admin`
- Email: `admin@trawally.com`
- Password: `admin123` (change this later!)

### Step 4: Start the Server (30 seconds)
```bash
npm start
```

### Step 5: Login (1 minute)
1. Open browser: `http://localhost:4000`
2. Click "Login"
3. Enter your super admin credentials
4. You're in!

## What to Do Next

### As Super Admin:
1. Go to "Manage Users"
2. Create a CEO account
3. Create an Admin account

### As Admin:
1. Add staff members
2. Record today's attendance
3. Create your first contract

### As CEO:
1. View the dashboard
2. Check out the reports
3. Monitor business performance

## Default Test Data (Optional)

Want to test with sample data? Here's a quick MongoDB script:

```javascript
// Connect to MongoDB
use trawally-management

// Add sample staff
db.staff.insertMany([
  {
    name: "John Doe",
    phone: "+2201234567",
    email: "john@example.com",
    specialization: "electrical",
    status: "active",
    dateJoined: new Date()
  },
  {
    name: "Jane Smith",
    phone: "+2207654321",
    email: "jane@example.com",
    specialization: "plumbing",
    status: "active",
    dateJoined: new Date()
  }
])
```

## Common Commands

```bash
# Start server
npm start

# Start with auto-reload (development)
npm run dev

# Create super admin
node scripts/createSuperAdmin.js

# Check if MongoDB is running
mongosh
```

## Quick Tips

- **Forgot Password?** Contact super admin to reset
- **Can't Login?** Check MongoDB is running
- **Port Conflict?** Change PORT in `.env` file
- **Need Help?** Check SETUP_GUIDE.md

## System URLs

- **Home:** http://localhost:4000
- **Login:** http://localhost:4000/auth/login
- **Super Admin Dashboard:** http://localhost:4000/superadmin/dashboard
- **CEO Dashboard:** http://localhost:4000/ceo/dashboard
- **Admin Dashboard:** http://localhost:4000/admin/dashboard

## Keyboard Shortcuts

- `Ctrl + S` - Save forms (browser default)
- `Esc` - Close modals
- `Tab` - Navigate form fields

## Mobile Access

Access from your phone on the same network:
```
http://YOUR_COMPUTER_IP:4000
```

Find your IP:
- Windows: `ipconfig`
- Mac/Linux: `ifconfig`

## That's It!

You're ready to manage Trawally Electrics & Plumbing Company efficiently!

For detailed documentation, see:
- README.md - Overview
- SETUP_GUIDE.md - Detailed setup
- FEATURES.md - Complete feature list

---

**Need Support?**
- Phone: +2203980627
- Phone: +2207980698

