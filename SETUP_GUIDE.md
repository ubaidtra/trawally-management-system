# Trawally Management System - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm (comes with Node.js)

## Step-by-Step Installation

### 1. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install all required packages including:
- express
- mongoose
- ejs
- bcryptjs
- express-session
- puppeteer
- chart.js
- and more...

### 2. Database Configuration

The system is configured to use **MongoDB Atlas** (cloud database).
No local MongoDB installation required!

The `.env` file is already configured with the connection string.

### 3. Environment Variables

The `.env` file is already set up with:
- MongoDB Atlas connection string
- Session secret
- Port configuration

**Important:** The SESSION_SECRET should be changed in production!

### 4. Create Super Admin Account

Run the setup script to create your first super admin account:

```bash
node scripts/createSuperAdmin.js
```

Follow the prompts to enter:
- Username (e.g., "superadmin")
- Email (e.g., "admin@trawally.com")
- Password (minimum 6 characters)

### 5. Start the Application

```bash
npm start
```

For development with auto-restart on file changes:

```bash
npm run dev
```

### 6. Access the Application

Open your browser and navigate to:
```
http://localhost:4000
```

## First Time Login

1. Go to `http://localhost:4000/auth/login`
2. Login with the super admin credentials you created
3. You'll be redirected to the Super Admin Dashboard

## Creating Additional Users

### As Super Admin:

1. Login to your super admin account
2. Navigate to "Manage Users"
3. Click "Create New User"
4. Fill in the details:
   - Username
   - Email
   - Password (minimum 6 characters)
   - Role (CEO or Admin)
5. Click "Create User"

## User Workflow

### Super Admin Workflow:
1. Login → Super Admin Dashboard
2. Create CEO and Admin accounts
3. Monitor system statistics
4. Manage users as needed

### CEO Workflow:
1. Login → CEO Dashboard
2. View comprehensive statistics
3. Access Reports section
4. Filter reports by type and date range
5. Print reports as needed

### Admin Workflow:
1. Login → Admin Dashboard
2. Manage Staff:
   - Add new staff members
   - Edit staff details
   - Assign specializations
3. Record Attendance:
   - Select date
   - Mark attendance for all staff
   - Add time in/out and notes
4. Manage Contracts:
   - Create new contracts
   - Assign staff to contracts
   - Update status and payment
   - Print contract agreements
5. Manage Services:
   - Create service bookings
   - Assign staff
   - Track completion and payment

## Common Issues and Solutions

### Issue: Cannot connect to MongoDB
**Solution:** Make sure MongoDB is running. Check with:
```bash
mongosh
```

### Issue: Port 4000 already in use
**Solution:** Change the PORT in `.env` file to another port (e.g., 4001 or 5000)

### Issue: Puppeteer installation fails
**Solution:** 
```bash
npm install puppeteer --ignore-scripts
```

### Issue: Session not persisting
**Solution:** Clear browser cookies and restart the server

## Security Best Practices

1. **Change Default Credentials:** Always change the super admin password after first login
2. **Use Strong Passwords:** Enforce minimum 8 characters with mixed case and numbers
3. **Secure SESSION_SECRET:** Use a long random string in production
4. **Enable HTTPS:** In production, use HTTPS instead of HTTP
5. **Regular Backups:** Backup MongoDB database regularly

## Production Deployment

### Environment Variables for Production:
```
MONGODB_URI=mongodb://your-production-db-url
SESSION_SECRET=your-very-long-random-secret-key
PORT=4000
NODE_ENV=production
```

### Additional Steps:
1. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start server.js --name trawally-management
```

2. Setup MongoDB authentication
3. Configure firewall rules
4. Use a reverse proxy (nginx/Apache)
5. Setup SSL certificates

## Database Backup

To backup your MongoDB database:

```bash
mongodump --db trawally-management --out ./backup
```

To restore:

```bash
mongorestore --db trawally-management ./backup/trawally-management
```

## Support

For issues or questions:
- Phone: +2203980627
- Phone: +2207980698

## System Requirements

**Minimum:**
- 2GB RAM
- 10GB Storage
- 2 CPU Cores

**Recommended:**
- 4GB RAM
- 20GB Storage
- 4 CPU Cores

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Features Checklist

After setup, verify these features work:

- [ ] Login/Logout
- [ ] Super Admin can create users
- [ ] Admin can add staff
- [ ] Admin can record attendance
- [ ] Admin can create contracts
- [ ] Admin can create services
- [ ] CEO can view reports
- [ ] CEO can filter reports by date
- [ ] Contract agreements can be printed
- [ ] Charts display correctly on CEO dashboard
- [ ] All forms validate input
- [ ] Session persists across page refreshes

Congratulations! Your Trawally Management System is now ready to use.

