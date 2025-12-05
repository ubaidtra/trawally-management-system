require('dotenv').config();
const User = require('../models/User');
const connectDB = require('../config/database');

async function updateSuperAdmin() {
  try {
    await connectDB();
    console.log('Connected to MongoDB\n');

    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    
    if (existingSuperAdmin) {
      existingSuperAdmin.username = 'trawally';
      existingSuperAdmin.password = 'trawallybundung';
      existingSuperAdmin.email = 'admin@trawally.com';
      
      await existingSuperAdmin.save();
      
      console.log('Super Admin account updated successfully!');
      console.log('Username: trawally');
      console.log('Email: admin@trawally.com');
      console.log('Password: trawallybundung');
      console.log('Role: superadmin');
    } else {
      const user = new User({
        username: 'trawally',
        email: 'admin@trawally.com',
        password: 'trawallybundung',
        role: 'superadmin'
      });
      
      await user.save();
      console.log('Super Admin account created successfully!');
      console.log('Username: trawally');
      console.log('Email: admin@trawally.com');
      console.log('Password: trawallybundung');
      console.log('Role: superadmin');
    }

    console.log('\nYou can now login at http://localhost:4000/auth/login');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateSuperAdmin();



