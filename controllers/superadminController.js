const User = require('../models/User');
const Staff = require('../models/Staff');
const Contract = require('../models/Contract');
const Service = require('../models/Service');

exports.showDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments().catch(() => 0);
    const totalStaff = await Staff.countDocuments().catch(() => 0);
    const totalContracts = await Contract.countDocuments().catch(() => 0);
    const totalServices = await Service.countDocuments().catch(() => 0);
    
    res.render('superadmin/dashboard', {
      title: 'Super Admin Dashboard',
      currentPage: 'dashboard',
      totalUsers: totalUsers || 0,
      totalStaff: totalStaff || 0,
      totalContracts: totalContracts || 0,
      totalServices: totalServices || 0
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('superadmin/dashboard', {
      title: 'Super Admin Dashboard',
      currentPage: 'dashboard',
      totalUsers: 0,
      totalStaff: 0,
      totalContracts: 0,
      totalServices: 0,
      error: 'Error loading dashboard data'
    });
  }
};

exports.showUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.render('superadmin/manage-users', {
      title: 'Manage Users',
      currentPage: 'users',
      users
    });
  } catch (error) {
    console.error('Users error:', error);
    req.session.error = 'Error loading users';
    res.redirect('/superadmin/dashboard');
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    if (!username || !email || !password || !role) {
      req.session.error = 'All fields are required';
      return res.redirect('/superadmin/users');
    }
    
    if (password.length < 6) {
      req.session.error = 'Password must be at least 6 characters';
      return res.redirect('/superadmin/users');
    }
    
    if (!['ceo', 'admin'].includes(role)) {
      req.session.error = 'Invalid role selected';
      return res.redirect('/superadmin/users');
    }
    
    const existingUser = await User.findOne({ $or: [{ username: username.trim() }, { email: email.trim().toLowerCase() }] });
    if (existingUser) {
      req.session.error = 'Username or email already exists';
      return res.redirect('/superadmin/users');
    }
    
    const user = new User({ 
      username: username.trim(), 
      email: email.trim().toLowerCase(), 
      password, 
      role 
    });
    await user.save();
    
    req.session.success = 'User created successfully';
    res.redirect('/superadmin/users');
  } catch (error) {
    console.error('Create user error:', error);
    req.session.error = 'Error creating user';
    res.redirect('/superadmin/users');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === req.session.user.id) {
      req.session.error = 'Cannot delete your own account';
      return res.redirect('/superadmin/users');
    }
    
    await User.findByIdAndDelete(id);
    req.session.success = 'User deleted successfully';
    res.redirect('/superadmin/users');
  } catch (error) {
    console.error('Delete user error:', error);
    req.session.error = 'Error deleting user';
    res.redirect('/superadmin/users');
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      req.session.error = 'Password must be at least 6 characters';
      return res.redirect('/superadmin/users');
    }
    
    const user = await User.findById(id);
    if (!user) {
      req.session.error = 'User not found';
      return res.redirect('/superadmin/users');
    }
    
    user.password = newPassword;
    await user.save();
    
    req.session.success = `Password reset for ${user.username}`;
    res.redirect('/superadmin/users');
  } catch (error) {
    console.error('Reset password error:', error);
    req.session.error = 'Error resetting password';
    res.redirect('/superadmin/users');
  }
};

