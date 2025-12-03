const Staff = require('../models/Staff');
const Contract = require('../models/Contract');
const Service = require('../models/Service');
const Attendance = require('../models/Attendance');

exports.showDashboard = async (req, res) => {
  try {
    const totalStaff = await Staff.countDocuments({ status: 'active' }).catch(() => 0);
    const totalContracts = await Contract.countDocuments().catch(() => 0);
    const totalServices = await Service.countDocuments().catch(() => 0);
    const pendingPayments = (await Contract.countDocuments({ paymentStatus: 'unpaid' }).catch(() => 0)) + 
                           (await Service.countDocuments({ paymentStatus: 'unpaid' }).catch(() => 0));
    
    const recentContracts = await Contract.find()
      .populate('assignedStaff', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .catch(() => []);
    
    const recentServices = await Service.find()
      .populate('assignedStaff', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .catch(() => []);
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      currentPage: 'dashboard',
      totalStaff: totalStaff || 0,
      totalContracts: totalContracts || 0,
      totalServices: totalServices || 0,
      pendingPayments: pendingPayments || 0,
      recentContracts: recentContracts || [],
      recentServices: recentServices || []
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      currentPage: 'dashboard',
      totalStaff: 0,
      totalContracts: 0,
      totalServices: 0,
      pendingPayments: 0,
      recentContracts: [],
      recentServices: [],
      error: 'Error loading dashboard data'
    });
  }
};

