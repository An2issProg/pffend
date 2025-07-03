'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit, FiTrash2, FiPlus, FiCheck, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface Product {
  _id: string;
  nomProduit: string;
  prix: number;
  quantiteStock: number;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({ nomProduit: '', prix: 0, quantiteStock: 0 });

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/admin/products', newProduct, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewProduct({ nomProduit: '', prix: 0, quantiteStock: 0 });
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating product');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/admin/products/${editingProduct._id}`, editingProduct, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingProduct(null);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error deleting product');
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Loading Products...</div>;
  if (error) return <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">{error}</div>;

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8">Product Management</h1>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 p-6 bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg"
      >
        <h2 className="text-xl font-bold mb-4 text-white">Add New Product</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label htmlFor="nomProduit" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              id="nomProduit"
              type="text"
              value={newProduct.nomProduit}
              onChange={(e) => setNewProduct({ ...newProduct, nomProduit: e.target.value })}
              className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white"
              placeholder="e.g., Hand Soap"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="prix" className="block text-sm font-medium text-gray-300 mb-1">Price (DT)</label>
            <input
              id="prix"
              type="number"
              value={newProduct.prix}
              onChange={(e) => setNewProduct({ ...newProduct, prix: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white"
              placeholder="e.g., 12.5"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="quantiteStock" className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
            <input
              id="quantiteStock"
              type="number"
              value={newProduct.quantiteStock}
              onChange={(e) => setNewProduct({ ...newProduct, quantiteStock: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white"
              placeholder="e.g., 100"
              required
              min="0"
            />
          </div>
          <div className="md:col-span-1">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <FiPlus /> Add
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="overflow-x-auto bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg"
      >
        <table className="min-w-full divide-y divide-white/10">
          <thead className="text-gray-300 text-sm uppercase text-left">
            <tr>
              <th className="px-6 py-4">Product Name</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Quantity</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-gray-200">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-black/40 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingProduct?._id === product._id ? (
                    <input
                      type="text"
                      value={editingProduct.nomProduit}
                      onChange={(e) => setEditingProduct({ ...editingProduct, nomProduit: e.target.value })}
                      className="bg-black/50 border border-white/30 p-1 rounded-md w-full text-white"
                    />
                  ) : (
                    product.nomProduit
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingProduct?._id === product._id ? (
                    <input
                      type="number"
                      value={editingProduct.prix}
                      onChange={(e) => setEditingProduct({ ...editingProduct, prix: Number(e.target.value) })}
                      className="bg-black/50 border border-white/30 p-1 rounded-md w-full text-white"
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    `${product.prix.toFixed(2)} DT`
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingProduct?._id === product._id ? (
                    <input
                      type="number"
                      value={editingProduct.quantiteStock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, quantiteStock: Number(e.target.value) })}
                      className="bg-black/50 border border-white/30 p-1 rounded-md w-full text-white"
                      min="0"
                    />
                  ) : (
                    product.quantiteStock
                  )}
                </td>
                <td className="px-6 py-4 flex gap-3 items-center whitespace-nowrap">
                  {editingProduct?._id === product._id ? (
                    <>
                      <button onClick={handleUpdate} className="text-green-400 hover:text-green-300 transition-colors"><FiCheck size={18} /></button>
                      <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-300 transition-colors"><FiX size={18} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingProduct(product)} className="text-blue-400 hover:text-blue-300 transition-colors"><FiEdit size={16} /></button>
                      <button onClick={() => handleDelete(product._id)} className="text-red-400 hover:text-red-300 transition-colors"><FiTrash2 size={16} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default Products;