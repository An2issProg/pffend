const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    datetime: { type: Date, required: true },
    services: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'done', 'canceled'],
      default: 'pending',
    },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);
