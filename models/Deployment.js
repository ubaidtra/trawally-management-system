const mongoose = require('mongoose');

const deploymentSchema = new mongoose.Schema({
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    default: null
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    default: null
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  deploymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  transportationMethod: {
    type: String,
    enum: ['public-transport', 'personal-vehicle', 'company-vehicle'],
    required: true,
    default: 'public-transport'
  },
  transportationCost: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['deployed', 'completed', 'cancelled'],
    default: 'deployed'
  },
  notes: {
    type: String,
    trim: true
  },
  deployedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

deploymentSchema.index({ contract: 1 });
deploymentSchema.index({ service: 1 });
deploymentSchema.index({ staff: 1 });

deploymentSchema.pre('validate', function(next) {
  if (!this.contract && !this.service) {
    return next(new Error('Either contract or service must be specified'));
  }
  if (this.contract && this.service) {
    return next(new Error('Cannot specify both contract and service'));
  }
  next();
});

module.exports = mongoose.model('Deployment', deploymentSchema);

