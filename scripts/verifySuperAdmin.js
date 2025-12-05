require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

async function verifySuperAdmin() {
  try {
    await connectDB();
    console.log('Connected to MongoDB\n');

    const user = await User.findOne({ username: 'trawally' });
    
    if (user) {
      console.log('Super Admin Account Found:');
      console.log('Username:', user.username);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Created:', user.createdAt);
      
      const passwordMatch = await user.comparePassword('trawallybundung');
      console.log('\nPassword verification:', passwordMatch ? '✓ Correct' : '✗ Incorrect');
    } else {
      console.log('User not found!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

verifySuperAdmin();



