const Reservation = require('../models/Reservation');

// POST /api/reservations
exports.createReservation = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null; // if auth middleware set
    const { datetime, services } = req.body;

    if (!datetime || !services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ message: 'Invalid data' });
    }

    const reservation = new Reservation({ user: userId, datetime, services });
    await reservation.save();
    res.status(201).json({ reservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create reservation' });
  }
};

// GET /api/client/reservations
exports.cancelReservation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const reservation = await Reservation.findOne({ _id: id, user: userId });
    if (!reservation) return res.status(404).json({ message: 'Not found' });
    if (reservation.status !== 'pending') return res.status(400).json({ message: 'Cannot cancel' });
    reservation.status = 'canceled';
    await reservation.save();
    res.json({ reservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to cancel' });
  }
};

exports.listClientReservations = async (req, res) => {
  try {
    const userId = req.user.id;
    const reservations = await Reservation.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ reservations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load reservations' });
  }
};

// ============================ Travailleur functions ============================
// GET /api/worker/reservations
// List all pending reservations plus those already assignées au travailleur
exports.listWorkerReservations = async (req, res) => {
  try {
    const workerId = req.user.id;
    const reservations = await Reservation.find({
      $or: [
        { status: 'pending' },
        { worker: workerId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.json({ reservations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load reservations' });
  }
};

// PATCH /api/worker/reservations/:id
// Accept, reject or mark reservation as done
exports.updateReservationStatus = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['accepted', 'rejected', 'done'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Status transition rules
    if (status === 'accepted') {
      if (reservation.status !== 'pending') {
        return res.status(400).json({ message: 'Reservation cannot be accepted' });
      }
      reservation.status = 'accepted';
      reservation.worker = workerId;
    } else if (status === 'rejected') {
      if (reservation.status !== 'pending') {
        return res.status(400).json({ message: 'Reservation cannot be rejected' });
      }
      reservation.status = 'rejected';
      reservation.worker = workerId;
    } else if (status === 'done') {
      if (reservation.status !== 'accepted' || !reservation.worker || !reservation.worker.equals(workerId)) {
        return res.status(400).json({ message: 'Only the assigned worker can mark as done' });
      }
      reservation.status = 'done';
    }

    await reservation.save();
    res.json({ reservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update reservation' });
  }
};
