const express = require('express');
const router = express.Router();
const { register, login, getMe, createTravailleur, createInitialAdmin } = require('../controllers/authController');
const { protect, admin, client, travailleur } = require('../middleware/auth');

// Public routes
router.post('/register', register); // Client registration only
router.post('/login', login);
router.post('/create-initial-admin', createInitialAdmin); // Only works if no admin exists

// Protected routes
router.get('/me', protect, getMe);

// Admin routes
router.post('/create-travailleur', protect, admin, createTravailleur);

// Role-specific routes (for future use)
router.get('/admin/dashboard', protect, admin, (req, res) => {
  res.json({ message: 'Admin dashboard access granted' });
});

router.get('/client/dashboard', protect, client, (req, res) => {
  res.json({ message: 'Client dashboard access granted' });
});

router.get('/travailleur/dashboard', protect, travailleur, (req, res) => {
  res.json({ message: 'Travailleur dashboard access granted' });
});

module.exports = router;
