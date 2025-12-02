const User = require('../models/User');
const Staff = require('../models/Staff');
const Contract = require('../models/Contract');
const Service = require('../models/Service');

exports.showDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStaff = await Staff.countDocuments();
    const totalContracts = await Contract.countDocuments();
    const totalServices = await Service.countDocuments();
    
    res.render('superadmin/dashboard', {
      title: 'Super Admin Dashboard',
      currentPage: 'dashboard',
      totalUsers,
      totalStaff,
      totalContracts,
      totalServices
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.session.error = 'Error loading dashboard';
    res.redirect('/');
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

