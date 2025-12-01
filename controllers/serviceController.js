const Service = require('../models/Service');
const Staff = require('../models/Staff');

exports.showServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate('assignedStaff')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    const staff = await Staff.find({ status: 'active' });
    
    res.render('admin/services', {
      title: 'Service Management',
      currentPage: 'services',
      services,
      staff
    });
  } catch (error) {
    console.error('Services error:', error);
    req.session.error = 'Error loading services';
    res.redirect('/admin/dashboard');
  }
};

exports.createService = async (req, res) => {
  try {
    const { clientName, clientPhone, clientAddress, serviceType, description, serviceDate, totalFee, assignedStaff } = req.body;
    
    if (!clientName || !clientPhone || !clientAddress || !serviceType || !description || !serviceDate || !totalFee) {
      req.session.error = 'All required fields must be filled';
      return res.redirect('/admin/services');
    }
    
    if (isNaN(totalFee) || totalFee < 0) {
      req.session.error = 'Total fee must be a valid positive number';
      return res.redirect('/admin/services');
    }
    
    const service = new Service({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientAddress: clientAddress.trim(),
      serviceType,
      description: description.trim(),
      serviceDate,
      totalFee: parseFloat(totalFee),
      assignedStaff: assignedStaff ? (Array.isArray(assignedStaff) ? assignedStaff : [assignedStaff]) : [],
      createdBy: req.session.user.id
    });
    
    await service.save();
    req.session.success = 'Service created successfully';
    res.redirect('/admin/services');
  } catch (error) {
    console.error('Create service error:', error);
    req.session.error = 'Error creating service';
    res.redirect('/admin/services');
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, assignedStaff } = req.body;
    
    const updateData = { status, paymentStatus };
    if (assignedStaff) {
      updateData.assignedStaff = Array.isArray(assignedStaff) ? assignedStaff : [assignedStaff];
    }
    
    await Service.findByIdAndUpdate(id, updateData);
    req.session.success = 'Service updated successfully';
    res.redirect('/admin/services');
  } catch (error) {
    console.error('Update service error:', error);
    req.session.error = 'Error updating service';
    res.redirect('/admin/services');
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await Service.findByIdAndDelete(id);
    req.session.success = 'Service deleted successfully';
    res.redirect('/admin/services');
  } catch (error) {
    console.error('Delete service error:', error);
    req.session.error = 'Error deleting service';
    res.redirect('/admin/services');
  }
};

