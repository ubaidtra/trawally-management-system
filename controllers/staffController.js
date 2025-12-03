const Staff = require('../models/Staff');

exports.showStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ dateJoined: -1 }).catch(() => []);
    res.render('admin/staff', {
      title: 'Staff Management',
      currentPage: 'staff',
      staff: staff || []
    });
  } catch (error) {
    console.error('Staff error:', error);
    res.render('admin/staff', {
      title: 'Staff Management',
      currentPage: 'staff',
      staff: [],
      error: 'Error loading staff data'
    });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const { name, phone, email, specialization } = req.body;
    
    if (!name || !phone || !specialization) {
      req.session.error = 'Name, phone, and specialization are required';
      return res.redirect('/admin/staff');
    }
    
    if (!['electrical', 'plumbing', 'both'].includes(specialization)) {
      req.session.error = 'Invalid specialization';
      return res.redirect('/admin/staff');
    }
    
    const staff = new Staff({ 
      name: name.trim(), 
      phone: phone.trim(), 
      email: email ? email.trim().toLowerCase() : undefined, 
      specialization 
    });
    await staff.save();
    req.session.success = 'Staff member added successfully';
    res.redirect('/admin/staff');
  } catch (error) {
    console.error('Create staff error:', error);
    req.session.error = 'Error adding staff member';
    res.redirect('/admin/staff');
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, specialization, status } = req.body;
    await Staff.findByIdAndUpdate(id, { name, phone, email, specialization, status });
    req.session.success = 'Staff member updated successfully';
    res.redirect('/admin/staff');
  } catch (error) {
    console.error('Update staff error:', error);
    req.session.error = 'Error updating staff member';
    res.redirect('/admin/staff');
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    await Staff.findByIdAndDelete(id);
    req.session.success = 'Staff member deleted successfully';
    res.redirect('/admin/staff');
  } catch (error) {
    console.error('Delete staff error:', error);
    req.session.error = 'Error deleting staff member';
    res.redirect('/admin/staff');
  }
};

