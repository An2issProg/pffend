const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: 'site',
  },
  active: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Setting', settingSchema);
