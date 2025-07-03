const express = require('express');
const router = express.Router();
const { protect, superadmin } = require('../middleware/auth');
const { getStatus, toggleStatus } = require('../controllers/siteController');

// Protect all routes
router.use(protect);
router.use(superadmin);

router.get('/site-status', getStatus);
router.post('/site-status/toggle', toggleStatus);

module.exports = router;
