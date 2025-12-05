require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

async function createSuperAdmin() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const username = 'trawally';
    const email = 'admin@trawally.com';
    const password = 'trawallybundung';

    const existingUser = await User.findOne({ 
      $or: [
        { username: username },
        { email: email }
      ]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        console.log(`User with username "${username}" already exists!`);
      }
      if (existingUser.email === email) {
        console.log(`User with email "${email}" already exists!`);
      }
      
      const update = await User.findOneAndUpdate(
        { username: username },
        {
          password: password,
          role: 'superadmin',
          email: email
        },
        { new: true, runValidators: true }
      );
      
      if (update) {
        console.log('\nSuper Admin account updated successfully!');
        console.log('Username:', update.username);
        console.log('Email:', update.email);
        console.log('Role:', update.role);
      }
    } else {
      const user = new User({
        username,
        email,
        password,
        role: 'superadmin'
      });

      await user.save();
      console.log('\nSuper Admin account created successfully!');
      console.log('Username:', username);
      console.log('Email:', email);
      console.log('Role: superadmin');
    }

    console.log('\nYou can now login at http://localhost:4000/auth/login');
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error.message);
    process.exit(1);
  }
}

createSuperAdmin();



