require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('../models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    if (existingSuperAdmin) {
      console.log('A super admin account already exists!');
      console.log('Username:', existingSuperAdmin.username);
      console.log('Email:', existingSuperAdmin.email);
      
      rl.question('Do you want to create another super admin? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() !== 'yes') {
          console.log('Exiting...');
          rl.close();
          process.exit(0);
        }
        await promptForDetails();
      });
    } else {
      await promptForDetails();
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

async function promptForDetails() {
  rl.question('Enter username: ', (username) => {
    rl.question('Enter email: ', (email) => {
      rl.question('Enter password: ', async (password) => {
        try {
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
          console.log('\nYou can now login at http://localhost:4000/auth/login');
        } catch (error) {
          console.error('Error creating super admin:', error.message);
        } finally {
          rl.close();
          process.exit(0);
        }
      });
    });
  });
}

createSuperAdmin();

