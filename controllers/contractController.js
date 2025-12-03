const Contract = require('../models/Contract');
const Staff = require('../models/Staff');
const Deployment = require('../models/Deployment');

exports.showContracts = async (req, res) => {
  try {
    const contracts = await Contract.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .catch(() => []);
    
    const contractsWithDeployments = await Promise.all(
      (contracts || []).map(async (contract) => {
        const deployments = await Deployment.find({ contract: contract._id })
          .populate('staff', 'name specialization')
          .catch(() => []);
        return {
          ...contract.toObject(),
          deployments: deployments || []
        };
      })
    );
    
    const staff = await Staff.find({ status: 'active' }).catch(() => []);
    
    res.render('admin/contracts', {
      title: 'Contract Management',
      currentPage: 'contracts',
      contracts: contractsWithDeployments || [],
      staff: staff || []
    });
  } catch (error) {
    console.error('Contracts error:', error);
    res.render('admin/contracts', {
      title: 'Contract Management',
      currentPage: 'contracts',
      contracts: [],
      staff: [],
      error: 'Error loading contracts data'
    });
  }
};

exports.createContract = async (req, res) => {
  try {
    const { clientName, clientPhone, clientAddress, serviceType, description, startDate, endDate, totalFee } = req.body;
    
    if (!clientName || !clientPhone || !clientAddress || !serviceType || !description || !startDate || !totalFee) {
      req.session.error = 'All required fields must be filled';
      return req.session.save(() => res.redirect('/admin/contracts'));
    }
    
    if (isNaN(totalFee) || totalFee < 0) {
      req.session.error = 'Total fee must be a valid positive number';
      return req.session.save(() => res.redirect('/admin/contracts'));
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
      createdBy: req.session.user.id
    });
    
    await contract.save();
    req.session.success = 'Contract created successfully. You can now deploy staff.';
    req.session.save(() => res.redirect('/admin/contracts'));
  } catch (error) {
    console.error('Create contract error:', error);
    req.session.error = 'Error creating contract';
    req.session.save(() => res.redirect('/admin/contracts'));
  }
};

exports.updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    
    await Contract.findByIdAndUpdate(id, { status, paymentStatus });
    req.session.success = 'Contract updated successfully';
    req.session.save(() => res.redirect('/admin/contracts'));
  } catch (error) {
    console.error('Update contract error:', error);
    req.session.error = 'Error updating contract';
    req.session.save(() => res.redirect('/admin/contracts'));
  }
};

exports.deleteContract = async (req, res) => {
  try {
    const { id } = req.params;
    await Deployment.deleteMany({ contract: id });
    await Contract.findByIdAndDelete(id);
    req.session.success = 'Contract deleted successfully';
    req.session.save(() => res.redirect('/admin/contracts'));
  } catch (error) {
    console.error('Delete contract error:', error);
    req.session.error = 'Error deleting contract';
    req.session.save(() => res.redirect('/admin/contracts'));
  }
};

