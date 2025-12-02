const express = require('express');
const router = express.Router();
const User = require('../models/User');
const connectDB = require('../config/database');

router.get('/initial-setup', async (req, res) => {
  try {
    await connectDB();
    const existingUsers = await User.countDocuments();
    
    if (existingUsers > 0) {
      return res.status(400).send('Setup already completed. Users exist in the database.');
    }
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Initial Setup - Trawally Management System</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 500px;
            margin: 50px auto;
            padding: 20px;
            background: #f3f4f6;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 { color: #1e40af; }
          input, button {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          button {
            background: #1e40af;
            color: white;
            border: none;
            cursor: pointer;
            font-size: 16px;
          }
          button:hover { background: #1e3a8a; }
          .message { padding: 10px; margin: 10px 0; border-radius: 4px; }
          .success { background: #d1fae5; color: #065f46; }
          .error { background: #fee2e2; color: #991b1b; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Initial Setup</h1>
          <p>Create your Super Admin account:</p>
          <form id="setupForm">
            <input type="text" id="username" placeholder="Username" required>
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Password (min 6 characters)" required minlength="6">
            <button type="submit">Create Super Admin</button>
          </form>
          <div id="message"></div>
        </div>
        <script>
          document.getElementById('setupForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const messageDiv = document.getElementById('message');
            
            const data = {
              username: document.getElementById('username').value,
              email: document.getElementById('email').value,
              password: document.getElementById('password').value
            };
            
            try {
              const response = await fetch('/setup/create-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              });
              
              const result = await response.json();
              
              if (response.ok) {
                messageDiv.className = 'message success';
                messageDiv.innerHTML = result.message + '<br><br><a href="/auth/login">Go to Login</a>';
                document.getElementById('setupForm').style.display = 'none';
              } else {
                messageDiv.className = 'message error';
                messageDiv.textContent = result.error;
              }
            } catch (error) {
              messageDiv.className = 'message error';
              messageDiv.textContent = 'Error: ' + error.message;
            }
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('Error checking setup status: ' + error.message);
  }
});

router.post('/create-admin', async (req, res) => {
  try {
    await connectDB();
    const existingUsers = await User.countDocuments();
    
    if (existingUsers > 0) {
      return res.status(400).json({ error: 'Setup already completed' });
    }
    
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const superAdmin = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'superadmin'
    });
    
    await superAdmin.save();
    
    res.json({ 
      message: 'Super Admin created successfully! You can now login.',
      username: username
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creating admin: ' + error.message });
  }
});

router.get('/create-superadmin/:key', async (req, res) => {
  const SETUP_KEY = 'trawally2024setup';
  
  if (req.params.key !== SETUP_KEY) {
    return res.status(403).send('Invalid setup key');
  }
  
  const message = req.query.message || '';
  const error = req.query.error || '';
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Create Super Admin - Trawally</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 450px; margin: 50px auto; padding: 20px; background: #f3f4f6; }
        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #1e40af; margin-bottom: 20px; }
        input, button { width: 100%; padding: 12px; margin: 8px 0; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { background: #1e40af; color: white; border: none; cursor: pointer; font-size: 16px; }
        button:hover { background: #1e3a8a; }
        .msg { padding: 12px; margin: 10px 0; border-radius: 4px; }
        .success { background: #d1fae5; color: #065f46; }
        .error { background: #fee2e2; color: #991b1b; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Create Super Admin</h1>
        ${message ? '<div class="msg success">' + message + ' <a href="/auth/login">Go to Login</a></div>' : ''}
        ${error ? '<div class="msg error">' + error + '</div>' : ''}
        ${!message ? `
        <form action="/setup/do-create-superadmin/${SETUP_KEY}" method="POST">
          <input type="text" name="username" placeholder="Username" required>
          <input type="email" name="email" placeholder="Email" required>
          <input type="password" name="password" placeholder="Password (min 6 chars)" required minlength="6">
          <button type="submit">Create Super Admin</button>
        </form>
        ` : ''}
      </div>
    </body>
    </html>
  `);
});

router.post('/do-create-superadmin/:key', async (req, res) => {
  const SETUP_KEY = 'trawally2024setup';
  
  if (req.params.key !== SETUP_KEY) {
    return res.redirect('/setup/create-superadmin/' + SETUP_KEY + '?error=Invalid+setup+key');
  }
  
  try {
    await connectDB();
    
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.redirect('/setup/create-superadmin/' + SETUP_KEY + '?error=All+fields+are+required');
    }
    
    if (password.length < 6) {
      return res.redirect('/setup/create-superadmin/' + SETUP_KEY + '?error=Password+must+be+at+least+6+characters');
    }
    
    await User.deleteMany({ role: 'superadmin' });
    
    const superAdmin = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'superadmin'
    });
    
    await superAdmin.save();
    
    res.redirect('/setup/create-superadmin/' + SETUP_KEY + '?message=Super+Admin+created+successfully!');
  } catch (error) {
    console.error('Setup error:', error);
    res.redirect('/setup/create-superadmin/' + SETUP_KEY + '?error=' + encodeURIComponent(error.message));
  }
});

module.exports = router;

