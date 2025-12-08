const Service = require('../models/Service');
const Staff = require('../models/Staff');
const Deployment = require('../models/Deployment');

exports.showServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .catch(() => []);
    
    const servicesWithDeployments = await Promise.all(
      (services || []).map(async (service) => {
        const deployments = await Deployment.find({ service: service._id })
          .populate('staff', 'name specialization')
          .catch(() => []);
        return {
          ...service.toObject(),
          deployments: deployments || []
        };
      })
    );
    
    const staff = await Staff.find({ status: 'active' }).catch(() => []);
    
    res.render('admin/services', {
      title: 'Service Management',
      currentPage: 'services',
      services: servicesWithDeployments || [],
      staff: staff || []
    });
  } catch (error) {
    console.error('Services error:', error);
    res.render('admin/services', {
      title: 'Service Management',
      currentPage: 'services',
      services: [],
      staff: [],
      error: 'Error loading services data'
    });
  }
};

exports.createService = async (req, res) => {
  try {
    const { clientName, clientPhone, clientAddress, serviceType, description, serviceDate, totalFee } = req.body;
    
    if (!clientName || !clientPhone || !clientAddress || !serviceType || !description || !serviceDate || !totalFee) {
      req.session.error = 'All required fields must be filled';
      return req.session.save(() => res.redirect('/admin/services'));
    }
    
    if (isNaN(totalFee) || parseFloat(totalFee) < 0) {
      req.session.error = 'Total fee must be a valid number';
      return req.session.save(() => res.redirect('/admin/services'));
    }
    
    const service = new Service({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientAddress: clientAddress.trim(),
      serviceType,
      description: description.trim(),
      serviceDate: new Date(serviceDate),
      totalFee: parseFloat(totalFee),
      createdBy: req.session.user.id
    });
    
    await service.save();
    req.session.success = 'Service created successfully. You can now deploy staff.';
    req.session.save(() => res.redirect('/admin/services'));
  } catch (error) {
    console.error('Create service error:', error);
    req.session.error = 'Error creating service';
    req.session.save(() => res.redirect('/admin/services'));
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    
    await Service.findByIdAndUpdate(id, { status, paymentStatus });
    req.session.success = 'Service updated successfully';
    req.session.save(() => res.redirect('/admin/services'));
  } catch (error) {
    console.error('Update service error:', error);
    req.session.error = 'Error updating service';
    req.session.save(() => res.redirect('/admin/services'));
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    
    if (!id) {
      req.session.error = 'Service ID is required';
      return req.session.save(() => res.redirect('/admin/services'));
    }
    
    if (!paymentStatus || !['paid', 'unpaid'].includes(paymentStatus)) {
      req.session.error = 'Invalid payment status';
      return req.session.save(() => res.redirect('/admin/services'));
    }
    
    const service = await Service.findById(id);
    if (!service) {
      req.session.error = 'Service not found';
      return req.session.save(() => res.redirect('/admin/services'));
    }
    
    await Service.findByIdAndUpdate(id, { paymentStatus }, { new: true, runValidators: true });
    req.session.success = `Payment status updated to ${paymentStatus}`;
    req.session.save(() => res.redirect('/admin/services'));
  } catch (error) {
    console.error('Update payment status error:', error);
    req.session.error = 'Error updating payment status: ' + (error.message || 'Unknown error');
    req.session.save(() => res.redirect('/admin/services'));
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!id) {
      req.session.error = 'Service ID is required';
      return req.session.save(() => res.redirect('/admin/services'));
    }
    
    if (!status || !['pending', 'in-progress', 'completed', 'cancelled', 'archived'].includes(status)) {
      req.session.error = 'Invalid status';
      return req.session.save(() => res.redirect('/admin/services'));
    }
    
    const service = await Service.findById(id);
    if (!service) {
      req.session.error = 'Service not found';
      return req.session.save(() => res.redirect('/admin/services'));
    }
    
    const updateData = { status };
    if (status === 'completed' && !service.completedDate) {
      updateData.completedDate = new Date();
    }
    if (status === 'archived' && !service.archivedDate) {
      updateData.archivedDate = new Date();
    }
    
    await Service.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    req.session.success = `Service status updated to ${status}`;
    req.session.save(() => res.redirect('/admin/services'));
  } catch (error) {
    console.error('Update status error:', error);
    req.session.error = 'Error updating status: ' + (error.message || 'Unknown error');
    req.session.save(() => res.redirect('/admin/services'));
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      req.session.error = 'Service ID is required';
      return req.session.save(() => res.redirect('/admin/services'));
    }
    
    const service = await Service.findById(id);
    if (!service) {
      req.session.error = 'Service not found';
      return req.session.save(() => res.redirect('/admin/services'));
    }
    
    await Deployment.deleteMany({ service: id });
    await Service.findByIdAndDelete(id);
    req.session.success = 'Service deleted successfully';
    req.session.save(() => res.redirect('/admin/services'));
  } catch (error) {
    console.error('Delete service error:', error);
    req.session.error = 'Error deleting service: ' + (error.message || 'Unknown error');
    req.session.save(() => res.redirect('/admin/services'));
  }
};

