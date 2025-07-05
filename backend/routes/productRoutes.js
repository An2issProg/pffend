const express = require('express');
const router = express.Router();
const upload = require('../utils/fileUpload');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

// Middleware to handle file upload and log details
const handleUpload = (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      console.error('File upload error:', err);
      return res.status(400).json({ 
        success: false,
        message: 'File upload failed',
        error: err.message 
      });
    }
    
    if (req.file) {
      console.log('File uploaded successfully:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      });
    } else {
      console.log('No file was uploaded');
    }
    
    next();
  });
};

// Public routes - only get products is public
router.route('/')
  .get(getProducts);

// Protected Admin routes
router.route('/')
  .post(protect, admin, handleUpload, createProduct);

// Single product routes
router.route('/:id')
  .get(protect, getProduct) // Allow any authenticated user to view product details
  .put(protect, admin, handleUpload, updateProduct) // Only admin can update
  .delete(protect, admin, deleteProduct); // Only admin can delete

module.exports = router;
