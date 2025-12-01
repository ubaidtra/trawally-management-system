const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  clientPhone: {
    type: String,
    required: true,
    trim: true
  },
  clientAddress: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    enum: ['Electrical Installation', 'Water Pump Installation', 'Borehole Drilling', 'Water Tank Installation', 'Home Services', 'Office Installation', 'Other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  assignedStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  totalFee: {
    type: Number,
    required: true,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'unpaid'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Contract', contractSchema);

