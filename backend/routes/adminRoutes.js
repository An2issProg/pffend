const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getAllTravailleurs,
  getTravailleur,
  updateTravailleur,
  deleteTravailleur,
  getDashboardStats
} = require('../controllers/adminController');

// Protect all routes in this router
router.use(protect);
router.use(admin);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);

// Travailleur management routes
router.get('/travailleurs', getAllTravailleurs);
router.get('/travailleurs/:id', getTravailleur);
router.put('/travailleurs/:id', updateTravailleur);
router.delete('/travailleurs/:id', deleteTravailleur);

module.exports = router;
