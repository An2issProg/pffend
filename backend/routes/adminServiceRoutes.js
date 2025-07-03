const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { createService, updateService, deleteService } = require('../controllers/adminServiceController');

router.use(protect);
router.use(admin);

router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

module.exports = router;
