const express = require('express');
const router = express.Router();
const { getAllDailySales } = require('../controllers/salesController');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/admin/sales
// @desc    Get all daily sales for the admin dashboard
// @access  Private/Admin
router.get('/', protect, admin, getAllDailySales);

module.exports = router;
