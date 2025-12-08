const Staff = require('../models/Staff');
const Contract = require('../models/Contract');
const Service = require('../models/Service');
const Attendance = require('../models/Attendance');

exports.showDashboard = async (req, res) => {
  try {
    const totalStaff = await Staff.countDocuments().catch(() => 0);
    const activeContracts = await Contract.countDocuments({ status: { $ne: 'completed' } }).catch(() => 0);
    const pendingPayments = (await Contract.countDocuments({ paymentStatus: 'unpaid' }).catch(() => 0)) + 
                           (await Service.countDocuments({ paymentStatus: 'unpaid' }).catch(() => 0));
    
    const paidContracts = await Contract.find({ paymentStatus: 'paid' }).catch(() => []);
    const paidServices = await Service.find({ paymentStatus: 'paid' }).catch(() => []);
    const monthlyRevenue = (paidContracts || []).reduce((sum, c) => sum + (c.totalFee || 0), 0) + 
                          (paidServices || []).reduce((sum, s) => sum + (s.totalFee || 0), 0);
    
    const completedContracts = await Contract.countDocuments({ status: 'completed' }).catch(() => 0);
    const inProgressContracts = await Contract.countDocuments({ status: 'in-progress' }).catch(() => 0);
    const pendingContracts = await Contract.countDocuments({ status: 'pending' }).catch(() => 0);
    const cancelledContracts = await Contract.countDocuments({ status: 'cancelled' }).catch(() => 0);
    
    const contractsByType = await Contract.aggregate([
      { $group: { _id: '$serviceType', count: { $sum: 1 }, revenue: { $sum: '$totalFee' } } }
    ]).catch(() => []);
    
    const servicesByType = await Service.aggregate([
      { $group: { _id: '$serviceType', count: { $sum: 1 }, revenue: { $sum: '$totalFee' } } }
    ]).catch(() => []);
    
    res.render('ceo/dashboard', {
      title: 'CEO Dashboard',
      currentPage: 'dashboard',
      totalStaff: totalStaff || 0,
      activeContracts: activeContracts || 0,
      pendingPayments: pendingPayments || 0,
      monthlyRevenue: monthlyRevenue || 0,
      completedContracts: completedContracts || 0,
      inProgressContracts: inProgressContracts || 0,
      pendingContracts: pendingContracts || 0,
      cancelledContracts: cancelledContracts || 0,
      contractsByType: contractsByType || [],
      servicesByType: servicesByType || []
    });
  } catch (error) {
    console.error('CEO Dashboard error:', error);
    res.render('ceo/dashboard', {
      title: 'CEO Dashboard',
      currentPage: 'dashboard',
      totalStaff: 0,
      activeContracts: 0,
      pendingPayments: 0,
      monthlyRevenue: 0,
      completedContracts: 0,
      inProgressContracts: 0,
      pendingContracts: 0,
      cancelledContracts: 0,
      contractsByType: [],
      servicesByType: [],
      error: 'Error loading dashboard data'
    });
  }
};

exports.showReports = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;
    
    let reportData = {};
    
    if (reportType === 'attendance') {
      const query = {};
      if (startDate && endDate) {
        query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
      
      const attendance = await Attendance.find(query)
        .populate('staff', 'name specialization')
        .sort({ date: -1 });
      
      reportData.attendance = attendance;
    } else if (reportType === 'financial') {
      const query = {};
      if (startDate && endDate) {
        query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
      
      const contracts = await Contract.find(query);
      const services = await Service.find(query);
      
      const totalRevenue = contracts.reduce((sum, c) => sum + (c.paymentStatus === 'paid' ? c.totalFee : 0), 0) +
                          services.reduce((sum, s) => sum + (s.paymentStatus === 'paid' ? s.totalFee : 0), 0);
      
      const pendingRevenue = contracts.reduce((sum, c) => sum + (c.paymentStatus === 'unpaid' ? c.totalFee : 0), 0) +
                            services.reduce((sum, s) => sum + (s.paymentStatus === 'unpaid' ? s.totalFee : 0), 0);
      
      reportData.financial = {
        contracts,
        services,
        totalRevenue,
        pendingRevenue
      };
    } else if (reportType === 'deployment') {
      const contracts = await Contract.find()
        .populate('assignedStaff', 'name specialization')
        .sort({ createdAt: -1 });
      
      const services = await Service.find()
        .populate('assignedStaff', 'name specialization')
        .sort({ createdAt: -1 });
      
      reportData.deployment = { contracts, services };
    }
    
    res.render('ceo/reports', {
      title: 'Reports',
      currentPage: 'reports',
      reportType: reportType || 'attendance',
      startDate: startDate || '',
      endDate: endDate || '',
      reportData
    });
  } catch (error) {
    console.error('Reports error:', error);
    req.session.error = 'Error loading reports';
    res.redirect('/ceo/dashboard');
  }
};

