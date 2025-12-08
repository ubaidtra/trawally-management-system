const Staff = require('../models/Staff');
const Contract = require('../models/Contract');
const Service = require('../models/Service');
const Attendance = require('../models/Attendance');
const Breakfast = require('../models/Breakfast');
const Deployment = require('../models/Deployment');
const invoiceController = require('./invoiceController');

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
      
      const totalPresent = attendance.filter(a => a.status === 'present').length;
      const totalAbsent = attendance.filter(a => a.status === 'absent').length;
      const totalLeave = attendance.filter(a => a.status === 'leave').length;
      
      reportData.attendance = attendance;
      reportData.attendanceStats = { totalPresent, totalAbsent, totalLeave };
    } else if (reportType === 'financial') {
      const query = {};
      if (startDate && endDate) {
        query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
      
      const contracts = await Contract.find(query).sort({ createdAt: -1 });
      const services = await Service.find(query).sort({ createdAt: -1 });
      
      const totalRevenue = contracts.reduce((sum, c) => sum + (c.paymentStatus === 'paid' ? c.totalFee : 0), 0) +
                          services.reduce((sum, s) => sum + (s.paymentStatus === 'paid' ? s.totalFee : 0), 0);
      
      const pendingRevenue = contracts.reduce((sum, c) => sum + (c.paymentStatus === 'unpaid' ? c.totalFee : 0), 0) +
                            services.reduce((sum, s) => sum + (s.paymentStatus === 'unpaid' ? s.totalFee : 0), 0);
      
      reportData.financial = {
        contracts,
        services,
        totalRevenue,
        pendingRevenue,
        totalContracts: contracts.length,
        totalServices: services.length
      };
    } else if (reportType === 'deployment') {
      const query = {};
      if (startDate && endDate) {
        query.deploymentDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
      
      const deployments = await Deployment.find(query)
        .populate('staff', 'name specialization')
        .populate('contract', 'clientName serviceType')
        .populate('service', 'clientName serviceType')
        .sort({ deploymentDate: -1 });
      
      const totalTransportCost = deployments.reduce((sum, d) => sum + (d.transportationCost || 0), 0);
      const deploymentsByMethod = {
        'public-transport': deployments.filter(d => d.transportationMethod === 'public-transport').length,
        'personal-vehicle': deployments.filter(d => d.transportationMethod === 'personal-vehicle').length,
        'company-vehicle': deployments.filter(d => d.transportationMethod === 'company-vehicle').length
      };
      
      reportData.deployment = { 
        deployments, 
        totalTransportCost,
        deploymentsByMethod,
        totalDeployments: deployments.length
      };
    } else if (reportType === 'breakfast') {
      const query = {};
      if (startDate && endDate) {
        query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
      
      const breakfastRecords = await Breakfast.find(query)
        .populate('staff', 'name specialization')
        .populate('recordedBy', 'username')
        .sort({ date: -1 });
      
      const totalBreakfastCost = breakfastRecords.reduce((sum, b) => sum + (b.amount || 0), 0);
      const averagePerStaff = breakfastRecords.length > 0 ? totalBreakfastCost / breakfastRecords.length : 0;
      
      reportData.breakfast = { 
        breakfastRecords, 
        totalBreakfastCost,
        averagePerStaff,
        totalRecords: breakfastRecords.length
      };
    } else if (reportType === 'staff') {
      const staff = await Staff.find().sort({ name: 1 });
      
      const activeStaff = staff.filter(s => s.status === 'active').length;
      const inactiveStaff = staff.filter(s => s.status === 'inactive').length;
      
      const staffBySpecialization = {
        electrical: staff.filter(s => s.specialization === 'electrical').length,
        plumbing: staff.filter(s => s.specialization === 'plumbing').length,
        both: staff.filter(s => s.specialization === 'both').length
      };
      
      reportData.staff = { 
        staff, 
        activeStaff,
        inactiveStaff,
        staffBySpecialization,
        totalStaff: staff.length
      };
    } else if (reportType === 'expenses') {
      const query = {};
      if (startDate && endDate) {
        query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
      
      const deployQuery = {};
      if (startDate && endDate) {
        deployQuery.deploymentDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
      
      const breakfastRecords = await Breakfast.find(query).populate('staff', 'name');
      const deployments = await Deployment.find(deployQuery).populate('staff', 'name');
      
      const totalBreakfast = breakfastRecords.reduce((sum, b) => sum + (b.amount || 0), 0);
      const totalTransport = deployments.reduce((sum, d) => sum + (d.transportationCost || 0), 0);
      const totalExpenses = totalBreakfast + totalTransport;
      
      reportData.expenses = {
        breakfastRecords,
        deployments,
        totalBreakfast,
        totalTransport,
        totalExpenses
      };
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

exports.showContracts = async (req, res) => {
  try {
    const contracts = await Contract.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .catch(() => []);
    
    const contractsWithDeployments = await Promise.all(
      (contracts || []).map(async (contract) => {
        const deployments = await Deployment.find({ contract: contract._id })
          .populate('staff', 'name specialization phone')
          .populate('deployedBy', 'username')
          .catch(() => []);
        return {
          ...contract.toObject(),
          deployments: deployments || []
        };
      })
    );
    
    res.render('ceo/contracts', {
      title: 'Contracts Review',
      currentPage: 'contracts',
      contracts: contractsWithDeployments || []
    });
  } catch (error) {
    console.error('CEO Contracts error:', error);
    res.render('ceo/contracts', {
      title: 'Contracts Review',
      currentPage: 'contracts',
      contracts: [],
      error: 'Error loading contracts data'
    });
  }
};

exports.showContractDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findById(id)
      .populate('createdBy', 'username')
      .catch(() => null);
    
    if (!contract) {
      req.session.error = 'Contract not found';
      return req.session.save(() => res.redirect('/ceo/contracts'));
    }
    
    const deployments = await Deployment.find({ contract: id })
      .populate('staff', 'name specialization phone email')
      .populate('deployedBy', 'username')
      .sort({ deploymentDate: -1 })
      .catch(() => []);
    
    res.render('ceo/contract-details', {
      title: 'Contract Details',
      currentPage: 'contracts',
      contract,
      deployments: deployments || []
    });
  } catch (error) {
    console.error('CEO Contract details error:', error);
    req.session.error = 'Error loading contract details';
    res.redirect('/ceo/contracts');
  }
};

exports.showServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .catch(() => []);
    
    const servicesWithDeployments = await Promise.all(
      (services || []).map(async (service) => {
        const deployments = await Deployment.find({ service: service._id })
          .populate('staff', 'name specialization phone')
          .populate('deployedBy', 'username')
          .catch(() => []);
        return {
          ...service.toObject(),
          deployments: deployments || []
        };
      })
    );
    
    res.render('ceo/services', {
      title: 'Services Review',
      currentPage: 'services',
      services: servicesWithDeployments || []
    });
  } catch (error) {
    console.error('CEO Services error:', error);
    res.render('ceo/services', {
      title: 'Services Review',
      currentPage: 'services',
      services: [],
      error: 'Error loading services data'
    });
  }
};

exports.showServiceDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id)
      .populate('createdBy', 'username')
      .catch(() => null);
    
    if (!service) {
      req.session.error = 'Service not found';
      return req.session.save(() => res.redirect('/ceo/services'));
    }
    
    const deployments = await Deployment.find({ service: id })
      .populate('staff', 'name specialization phone email')
      .populate('deployedBy', 'username')
      .sort({ deploymentDate: -1 })
      .catch(() => []);
    
    res.render('ceo/service-details', {
      title: 'Service Details',
      currentPage: 'services',
      service,
      deployments: deployments || []
    });
  } catch (error) {
    console.error('CEO Service details error:', error);
    req.session.error = 'Error loading service details';
    res.redirect('/ceo/services');
  }
};

