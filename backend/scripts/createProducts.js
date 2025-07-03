const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const products = [
  {
    nomProduit: 'Détergent Multi-surfaces',
    prix: 15.99,
    quantiteStock: 100
  },
  {
    nomProduit: 'Désinfectant',
    prix: 12.50,
    quantiteStock: 75
  },
  {
    nomProduit: 'Nettoyant Vitres',
    prix: 8.99,
    quantiteStock: 50
  },
  {
    nomProduit: 'Savon Liquide',
    prix: 5.99,
    quantiteStock: 150
  },
  {
    nomProduit: 'Éponges (Pack de 3)',
    prix: 4.99,
    quantiteStock: 200
  }
];

const createProducts = async () => {
  try {
    await connectDB();

    // Delete existing products
    await Product.deleteMany({});
    console.log('Existing products deleted.');

    // Insert new products
    const createdProducts = await Product.create(products);
    console.log('Sample products created:', createdProducts);

    process.exit(0);
  } catch (error) {
    console.error('Error creating products:', error);
    process.exit(1);
  }
};

createProducts();
