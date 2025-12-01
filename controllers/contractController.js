const Contract = require('../models/Contract');
const Staff = require('../models/Staff');

exports.showContracts = async (req, res) => {
  try {
    const contracts = await Contract.find()
      .populate('assignedStaff')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    const staff = await Staff.find({ status: 'active' });
    
    res.render('admin/contracts', {
      title: 'Contract Management',
      currentPage: 'contracts',
      contracts,
      staff
    });
  } catch (error) {
    console.error('Contracts error:', error);
    req.session.error = 'Error loading contracts';
    res.redirect('/admin/dashboard');
  }
};

exports.createContract = async (req, res) => {
  try {
    const { clientName, clientPhone, clientAddress, serviceType, description, startDate, endDate, totalFee, assignedStaff } = req.body;
    
    if (!clientName || !clientPhone || !clientAddress || !serviceType || !description || !startDate || !totalFee) {
      req.session.error = 'All required fields must be filled';
      return res.redirect('/admin/contracts');
    }
    
    if (isNaN(totalFee) || totalFee < 0) {
      req.session.error = 'Total fee must be a valid positive number';
      return res.redirect('/admin/contracts');
    }
    
    const contract = new Contract({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientAddress: clientAddress.trim(),
      serviceType,
      description: description.trim(),
      startDate,
      endDate: endDate || undefined,
      totalFee: parseFloat(totalFee),
      assignedStaff: assignedStaff ? (Array.isArray(assignedStaff) ? assignedStaff : [assignedStaff]) : [],
      createdBy: req.session.user.id
    });
    
    await contract.save();
    req.session.success = 'Contract created successfully';
    res.redirect('/admin/contracts');
  } catch (error) {
    console.error('Create contract error:', error);
    req.session.error = 'Error creating contract';
    res.redirect('/admin/contracts');
  }
};

exports.updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, assignedStaff } = req.body;
    
    const updateData = { status, paymentStatus };
    if (assignedStaff) {
      updateData.assignedStaff = Array.isArray(assignedStaff) ? assignedStaff : [assignedStaff];
    }
    
    await Contract.findByIdAndUpdate(id, updateData);
    req.session.success = 'Contract updated successfully';
    res.redirect('/admin/contracts');
  } catch (error) {
    console.error('Update contract error:', error);
    req.session.error = 'Error updating contract';
    res.redirect('/admin/contracts');
  }
};

exports.deleteContract = async (req, res) => {
  try {
    const { id } = req.params;
    await Contract.findByIdAndDelete(id);
    req.session.success = 'Contract deleted successfully';
    res.redirect('/admin/contracts');
  } catch (error) {
    console.error('Delete contract error:', error);
    req.session.error = 'Error deleting contract';
    res.redirect('/admin/contracts');
  }
};

