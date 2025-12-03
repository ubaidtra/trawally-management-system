# Deployment Guide - GitHub & VPS (PM2 + Nginx)

Complete step-by-step guide to deploy Trawally Management System to GitHub and a self-managed VPS environment (no serverless layers).

---

## 📋 Prerequisites

Before you begin, make sure you have:
- [x] A GitHub account (create at https://github.com/signup)
- [x] A VPS provider account (DigitalOcean, Hetzner, AWS Lightsail, etc.)
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

## Part 2: Deploy to a VPS (Ubuntu 22.04 + PM2 + Nginx)

This section keeps everything on your own virtual machine (DigitalOcean, AWS Lightsail, Hetzner, etc.) so the backend is **not** serverless.

### Step 1: Provision the Server

1. Create a VPS running **Ubuntu 22.04 LTS**, 2GB RAM or more.
2. Add your SSH key during creation, or enable password login temporarily.
3. Note the public IP and configure a firewall to allow ports `22`, `80`, and `443`.

### Step 2: SSH Into the Server

```bash
ssh root@YOUR_SERVER_IP
# or, if you created a non-root user:
ssh deploy@YOUR_SERVER_IP
```

Immediately create a deploy user if you logged in as root:

```bash
adduser deploy
usermod -aG sudo deploy
rsync -a ~/.ssh /home/deploy/
su - deploy
```

### Step 3: Install System Packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential git curl ufw nginx
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

Enable uncomplicated firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow "Nginx Full"
sudo ufw enable
```

### Step 4: Pull the Project

```bash
cd /var/www
sudo mkdir trawally && sudo chown deploy:deploy trawally
cd trawally
git clone https://github.com/YOUR-USERNAME/trawally-management-system.git app
cd app
npm install
```

### Step 5: Configure Environment Variables

Create `.env` (or edit existing) inside `app`:

```
MONGODB_URI=mongodb+srv://ubaidttech_db_user:tra%40tech.281986@cluster0.lxszwnk.mongodb.net/trawally-management?retryWrites=true&w=majority&appName=Cluster0
SESSION_SECRET=trawally-production-secret-key-2024
NODE_ENV=production
PORT=4000
```

Adjust secrets before going live. Keep this file out of Git.

### Step 6: Seed or Migrate (Optional)

Run any setup scripts you need (e.g., create indexes, seed data). Do this once while logged in.

### Step 7: Start the App with PM2

```bash
pm2 start server.js --name trawally --time
pm2 save
pm2 startup systemd
```

PM2 will generate a command (e.g., `sudo env PATH=$PATH pm2 startup ...`). Run it so the process auto-starts on reboot.

### Step 8: Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/trawally`:

```
server {
    server_name trawally.com www.trawally.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    listen 80;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/trawally /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 9: Add HTTPS (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d trawally.com -d www.trawally.com
```

Certbot will update the Nginx file for SSL and set up automatic renewal (`systemctl list-timers *certbot*`).

### Step 10: Verify Everything

1. Visit `https://trawally.com`.
2. Hit `/health` or `/auth/login` to confirm the Express server responds.
3. Check PM2 logs if something fails:
   ```bash
   pm2 logs trawally
   tail -f logs/combined.log # if you log to files
   ```

---

## Part 3: Configure DNS & Domain (Optional but Recommended)

1. In your domain registrar create two `A` records:
   - `@` → `YOUR_SERVER_IP`
   - `www` → `YOUR_SERVER_IP`
2. Lower TTL to 300s during setup for faster propagation.
3. Wait for DNS to resolve before running Certbot; verify with `dig trawally.com`.

---

## Part 4: Post-Deployment Setup

### Step 1: Create Super Admin on Production

Since this is a fresh deployment, you need to create a Super Admin:

**Option A: Run the setup script on the VPS**
- SSH into the server and execute your admin creation script so it targets the production database.

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

1. Visit your domain (HTTPS)
2. Go to `/auth/login`
3. Login with Super Admin credentials
4. Create CEO and Admin accounts
5. Test all features

---

## Part 5: Updating Your Deployment

### After Local Changes:

```bash
# 1. Add changes
git add .

# 2. Commit changes
git commit -m "Description of changes"

# 3. Push to GitHub
git push origin main
```

### Redeploy on the Server:

```bash
ssh deploy@YOUR_SERVER_IP
cd /var/www/trawally/app
git pull origin main
npm install --production
pm2 restart trawally
```

If you changed environment variables, update `.env`, then `pm2 reload trawally`.

---

## Part 6: PM2 Ecosystem File (Optional)

Create `ecosystem.config.js` in the project root so you can manage environments cleanly:

```js
module.exports = {
  apps: [
    {
      name: "trawally",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: 4000
      }
    }
  ]
};
```

Then run:

```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## Troubleshooting

### Issue: "Module not found" when running on the VPS

**Solution:**
- Ensure dependencies are in `package.json`.
- Run `npm install --production` on the server.
- Delete `node_modules` and reinstall if corrupted.

### Issue: "Cannot connect to MongoDB"

**Solution:**
- Check `.env` on the server.
- Make sure MongoDB Atlas allows the server IP or `0.0.0.0/0` temporarily.
- Verify outbound traffic isn’t blocked by a firewall.

### Issue: "Session not persisting"

**Solution:**
- Confirm `SESSION_SECRET` is the same across restarts.
- Check that `proxy_set_header` directives exist in Nginx so cookies stay intact.

### Issue: "Port already in use"

**Solution:**
- Stop conflicting processes: `sudo lsof -i :4000`.
- Restart PM2: `pm2 restart trawally`.
- Verify Nginx is proxying to the correct port.

### Issue: Puppeteer (PDF generation) not working

**Solution:**
- Install missing packages: `sudo apt install -y chromium-browser`.
- Run Puppeteer with `--no-sandbox` if necessary.
- For heavy PDF needs, consider a dedicated microservice.

---

## Important Notes for Production

### 1. Security Checklist

- [x] Change `SESSION_SECRET` to a strong random string
- [x] Use strong passwords for all accounts
- [x] Enable MongoDB Atlas IP whitelist (optional)
- [x] Use HTTPS (Certbot handles renewal)
- [x] Don't commit `.env` file to GitHub

### 2. MongoDB Atlas Configuration

1. Go to MongoDB Atlas
2. Click **"Network Access"**
3. Add IP: `0.0.0.0/0` (allow from anywhere)
   - Or add your VPS public IP for tighter security

### 3. Environment Variables Security

- Never commit `.env` to GitHub
- Use different credentials for production
- Rotate secrets regularly

### 4. Monitoring

**On the VPS:**
- `pm2 status` and `pm2 logs trawally`.
- `sudo journalctl -u nginx -f` to watch reverse proxy.
- Set up `fail2ban` and automatic security updates.

**In MongoDB Atlas:**
- Monitor database usage.
- Enable alerts and backups.

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

### PM2 Reference

```bash
# List processes
pm2 ls

# View logs
pm2 logs trawally

# Restart the app
pm2 restart trawally

# Reload after code changes
pm2 reload trawally

# Remove from PM2
pm2 delete trawally
```

---

## Deployment Checklist

Before going live, verify:

- [ ] `.env` is present on the server with production secrets
- [ ] MongoDB Atlas is accessible
- [ ] Super Admin account is created
- [ ] All features work on production
- [ ] HTTPS certificate is valid (auto-renews via Certbot)
- [ ] DNS points to the VPS
- [ ] Backup strategy is in place
- [ ] Error logging is working
- [ ] Performance is acceptable

---

## Support & Resources

### GitHub Documentation
- https://docs.github.com

### MongoDB Atlas Documentation
- https://docs.atlas.mongodb.com

### Ubuntu / Nginx / PM2 References
- https://ubuntu.com/server/docs
- https://nginx.org/en/docs/
- https://pm2.keymetrics.io/

---

## Summary

**Deployment Flow:**
1. Local Development → Git → GitHub → VPS (PM2 + Nginx) → Live Application

**Update Flow:**
1. Make changes locally
2. Commit to Git
3. Push to GitHub
4. Pull on the VPS + restart PM2

**Your Live URLs:**
- GitHub: `https://github.com/YOUR-USERNAME/trawally-management-system`
- Production: `https://trawally.com`

---

🎉 **Great job! Your Trawally Management System now runs on your own infrastructure.**

Contact: +2203980627 | +2207980698

