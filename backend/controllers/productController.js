const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Private/Admin
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des produits', error: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/admin/products/:id
// @access  Private/Admin
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du produit', error: error.message });
  }
};

// @desc    Create product
// @route   POST /api/admin/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    console.log('=== CREATE PRODUCT REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Uploaded file:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filename: req.file.filename,
      path: req.file.path
    } : 'No file uploaded');
    
    // Extract and validate fields
    const { nomProduit, prix, quantiteStock } = req.body;
    
    // Validate required fields
    const missingFields = [];
    if (!nomProduit) missingFields.push('nomProduit');
    if (prix === undefined) missingFields.push('prix');
    if (quantiteStock === undefined) missingFields.push('quantiteStock');
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields',
        missingFields,
        receivedData: { nomProduit, prix, quantiteStock }
      });
    }
    
    // Parse and validate numbers
    const parsedPrix = parseFloat(prix);
    const parsedQuantite = parseInt(quantiteStock, 10);
    
    if (isNaN(parsedPrix) || parsedPrix < 0) {
      console.error('Invalid price:', prix);
      return res.status(400).json({
        success: false,
        message: 'Invalid price',
        received: prix
      });
    }
    
    if (isNaN(parsedQuantite) || parsedQuantite < 0) {
      console.error('Invalid quantity:', quantiteStock);
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity',
        received: quantiteStock
      });
    }
    
    // Prepare product data
    const productData = {
      nomProduit: nomProduit.toString().trim(),
      prix: parsedPrix,
      quantiteStock: parsedQuantite,
      image: req.file ? `/uploads/${req.file.filename}` : '/images/default-product.svg'
    };

    console.log('Creating product with data:', productData);
    
    try {
      const product = await Product.create(productData);
      console.log('Product created successfully:', product);
      return res.status(201).json({
        success: true,
        product
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw dbError; // This will be caught by the outer catch block
    }
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Delete the uploaded file if it exists and there was an error
    if (req.file) {
      const filePath = path.join(__dirname, '../public', req.file.path);
      if (fs.existsSync(filePath)) {
        console.log('Deleting uploaded file due to error:', filePath);
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      }
    }
    
    res.status(400).json({ 
      success: false,
      message: 'Error creating product',
      error: error.message,
      errorDetails: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    console.log('=== UPDATE PRODUCT REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filename: req.file.filename,
      path: req.file.path
    } : 'No file uploaded');
    
    // Get fields from form data
    const { nomProduit, prix, quantiteStock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      console.log('Product not found:', req.params.id);
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate required fields
    const missingFields = [];
    if (!nomProduit) missingFields.push('nomProduit');
    if (prix === undefined) missingFields.push('prix');
    if (quantiteStock === undefined) missingFields.push('quantiteStock');
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields',
        missingFields,
        receivedData: { nomProduit, prix, quantiteStock }
      });
    }
    
    // Parse and validate numbers
    const parsedPrix = parseFloat(prix);
    const parsedQuantite = parseInt(quantiteStock, 10);
    
    if (isNaN(parsedPrix) || parsedPrix < 0) {
      console.error('Invalid price:', prix);
      return res.status(400).json({
        success: false,
        message: 'Invalid price',
        received: prix
      });
    }
    
    if (isNaN(parsedQuantite) || parsedQuantite < 0) {
      console.error('Invalid quantity:', quantiteStock);
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity',
        received: quantiteStock
      });
    }

    // Store old image path to delete if a new one is uploaded
    let oldImagePath = '';
    if (req.file) {
      oldImagePath = path.join(__dirname, '../public', product.image);
    }

    // Update product data with parsed values
    product.nomProduit = nomProduit.trim();
    product.prix = parsedPrix;
    product.quantiteStock = parsedQuantite;
    
    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    }

    console.log('Updating product with data:', {
      nomProduit: product.nomProduit,
      prix: product.prix,
      quantiteStock: product.quantiteStock,
      image: product.image
    });

    const updatedProduct = await product.save();
    console.log('Product updated successfully:', updatedProduct);
    
    // Delete old image if a new one was uploaded and it's not the default image
    if (req.file && oldImagePath && !oldImagePath.includes('default-product.svg')) {
      if (fs.existsSync(oldImagePath)) {
        console.log('Deleting old image:', oldImagePath);
        fs.unlinkSync(oldImagePath);
      }
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    
    // Delete the uploaded file if update fails
    if (req.file) {
      const filePath = path.join(__dirname, '../public/uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        console.log('Deleting uploaded file due to error:', filePath);
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      }
    }
    
    // Provide more detailed error information
    let errorMessage = 'Error updating product';
    let errorDetails = {};
    
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation Error';
      errorDetails = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid ID format';
      errorDetails = { path: error.path, value: error.value };
    }
    
    res.status(400).json({ 
      success: false,
      message: errorMessage,
      error: error.message,
      details: errorDetails,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Delete the associated image if it's not the default one
    if (product.image && !product.image.includes('default-product.svg')) {
      const imagePath = path.join(__dirname, '../public', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await product.deleteOne();
    res.json({ message: 'Produit supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du produit', error: error.message });
  }
};
