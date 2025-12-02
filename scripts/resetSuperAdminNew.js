require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function resetSuperAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB');

    await User.deleteMany({ role: 'superadmin' });
    console.log('Deleted existing super admin accounts');

    const user = new User({
      username: 'trawally',
      email: 'admin@trawally.com',
      password: 'trawallybundung',
      role: 'superadmin'
    });

    await user.save();
    console.log('\nNew Super Admin created successfully!');
    console.log('Username: trawally');
    console.log('Password: trawallybundung');
    console.log('Email: admin@trawally.com');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetSuperAdmin();

