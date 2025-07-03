const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nomProduit: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true
  },
  prix: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  quantiteStock: {
    type: Number,
    required: [true, 'La quantité en stock est requise'],
    min: [0, 'La quantité ne peut pas être négative']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
