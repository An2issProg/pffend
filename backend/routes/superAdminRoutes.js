const express = require('express');
const router = express.Router();
const { protect, superAdmin } = require('../middleware/authMiddleware');
const { getSiteStatus, toggleSiteStatus } = require('../controllers/superadminController');

// Protect all routes in this file with protect and superAdmin middleware
router.use(protect, superAdmin);

router.get('/site-status', getSiteStatus);
router.post('/site-status/toggle', toggleSiteStatus);

module.exports = router;
