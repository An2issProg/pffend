const express = require('express');
const router = express.Router();

const { getProducts } = require('../controllers/productController');

// Public catalogue – no auth required
router.get('/products', getProducts);

module.exports = router;
