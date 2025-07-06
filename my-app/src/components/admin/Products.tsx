'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import axios, { AxiosError } from 'axios';
import { FiEdit, FiTrash2, FiCheck, FiX, FiImage, FiPlusCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface Product {
  _id: string;
  nomProduit: string;
  prix: number;
  quantiteStock: number;
  image?: string;
}

interface ProductFormData {
  nomProduit: string;
  prix: number | string;
  quantiteStock: number | string;
  image?: string;
}

interface ApiErrorResponse {
  message?: string;
  error?: string | { message: string };
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<ProductFormData>({ 
    nomProduit: '', 
    prix: '', 
    quantiteStock: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingImageFile, setEditingImageFile] = useState<File | null>(null);
  const [editingImagePreview, setEditingImagePreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Handle edit button click
  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      nomProduit: product.nomProduit,
      prix: product.prix.toString(),
      quantiteStock: product.quantiteStock.toString(),
    });
    setEditingImagePreview(product.image || null);
    setIsEditing(true);
  };

  // Handle update product
  const handleUpdateProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const formData = new FormData();
      formData.append('nomProduit', newProduct.nomProduit);
      formData.append('prix', newProduct.prix.toString());
      formData.append('quantiteStock', newProduct.quantiteStock.toString());
      
      if (editingImageFile) {
        formData.append('image', editingImageFile);
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        return;
      }

      const response = await axios.put(
        `http://localhost:5001/api/admin/products/${editingProduct._id}`, 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Update the products list
      setProducts(products.map(p => 
        p._id === response.data._id ? response.data : p
      ));
      
      // Reset form
      setEditingProduct(null);
      setNewProduct({ nomProduit: '', prix: '', quantiteStock: '' });
      setEditingImageFile(null);
      setEditingImagePreview(null);
      setIsEditing(false);
      
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Failed to update product. Please try again.');
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingProduct(null);
    setNewProduct({ nomProduit: '', prix: '', quantiteStock: '' });
    setEditingImageFile(null);
    setEditingImagePreview(null);
    setIsEditing(false);
  };

  // Handle image change for new product
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image change for editing product
  const handleEditImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditingImageFile(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }
      const response = await axios.get('http://localhost:5001/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setProducts(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Client-side validation
    if (!newProduct.nomProduit?.trim()) {
      setError('Product name is required');
      return;
    }
    
    const price = parseFloat(newProduct.prix as string);
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price');
      return;
    }
    
    const quantity = parseInt(newProduct.quantiteStock as string, 10);
    if (isNaN(quantity) || quantity < 0) {
      setError('Please enter a valid quantity');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        return;
      }
      
      const formData = new FormData();
      
      // Add text fields
      formData.append('nomProduit', newProduct.nomProduit.trim());
      formData.append('prix', price.toString());
      formData.append('quantiteStock', quantity.toString());
      
      // Add image file if exists
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      // Log the form data being sent
      const formDataObj: Record<string, any> = {};
      formData.forEach((value, key) => {
        formDataObj[key] = value instanceof File ? `${key} (File)` : value;
      });
      console.log('Sending form data:', formDataObj);
      
      // Send the request
      const response = await axios.post('http://localhost:5001/api/admin/products', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      
      console.log('Product created:', response.data);
      
      // Reset form
      setNewProduct({ 
        nomProduit: '', 
        prix: '', 
        quantiteStock: '' 
      });
      setImageFile(null);
      setImagePreview(null);
      
      // Refresh the products list
      fetchProducts();
    } catch (err: any) {
      console.error('Error creating product:', err);
      const errorResponse = err.response?.data as ApiErrorResponse | undefined;
      const errorMessage = errorResponse?.message || 
                         (typeof errorResponse?.error === 'string' ? errorResponse.error : errorResponse?.error?.message) || 
                         'Failed to create product. Please try again.';
      setError(errorMessage);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!editingProduct) return;
    
    // Extract and validate data
    const { _id, nomProduit, prix, quantiteStock } = editingProduct;
    
    if (!nomProduit?.trim()) {
      setError('Product name is required');
      return;
    }
    
    const price = Number(prix);
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price');
      return;
    }
    
    const quantity = Number(quantiteStock);
    if (isNaN(quantity) || quantity < 0) {
      setError('Please enter a valid quantity');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        return;
      }
      
      const formData = new FormData();
      
      // Add text fields
      formData.append('nomProduit', nomProduit.trim());
      formData.append('prix', price.toString());
      formData.append('quantiteStock', quantity.toString());
      
      // Add image file if exists
      if (editingImageFile) {
        formData.append('image', editingImageFile);
      }
      
      // Log the form data being sent
      const formDataObj: Record<string, any> = {};
      formData.forEach((value, key) => {
        formDataObj[key] = value instanceof File ? `${key} (File)` : value;
      });
      console.log('Updating product with data:', formDataObj);
      
      // Send the request
      const response = await axios.put(
        `http://localhost:5001/api/admin/products/${_id}`, 
        formData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );
      
      console.log('Product updated:', response.data);
      
      // Reset form and refresh data
      setEditingProduct(null);
      setEditingImageFile(null);
      setEditingImagePreview(null);
      fetchProducts();
    } catch (err: any) {
      console.error('Error updating product:', err);
      const errorResponse = err.response?.data as ApiErrorResponse | undefined;
      const errorMessage = errorResponse?.message || 
                         (typeof errorResponse?.error === 'string' ? errorResponse.error : errorResponse?.error?.message) || 
                         err.message ||
                         'Failed to update product. Please try again.';
      setError(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        return;
      }
      
      await axios.delete(`http://localhost:5001/api/admin/products/${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      fetchProducts();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      const errorResponse = err.response?.data as ApiErrorResponse | undefined;
      const errorMessage = errorResponse?.message || 
                         (typeof errorResponse?.error === 'string' ? errorResponse.error : errorResponse?.error?.message) || 
                         err.message ||
                         'Failed to delete product. Please try again.';
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Product Management
        </h1>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 p-8 bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-white">Add New Product</h2>
        <form onSubmit={isEditing ? handleUpdateProduct : handleCreate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-base font-medium text-gray-300">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newProduct.nomProduit}
                onChange={(e) => setNewProduct({ ...newProduct, nomProduit: e.target.value })}
                className="w-full px-5 py-3 text-lg bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter product name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-base font-medium text-gray-300">
                Price (DT) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newProduct.prix}
                  onChange={(e) => setNewProduct({ ...newProduct, prix: e.target.value })}
                  className="w-full pl-10 pr-5 py-3 text-lg bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="0.00"
                  required
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">DT</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-base font-medium text-gray-300">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={newProduct.quantiteStock}
                onChange={(e) => setNewProduct({ ...newProduct, quantiteStock: e.target.value })}
                className="w-full px-5 py-3 text-lg bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter quantity"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-base font-medium text-gray-300">
                Product Image
              </label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 bg-gray-900/50 p-6 text-center hover:border-purple-500 transition-colors">
                <FiImage className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-400">
                  Drag and drop your image here, or click to select
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, JPEG up to 5MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                
                {imageFile && (
                  <div className="mt-4 flex items-center gap-3 bg-gray-800/50 rounded-lg p-3">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                      <FiImage className="text-gray-400" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">
                        {imageFile.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(imageFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImageFile(null)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                )}
              </label>
            </div>
          </div>
          <div className="md:col-span-3 pt-2">
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                {isEditing ? 'Update Product' : 'Add Product'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="overflow-hidden bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg"
      >
        {products.length === 0 ? (
          <div className="text-center py-12">
            <FiImage className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-200">No products</h3>
            <p className="mt-1 text-gray-400">Get started by adding a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-black/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-700">
                          {product.image ? (
                            <img 
                              src={`http://localhost:5001${product.image.startsWith('/uploads/') ? product.image : `/uploads/${product.image}`}`} 
                              alt={product.nomProduit}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = 'https://via.placeholder.com/100';
                              }}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <FiImage className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{product.nomProduit}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{product.prix.toFixed(2)} DT</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.quantiteStock > 10 
                          ? 'bg-green-100 text-green-800' 
                          : product.quantiteStock > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {product.quantiteStock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        {editingProduct?._id === product._id ? (
                          <>
                            <button 
                              onClick={handleUpdate} 
                              className="text-green-500 hover:text-green-400 transition-colors p-1.5 rounded-full hover:bg-green-500/10"
                              title="Save changes"
                            >
                              <FiCheck size={18} />
                            </button>
                            <button 
                              onClick={() => setEditingProduct(null)} 
                              className="text-gray-400 hover:text-gray-300 transition-colors p-1.5 rounded-full hover:bg-gray-500/10"
                              title="Cancel"
                            >
                              <FiX size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleEditClick(product)}
                              className="text-blue-500 hover:text-blue-400 transition-colors p-1.5 rounded-full hover:bg-blue-500/10 mr-2"
                              title="Edit product"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(product._id)} 
                              className="text-red-500 hover:text-red-400 transition-colors p-1.5 rounded-full hover:bg-red-500/10"
                              title="Delete product"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div> 
    </div>
  );
};

export default Products;