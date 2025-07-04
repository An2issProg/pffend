const mongoose = require('mongoose');

// Sub-schema for items in the sale
const itemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, required: true, enum: ['product', 'service'] },
}, { _id: false });

const dailySaleSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  items: [itemSchema], // Use the explicit sub-schema
});

module.exports = mongoose.model('DailySale', dailySaleSchema);
