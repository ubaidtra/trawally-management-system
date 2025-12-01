# Trawally Electrics & Plumbing Management System

A comprehensive management system for Trawally Electrics & Plumbing Company built with Node.js, Express, MongoDB, and EJS.

## Features

### Super Admin
- Create and manage CEO and Admin accounts
- View system-wide statistics
- Full system oversight

### CEO Dashboard
- Comprehensive overview of all operations
- Staff deployment reports
- Attendance reports with date filtering
- Financial reports (revenue, payment status)
- Contract and service status tracking
- Visual charts and statistics
- Print reports functionality

### Admin Dashboard
- Staff management (register, edit, delete)
- Daily attendance recording
- Contract and service booking
- Fee and payment status recording
- Staff assignment to contracts/services
- Status updates (completed/uncompleted)
- Print contract agreements

## Services Offered

- Electrical Installation
- Water Pump Installation
- Borehole Drilling
- Water Tank Installation
- Home Services
- Office Installation

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Template Engine**: EJS
- **Authentication**: Session-based with bcryptjs
- **PDF Generation**: Puppeteer
- **Charts**: Chart.js

## Installation

1. Install dependencies:
```bash
npm install
```

2. The `.env` file is already configured with MongoDB Atlas connection

3. No need to install MongoDB locally - using cloud database

4. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

5. Access the application at `http://localhost:4000`

## Initial Setup

### Creating the First Super Admin Account

You need to create the first super admin account manually in MongoDB. Connect to your MongoDB database and run:

```javascript
use trawally-management

db.users.insertOne({
  username: "superadmin",
  email: "admin@trawally.com",
  password: "$2a$10$YourHashedPasswordHere",
  role: "superadmin",
  createdAt: new Date()
})
```

To generate a hashed password, you can use this Node.js script:

```javascript
const bcrypt = require('bcryptjs');
const password = 'your-password';
bcrypt.hash(password, 10).then(hash => console.log(hash));
```

Or use the provided setup script:

```bash
node scripts/createSuperAdmin.js
```

The application will run on port 4000.

## User Roles

1. **Super Admin**: Full system access, manages CEO and Admin accounts
2. **CEO**: View-only access with comprehensive reporting and analytics
3. **Admin**: Operational management (staff, attendance, contracts, services)

## Contact Information

- Phone: +2203980627
- Phone: +2207980698

## Security Features

- Password hashing with bcryptjs
- Session-based authentication
- Role-based access control
- Input validation
- Secure cookie configuration

## Project Structure

```
/
├── config/          # Database configuration
├── controllers/     # Request handlers
├── middleware/      # Authentication and authorization
├── models/          # MongoDB schemas
├── routes/          # Route definitions
├── views/           # EJS templates
├── public/          # Static assets (CSS, JS, images)
└── server.js        # Application entry point
```

## License

Proprietary - Trawally Electrics & Plumbing Company

