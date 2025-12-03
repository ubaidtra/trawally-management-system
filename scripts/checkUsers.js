require('dotenv').config();
const User = require('../models/User');
const connectDB = require('../config/database');

async function checkUsers() {
  try {
    await connectDB();
    const users = await User.find({});
    console.log(`Found ${users.length} users:\n`);
    users.forEach(u => {
      console.log(`- Username: ${u.username}, Email: ${u.email}, Role: ${u.role}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();

