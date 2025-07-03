const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getAllClients,
  getClient,
  updateClient,
  deleteClient
} = require('../controllers/clientController');

// All routes are protected and require admin access
router.use(protect, admin);

router.route('/')
  .get(getAllClients);

router.route('/:id')
  .get(getClient)
  .put(updateClient)
  .delete(deleteClient);

module.exports = router;
