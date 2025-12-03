const Deployment = require('../models/Deployment');
const Contract = require('../models/Contract');
const Service = require('../models/Service');
const Staff = require('../models/Staff');

const getRedirectUrl = (hasContractId) => hasContractId ? '/admin/contracts' : '/admin/services';

exports.showDeployments = async (req, res) => {
  try {
    const { contractId, serviceId } = req.query;
    const query = {};
    
    if (contractId) {
      query.contract = contractId;
    } else if (serviceId) {
      query.service = serviceId;
    }
    
    const deployments = await Deployment.find(query)
      .populate('staff', 'name specialization phone')
      .populate('deployedBy', 'username')
      .populate('contract', 'clientName serviceType')
      .populate('service', 'clientName serviceType')
      .sort({ deploymentDate: -1 });
    
    res.json(deployments);
  } catch (error) {
    console.error('Show deployments error:', error);
    res.status(500).json({ error: 'Error loading deployments' });
  }
};

exports.createDeployment = async (req, res) => {
  try {
    const { contractId, serviceId, staffId, deploymentDate, transportationMethod, transportationCost, notes } = req.body;
    
    const hasContractId = contractId && contractId.trim() !== '';
    const hasServiceId = serviceId && serviceId.trim() !== '';
    
    if (!transportationMethod) {
      req.session.error = 'Transportation method is required';
      return req.session.save(() => res.redirect(getRedirectUrl(hasContractId)));
    }
    
    if (!staffId || (Array.isArray(staffId) && staffId.length === 0) || (typeof staffId === 'string' && staffId.trim() === '')) {
      req.session.error = 'Please select at least one staff member';
      return req.session.save(() => res.redirect(getRedirectUrl(hasContractId)));
    }
    
    if ((!hasContractId && !hasServiceId) || (hasContractId && hasServiceId)) {
      req.session.error = 'Either contract or service must be specified (but not both)';
      return req.session.save(() => res.redirect(getRedirectUrl(hasContractId)));
    }
    
    const staffIds = Array.isArray(staffId) ? staffId.filter(id => id && id.trim() !== '') : [staffId].filter(id => id && id.trim() !== '');
    
    if (staffIds.length === 0) {
      req.session.error = 'At least one staff member must be selected';
      return req.session.save(() => res.redirect(getRedirectUrl(hasContractId)));
    }
    
    const staffMembers = await Staff.find({ _id: { $in: staffIds }, status: 'active' }).catch(() => []);
    
    if (staffMembers.length !== staffIds.length) {
      const missingCount = staffIds.length - staffMembers.length;
      req.session.error = `${missingCount} selected staff member${missingCount > 1 ? 's are' : ' is'} not available or inactive`;
      return req.session.save(() => res.redirect(getRedirectUrl(hasContractId)));
    }
    
    const finalContractId = hasContractId ? contractId.trim() : null;
    const finalServiceId = hasServiceId ? serviceId.trim() : null;
    
    const query = finalContractId 
      ? { contract: finalContractId, staff: { $in: staffIds }, status: { $ne: 'cancelled' } }
      : { service: finalServiceId, staff: { $in: staffIds }, status: { $ne: 'cancelled' } };
    
    const existingDeployments = await Deployment.find(query).populate('staff', 'name').catch(() => []);
    
    if (existingDeployments.length > 0) {
      const duplicateStaff = existingDeployments.map(d => d.staff && d.staff.name ? d.staff.name : 'Unknown').join(', ');
      req.session.error = `Some staff are already deployed: ${duplicateStaff}. Please remove existing deployments first.`;
      return req.session.save(() => res.redirect(getRedirectUrl(hasContractId)));
    }
    
    const contract = finalContractId ? await Contract.findById(finalContractId).catch(() => null) : null;
    const service = finalServiceId ? await Service.findById(finalServiceId).catch(() => null) : null;
    
    if (finalContractId && !contract) {
      req.session.error = 'Contract not found';
      return req.session.save(() => res.redirect('/admin/contracts'));
    }
    
    if (finalServiceId && !service) {
      req.session.error = 'Service not found';
      return req.session.save(() => res.redirect('/admin/services'));
    }
    
    const deploymentDateValue = deploymentDate ? new Date(deploymentDate) : new Date();
    const deployments = staffIds.map(sId => ({
      contract: finalContractId,
      service: finalServiceId,
      staff: sId,
      deploymentDate: deploymentDateValue,
      transportationMethod,
      transportationCost: parseFloat(transportationCost) || 0,
      notes: notes ? notes.trim() : '',
      deployedBy: req.session.user.id
    }));
    
    await Deployment.insertMany(deployments).catch((err) => {
      console.error('Deployment insert error:', err);
      throw new Error('Failed to create deployments: ' + err.message);
    });
    
    if (contract && contract.status === 'pending') {
      contract.status = 'in-progress';
      await contract.save().catch(err => console.error('Contract status update error:', err));
    }
    
    if (service && service.status === 'pending') {
      service.status = 'in-progress';
      await service.save().catch(err => console.error('Service status update error:', err));
    }
    
    const staffCount = staffIds.length;
    req.session.success = `${staffCount} staff member${staffCount > 1 ? 's' : ''} deployed successfully`;
    req.session.save(() => res.redirect(getRedirectUrl(hasContractId)));
  } catch (error) {
    console.error('Create deployment error:', error);
    req.session.error = 'Error deploying staff: ' + (error.message || 'Unknown error');
    const hasContractId = req.body.contractId && req.body.contractId.trim() !== '';
    req.session.save(() => res.redirect(getRedirectUrl(hasContractId)));
  }
};

exports.updateDeployment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transportationMethod, transportationCost, notes } = req.body;
    
    const deployment = await Deployment.findById(id);
    if (!deployment) {
      req.session.error = 'Deployment not found';
      return req.session.save(() => res.redirect('/admin/contracts'));
    }
    
    const updateData = {};
    if (status) updateData.status = status;
    if (transportationMethod) updateData.transportationMethod = transportationMethod;
    if (transportationCost !== undefined) updateData.transportationCost = parseFloat(transportationCost) || 0;
    if (notes !== undefined) updateData.notes = notes.trim();
    
    await Deployment.findByIdAndUpdate(id, updateData, { new: true });
    
    const redirectUrl = deployment.contract ? '/admin/contracts' : '/admin/services';
    req.session.success = 'Deployment updated successfully';
    req.session.save(() => res.redirect(redirectUrl));
  } catch (error) {
    console.error('Update deployment error:', error);
    req.session.error = 'Error updating deployment';
    req.session.save(() => res.redirect('/admin/contracts'));
  }
};

exports.deleteDeployment = async (req, res) => {
  try {
    const { id } = req.params;
    const deployment = await Deployment.findById(id);
    if (!deployment) {
      if (req.headers['content-type']?.includes('application/json')) {
        return res.status(404).json({ success: false, error: 'Deployment not found' });
      }
      req.session.error = 'Deployment not found';
      return req.session.save(() => res.redirect('/admin/contracts'));
    }
    
    const redirectUrl = deployment.contract ? '/admin/contracts' : '/admin/services';
    await Deployment.findByIdAndDelete(id);
    
    if (req.headers['content-type']?.includes('application/json')) {
      return res.json({ success: true, message: 'Deployment removed successfully' });
    }
    
    req.session.success = 'Deployment removed successfully';
    req.session.save(() => res.redirect(redirectUrl));
  } catch (error) {
    console.error('Delete deployment error:', error);
    if (req.headers['content-type']?.includes('application/json')) {
      return res.status(500).json({ success: false, error: 'Error removing deployment' });
    }
    req.session.error = 'Error removing deployment';
    req.session.save(() => res.redirect('/admin/contracts'));
  }
};

