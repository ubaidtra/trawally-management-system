require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function resetSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all existing users
    const deleteResult = await User.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing user(s)`);

    // Create new Super Admin
    const superAdmin = new User({
      username: 'admin',
      email: 'admin@trawally.com',
      password: 'admin123',
      role: 'superadmin'
    });

    await superAdmin.save();
    console.log('\n✅ Super Admin account created successfully!');
    console.log('Username: admin');
    console.log('Email: admin@trawally.com');
    console.log('Password: admin123');
    console.log('\nYou can now login at http://localhost:4000/auth/login');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetSuperAdmin();

