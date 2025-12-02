const User = require('../models/User');

exports.showLogin = (req, res) => {
  res.render('auth/login', { title: 'Login' });
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      req.session.error = 'Please provide both username and password';
      return req.session.save(() => res.redirect('/auth/login'));
    }
    
    const user = await User.findOne({ username: username.trim() });
    if (!user) {
      req.session.error = 'Invalid username or password';
      return req.session.save(() => res.redirect('/auth/login'));
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.session.error = 'Invalid username or password';
      return req.session.save(() => res.redirect('/auth/login'));
    }
    
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    req.session.success = `Welcome back, ${user.username}!`;
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect('/auth/login');
      }
      res.redirect(`/${user.role}/dashboard`);
    });
  } catch (error) {
    console.error('Login error:', error);
    req.session.error = 'An error occurred during login';
    req.session.save(() => res.redirect('/auth/login'));
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
};

