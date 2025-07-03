'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit, FiTrash2, FiUserPlus, FiSearch, FiX, FiPhone, FiMail, FiUser, FiCheck } from 'react-icons/fi';

interface Client {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/admin/clients', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      const data = await response.json();
      setClients(data);
    } catch (err) {
      setError('Failed to load clients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({ name: client.name, email: client.email, phone: client.phone || '' });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingClient
        ? `http://localhost:5001/api/admin/clients/${editingClient._id}`
        : 'http://localhost:5001/api/admin/clients';

      const method = editingClient ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save client');
      }

      setShowModal(false);
      fetchClients();
    } catch (err) {
      console.error(err);
      setError('Failed to save client');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/admin/clients/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      setDeletingClientId(null);
      fetchClients();
    } catch (err) {
      console.error(err);
      setError('Failed to delete client');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-2xl text-gray-400">Loading Clients...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-2xl text-red-500 bg-red-900/20">Error: {error}</div>;
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div 
      className="p-4 sm:p-6 lg:p-8 text-white"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        Gestion des Clients
      </motion.h1>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/20 backdrop-blur-sm border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-lg shadow-lg transition-all transform hover:scale-105"
        >
          <FiUserPlus />
          Ajouter un Client
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-black/20 backdrop-blur-lg rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-gray-300 uppercase tracking-wider">Nom</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-300 uppercase tracking-wider">Email</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-300 uppercase tracking-wider">Téléphone</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-300 uppercase tracking-wider">Date d'ajout</th>
                <th className="py-3 px-4 text-right font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <AnimatePresence>
                {filteredClients.map((client) => (
                  <motion.tr 
                    key={client._id} 
                    className="hover:bg-white/10 transition-colors"
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <td className="py-4 px-4 whitespace-nowrap">{client.name}</td>
                    <td className="py-4 px-4 whitespace-nowrap text-gray-400">{client.email}</td>
                    <td className="py-4 px-4 whitespace-nowrap text-gray-400">{client.phone || 'N/A'}</td>
                    <td className="py-4 px-4 whitespace-nowrap text-gray-400">{new Date(client.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      {deletingClientId === client._id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleDelete(client._id)} className="text-green-400 hover:text-green-300"><FiCheck size={20} /></button>
                          <button onClick={() => setDeletingClientId(null)} className="text-red-400 hover:text-red-300"><FiX size={20} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-4">
                          <button onClick={() => handleEdit(client)} className="text-blue-400 hover:text-blue-300"><FiEdit size={18} /></button>
                          <button onClick={() => setDeletingClientId(client._id)} className="text-red-400 hover:text-red-300"><FiTrash2 size={18} /></button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-black/30 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl w-full max-w-md m-4"
            >
              <form onSubmit={handleSubmit} className="p-8">
                <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                  {editingClient ? 'Modifier le Client' : 'Ajouter un Client'}
                </h3>
                
                <div className="space-y-6">
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text" placeholder="Nom" name="name" value={formData.name} required
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email" placeholder="Email" name="email" value={formData.email} required
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel" placeholder="Téléphone (Optionnel)" name="phone" value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg transition-colors">
                    Annuler
                  </button>
                  <button type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-lg shadow-lg transition-all">
                    {editingClient ? 'Mettre à jour' : 'Ajouter'}
                  </button>
                </div>
              </form>
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                <FiX size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Clients;
