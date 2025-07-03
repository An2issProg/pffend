const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    category: { type: String, required: true }, // e.g. nettoyage
    subcategory: { type: String, required: true }, // e.g. homme
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
