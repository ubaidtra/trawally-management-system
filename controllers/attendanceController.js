const Attendance = require('../models/Attendance');
const Staff = require('../models/Staff');

exports.showAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    const selectedDate = date ? new Date(date) : new Date();
    selectedDate.setHours(0, 0, 0, 0);
    
    const staff = await Staff.find({ status: 'active' }).catch(() => []);
    const attendance = await Attendance.find({
      date: {
        $gte: selectedDate,
        $lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('staff').catch(() => []);
    
    const attendanceMap = {};
    (attendance || []).forEach(att => {
      if (att.staff && att.staff._id) {
        attendanceMap[att.staff._id.toString()] = att;
      }
    });
    
    res.render('admin/attendance', {
      title: 'Attendance Management',
      currentPage: 'attendance',
      staff: staff || [],
      attendanceMap: attendanceMap || {},
      selectedDate: selectedDate.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Attendance error:', error);
    const selectedDate = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    res.render('admin/attendance', {
      title: 'Attendance Management',
      currentPage: 'attendance',
      staff: [],
      attendanceMap: {},
      selectedDate: selectedDate.toISOString().split('T')[0],
      error: 'Error loading attendance data'
    });
  }
};

exports.recordAttendance = async (req, res) => {
  try {
    const { date, attendance } = req.body;
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    for (const staffId in attendance) {
      const { status, timeIn, timeOut, notes } = attendance[staffId];
      
      await Attendance.findOneAndUpdate(
        { staff: staffId, date: selectedDate },
        {
          staff: staffId,
          date: selectedDate,
          status,
          timeIn,
          timeOut,
          notes,
          recordedBy: req.session.user.id
        },
        { upsert: true, new: true }
      );
    }
    
    req.session.success = 'Attendance recorded successfully';
    res.redirect(`/admin/attendance?date=${date}`);
  } catch (error) {
    console.error('Record attendance error:', error);
    req.session.error = 'Error recording attendance';
    res.redirect('/admin/attendance');
  }
};

