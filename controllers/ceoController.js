const Staff = require('../models/Staff');
const Contract = require('../models/Contract');
const Service = require('../models/Service');
const Attendance = require('../models/Attendance');

exports.showDashboard = async (req, res) => {
  try {
    const totalStaff = await Staff.countDocuments();
    const activeContracts = await Contract.countDocuments({ status: { $ne: 'completed' } });
    const pendingPayments = await Contract.countDocuments({ paymentStatus: 'unpaid' }) + 
                           await Service.countDocuments({ paymentStatus: 'unpaid' });
    
    const paidContracts = await Contract.find({ paymentStatus: 'paid' });
    const paidServices = await Service.find({ paymentStatus: 'paid' });
    const monthlyRevenue = paidContracts.reduce((sum, c) => sum + c.totalFee, 0) + 
                          paidServices.reduce((sum, s) => sum + s.totalFee, 0);
    
    const completedContracts = await Contract.countDocuments({ status: 'completed' });
    const inProgressContracts = await Contract.countDocuments({ status: 'in-progress' });
    const pendingContracts = await Contract.countDocuments({ status: 'pending' });
    
    const contractsByType = await Contract.aggregate([
      { $group: { _id: '$serviceType', count: { $sum: 1 }, revenue: { $sum: '$totalFee' } } }
    ]);
    
    const servicesByType = await Service.aggregate([
      { $group: { _id: '$serviceType', count: { $sum: 1 }, revenue: { $sum: '$totalFee' } } }
    ]);
    
    res.render('ceo/dashboard', {
      title: 'CEO Dashboard',
      currentPage: 'dashboard',
      totalStaff,
      activeContracts,
      pendingPayments,
      monthlyRevenue,
      completedContracts,
      inProgressContracts,
      pendingContracts,
      contractsByType,
      servicesByType
    });
  } catch (error) {
    console.error('CEO Dashboard error:', error);
    req.session.error = 'Error loading dashboard';
    res.redirect('/');
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

