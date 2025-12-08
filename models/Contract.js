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
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled', 'archived'],
    default: 'pending'
  },
  completedDate: {
    type: Date
  },
  archivedDate: {
    type: Date
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

contractSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedDate) {
      this.completedDate = new Date();
    }
    if (this.status === 'archived' && !this.archivedDate) {
      this.archivedDate = new Date();
    }
  }
  next();
});

module.exports = mongoose.model('Contract', contractSchema);

