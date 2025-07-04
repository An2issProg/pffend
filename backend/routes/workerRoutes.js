const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { closeDay } = require('../controllers/workerController');

// Close day and record sales
router.post('/close-day', auth.protect, auth.travailleur, closeDay);

module.exports = router;
