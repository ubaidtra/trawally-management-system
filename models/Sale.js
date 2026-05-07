const mongoose = require('mongoose');

const saleLineSchema = new mongoose.Schema({
  inventoryItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true
  },
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  itemType: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  lineTotal: { type: Number, required: true, min: 0 }
}, { _id: false });

const saleSchema = new mongoose.Schema({
  lines: {
    type: [saleLineSchema],
    validate: [v => Array.isArray(v) && v.length > 0, 'Sale must have at least one line']
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  buyerName: {
    type: String,
    trim: true,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
