const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  listWorkerReservations,
  updateReservationStatus,
} = require('../controllers/reservationController');

// List reservations relevant to worker (pending or assigned to him)
router.get('/', auth.protect, auth.travailleur, listWorkerReservations);

// Update reservation status (accept / reject / done)
router.patch('/:id', auth.protect, auth.travailleur, updateReservationStatus);

module.exports = router;
