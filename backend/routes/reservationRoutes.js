const express = require('express');
const router = express.Router();
const { createReservation } = require('../controllers/reservationController');
const auth = require('../middleware/auth');

// Clients must be authenticated
router.post('/', auth.protect, auth.client, createReservation);

module.exports = router;
