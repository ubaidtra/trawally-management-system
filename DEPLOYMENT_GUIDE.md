# Deployment Guide - GitHub & Vercel

Complete step-by-step guide to deploy Trawally Management System to GitHub and Vercel.

---

## 📋 Prerequisites

Before you begin, make sure you have:
- [x] A GitHub account (create at https://github.com/signup)
- [x] A Vercel account (create at https://vercel.com/signup)
- [x] Git installed on your computer
- [x] Your MongoDB Atlas database is working
- [x] The system is working locally

---

## Part 1: Deploy to GitHub

### Step 1: Install Git (if not installed)

**Check if Git is installed:**
```bash
git --version
```

**If not installed, download from:** https://git-scm.com/downloads

### Step 2: Initialize Git Repository

Open PowerShell in your project folder and run:

```bash
git init
```

This creates a new Git repository in your project.

### Step 3: Configure Git (First Time Only)

Set your name and email:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 4: Add Files to Git

Add all project files:

```bash
git add .
```

### Step 5: Create First Commit

```bash
git commit -m "Initial commit - Trawally Management System"
```

### Step 6: Create GitHub Repository

1. Go to https://github.com
2. Click the **"+"** icon (top right)
3. Click **"New repository"**
4. Fill in the details:
   - **Repository name:** `trawally-management-system`
   - **Description:** `Management System for Trawally Electrics & Plumbing Company`
   - **Visibility:** Choose **Private** (recommended) or Public
   - **DO NOT** check "Initialize with README" (we already have files)
5. Click **"Create repository"**

### Step 7: Connect Local Repository to GitHub

GitHub will show you commands. Copy and run these in PowerShell:

```bash
git remote add origin https://github.com/YOUR-USERNAME/trawally-management-system.git
git branch -M main
git push -u origin main
```

**Replace `YOUR-USERNAME` with your actual GitHub username**

### Step 8: Verify Upload

1. Refresh your GitHub repository page
2. You should see all your files uploaded
3. ✅ GitHub deployment complete!

---

## Part 2: Deploy to Vercel

### Step 1: Create Vercel Account

1. Go to https://vercel.com/signup
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account

### Step 2: Import Project from GitHub

1. On Vercel dashboard, click **"Add New..."**
2. Select **"Project"**
3. Click **"Import Git Repository"**
4. Find `trawally-management-system` in the list
5. Click **"Import"**

### Step 3: Configure Project Settings

**Framework Preset:**
- Select: **Other** (or leave as detected)

**Root Directory:**
- Leave as: `./` (root)

**Build and Output Settings:**
- Build Command: Leave empty or use `npm install`
- Output Directory: Leave empty
- Install Command: `npm install`

### Step 4: Add Environment Variables

This is **CRITICAL** - Click **"Environment Variables"** and add these:

| Name | Value |
|------|-------|
| `MONGODB_URI` | `mongodb+srv://ubaidttech_db_user:tra%40tech.281986@cluster0.lxszwnk.mongodb.net/trawally-management?retryWrites=true&w=majority&appName=Cluster0` |
| `SESSION_SECRET` | `trawally-production-secret-key-2024` |
| `PORT` | `4000` |
| `NODE_ENV` | `production` |

**Important Notes:**
- Make sure the `@` in password is encoded as `%40`
- Use a strong SESSION_SECRET for production
- Add these for all environments (Production, Preview, Development)

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait 2-5 minutes for deployment
3. Vercel will build and deploy your application

### Step 6: Check Deployment Status

You'll see:
- ✅ **Building** - Installing dependencies
- ✅ **Deploying** - Uploading to Vercel servers
- ✅ **Ready** - Deployment successful!

### Step 7: Access Your Live Application

Once deployed, you'll get a URL like:
```
https://trawally-management-system.vercel.app
```

Click **"Visit"** to open your live application!

---

## Part 3: Configure Custom Domain (Optional)

### Step 1: Go to Project Settings

1. Click on your project in Vercel
2. Go to **"Settings"**
3. Click **"Domains"**

### Step 2: Add Custom Domain

1. Enter your domain (e.g., `trawally.com`)
2. Click **"Add"**
3. Follow DNS configuration instructions
4. Wait for DNS propagation (can take 24-48 hours)

---

## Part 4: Post-Deployment Setup

### Step 1: Create Super Admin on Production

Since this is a fresh deployment, you need to create a Super Admin:

**Option A: Use the script remotely (if Vercel allows)**
- This might not work on Vercel's serverless environment

**Option B: Create directly in MongoDB Atlas**

1. Go to https://cloud.mongodb.com
2. Click **"Browse Collections"**
3. Select `trawally-management` database
4. Select `users` collection
5. Click **"Insert Document"**
6. Add this document:

```json
{
  "username": "admin",
  "email": "admin@trawally.com",
  "password": "$2a$10$YourHashedPasswordHere",
  "role": "superadmin",
  "createdAt": {"$date": "2024-12-01T00:00:00.000Z"}
}
```

**To get the hashed password:**

Run locally:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"
```

Copy the output and replace `$2a$10$YourHashedPasswordHere` with it.

**Option C: Temporarily enable a setup endpoint (Recommended)**

I'll create a one-time setup endpoint for you.

### Step 2: Test the Live Application

1. Visit your Vercel URL
2. Go to `/auth/login`
3. Login with Super Admin credentials
4. Create CEO and Admin accounts
5. Test all features

---

## Part 5: Updating Your Deployment

### When You Make Changes Locally:

```bash
# 1. Add changes
git add .

# 2. Commit changes
git commit -m "Description of changes"

# 3. Push to GitHub
git push origin main
```

**Vercel will automatically detect the push and redeploy!** 🚀

---

## Part 6: Vercel Configuration File

Create a `vercel.json` file in your project root for better configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## Troubleshooting

### Issue: "Module not found" on Vercel

**Solution:**
- Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify
- Push changes to GitHub

### Issue: "Cannot connect to MongoDB"

**Solution:**
- Check environment variables in Vercel
- Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Verify the connection string is correct

### Issue: "Session not persisting"

**Solution:**
- Make sure `SESSION_SECRET` is set in Vercel environment variables
- Check that cookies are enabled in your browser

### Issue: "Port already in use"

**Solution:**
- Vercel assigns ports automatically
- Remove `PORT` from environment variables or set to `3000`

### Issue: Puppeteer (PDF generation) not working

**Solution:**
Puppeteer doesn't work well on Vercel's serverless environment. Options:

1. **Use a different PDF library:**
   - Install: `npm install pdfkit`
   - Rewrite PDF generation using PDFKit

2. **Use an external PDF service:**
   - DocRaptor
   - PDFShift
   - HTML2PDF API

3. **Disable PDF features temporarily**

---

## Important Notes for Production

### 1. Security Checklist

- [x] Change `SESSION_SECRET` to a strong random string
- [x] Use strong passwords for all accounts
- [x] Enable MongoDB Atlas IP whitelist (optional)
- [x] Use HTTPS (Vercel provides this automatically)
- [x] Don't commit `.env` file to GitHub

### 2. MongoDB Atlas Configuration

1. Go to MongoDB Atlas
2. Click **"Network Access"**
3. Add IP: `0.0.0.0/0` (allow from anywhere)
   - Or add Vercel's IP ranges for better security

### 3. Environment Variables Security

- Never commit `.env` to GitHub
- Use different credentials for production
- Rotate secrets regularly

### 4. Monitoring

**In Vercel:**
- Check **"Analytics"** for traffic
- Check **"Logs"** for errors
- Set up **"Notifications"** for deployment status

**In MongoDB Atlas:**
- Monitor database usage
- Set up alerts for high usage
- Enable automatic backups

---

## Quick Command Reference

### Git Commands

```bash
# Check status
git status

# Add all files
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# View commit history
git log --oneline
```

### Vercel CLI (Optional)

Install Vercel CLI for command-line deployment:

```bash
# Install globally
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## Deployment Checklist

Before going live, verify:

- [ ] All environment variables are set in Vercel
- [ ] MongoDB Atlas is accessible
- [ ] Super Admin account is created
- [ ] All features work on production
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] Custom domain is configured (if applicable)
- [ ] Backup strategy is in place
- [ ] Error logging is working
- [ ] Performance is acceptable

---

## Support & Resources

### Vercel Documentation
- https://vercel.com/docs

### GitHub Documentation
- https://docs.github.com

### MongoDB Atlas Documentation
- https://docs.atlas.mongodb.com

### Need Help?
- Vercel Support: https://vercel.com/support
- GitHub Support: https://support.github.com

---

## Summary

**Deployment Flow:**
1. Local Development → Git → GitHub → Vercel → Live Application

**Update Flow:**
1. Make changes locally
2. Commit to Git
3. Push to GitHub
4. Vercel auto-deploys

**Your Live URLs:**
- GitHub: `https://github.com/YOUR-USERNAME/trawally-management-system`
- Vercel: `https://trawally-management-system.vercel.app`

---

🎉 **Congratulations! Your Trawally Management System is now live and accessible worldwide!**

Contact: +2203980627 | +2207980698

