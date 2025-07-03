const express = require('express');
const router = express.Router();
const { protect, client } = require('../middleware/auth');
const { listClientReservations, cancelReservation } = require('../controllers/reservationController');

router.get('/', protect, client, listClientReservations);

router.patch('/:id/cancel', protect, client, cancelReservation);

module.exports = router;
