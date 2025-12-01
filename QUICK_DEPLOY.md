# 🚀 Quick Deploy Guide

## Deploy in 10 Minutes!

### Step 1: Push to GitHub (3 minutes)

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/trawally-management-system.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel (5 minutes)

1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Import from GitHub: `trawally-management-system`
4. Add Environment Variables:
   - `MONGODB_URI`: `mongodb+srv://ubaidttech_db_user:tra%40tech.281986@cluster0.lxszwnk.mongodb.net/trawally-management?retryWrites=true&w=majority&appName=Cluster0`
   - `SESSION_SECRET`: `trawally-production-secret-2024`
   - `NODE_ENV`: `production`
5. Click **"Deploy"**

### Step 3: Initial Setup (2 minutes)

1. Visit: `https://your-app.vercel.app/setup/initial-setup`
2. Create Super Admin account:
   - Username: `admin`
   - Email: `admin@trawally.com`
   - Password: `admin123`
3. Click "Create Super Admin"
4. Go to Login and start using!

## ✅ Done!

Your app is now live at: `https://your-app.vercel.app`

---

## Update Your App

```bash
# Make changes, then:
git add .
git commit -m "Your changes"
git push origin main
```

Vercel auto-deploys! 🎉

---

## Important URLs

- **Live App**: `https://your-app.vercel.app`
- **Initial Setup**: `https://your-app.vercel.app/setup/initial-setup`
- **Login**: `https://your-app.vercel.app/auth/login`
- **GitHub**: `https://github.com/YOUR-USERNAME/trawally-management-system`
- **Vercel Dashboard**: `https://vercel.com/dashboard`

---

## Troubleshooting

**Can't connect to database?**
- Check MongoDB Atlas Network Access allows `0.0.0.0/0`
- Verify environment variables in Vercel

**Setup page shows "already completed"?**
- Good! Go directly to `/auth/login`
- Use the credentials you created

**Need to reset?**
- Delete users from MongoDB Atlas
- Visit `/setup/initial-setup` again

---

For detailed guide, see `DEPLOYMENT_GUIDE.md`

