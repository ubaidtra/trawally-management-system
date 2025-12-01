const Staff = require('../models/Staff');
const Contract = require('../models/Contract');
const Service = require('../models/Service');
const Attendance = require('../models/Attendance');

exports.showDashboard = async (req, res) => {
  try {
    const totalStaff = await Staff.countDocuments({ status: 'active' });
    const totalContracts = await Contract.countDocuments();
    const totalServices = await Service.countDocuments();
    const pendingPayments = await Contract.countDocuments({ paymentStatus: 'unpaid' }) + 
                           await Service.countDocuments({ paymentStatus: 'unpaid' });
    
    const recentContracts = await Contract.find()
      .populate('assignedStaff', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const recentServices = await Service.find()
      .populate('assignedStaff', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      currentPage: 'dashboard',
      totalStaff,
      totalContracts,
      totalServices,
      pendingPayments,
      recentContracts,
      recentServices
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.session.error = 'Error loading dashboard';
    res.redirect('/');
  }
};

