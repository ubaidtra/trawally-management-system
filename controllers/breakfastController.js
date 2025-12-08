const Breakfast = require('../models/Breakfast');
const Staff = require('../models/Staff');

exports.showBreakfast = async (req, res) => {
  try {
    const { date } = req.query;
    const selectedDate = date ? new Date(date) : new Date();
    selectedDate.setHours(0, 0, 0, 0);
    
    const staff = await Staff.find({ status: 'active' }).sort({ name: 1 }).catch(() => []);
    
    const breakfastRecords = await Breakfast.find({ date: selectedDate })
      .populate('staff', 'name specialization')
      .populate('recordedBy', 'username')
      .catch(() => []);
    
    const breakfastMap = {};
    breakfastRecords.forEach(record => {
      breakfastMap[record.staff._id.toString()] = record;
    });
    
    res.render('admin/breakfast', {
      title: 'Breakfast Management',
      currentPage: 'breakfast',
      staff: staff || [],
      breakfastRecords: breakfastMap || {},
      selectedDate: selectedDate.toISOString().split('T')[0],
      totalAmount: breakfastRecords.reduce((sum, r) => sum + (r.amount || 0), 0)
    });
  } catch (error) {
    console.error('Breakfast error:', error);
    res.render('admin/breakfast', {
      title: 'Breakfast Management',
      currentPage: 'breakfast',
      staff: [],
      breakfastRecords: {},
      selectedDate: new Date().toISOString().split('T')[0],
      totalAmount: 0,
      error: 'Error loading breakfast data'
    });
  }
};

exports.recordBreakfast = async (req, res) => {
  try {
    const { date, breakfast } = req.body;
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    for (const staffId in breakfast) {
      const { amount, notes } = breakfast[staffId];
      
      if (amount && parseFloat(amount) > 0) {
        await Breakfast.findOneAndUpdate(
          { staff: staffId, date: selectedDate },
          {
            staff: staffId,
            date: selectedDate,
            amount: parseFloat(amount),
            notes: notes ? notes.trim() : '',
            recordedBy: req.session.user.id
          },
          { upsert: true, new: true }
        );
      } else {
        await Breakfast.findOneAndDelete({ staff: staffId, date: selectedDate });
      }
    }
    
    req.session.success = 'Breakfast records saved successfully';
    res.redirect(`/admin/breakfast?date=${date}`);
  } catch (error) {
    console.error('Record breakfast error:', error);
    req.session.error = 'Error recording breakfast';
    res.redirect('/admin/breakfast');
  }
};

exports.deleteBreakfast = async (req, res) => {
  try {
    const { id } = req.params;
    
    await Breakfast.findByIdAndDelete(id);
    req.session.success = 'Breakfast record deleted successfully';
    res.redirect('back');
  } catch (error) {
    console.error('Delete breakfast error:', error);
    req.session.error = 'Error deleting breakfast record';
    res.redirect('back');
  }
};

