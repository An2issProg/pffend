const User = require('../models/User');

// @desc    Get all clients
// @route   GET /api/admin/clients
// @access  Private/Admin
exports.getAllClients = async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des clients', error: error.message });
  }
};

// @desc    Get single client
// @route   GET /api/admin/clients/:id
// @access  Private/Admin
exports.getClient = async (req, res) => {
  try {
    const client = await User.findOne({ _id: req.params.id, role: 'client' })
      .select('-password');
    
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du client', error: error.message });
  }
};

// @desc    Update client
// @route   PUT /api/admin/clients/:id
// @access  Private/Admin
exports.updateClient = async (req, res) => {
  try {
    const { name, email } = req.body;
    const client = await User.findOne({ _id: req.params.id, role: 'client' });
    
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== client.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (emailExists) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }

    client.name = name || client.name;
    client.email = email || client.email;
    
    await client.save();
    
    res.json({
      message: 'Client mis à jour avec succès',
      client: {
        id: client._id,
        name: client.name,
        email: client.email,
        role: client.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du client', error: error.message });
  }
};

// @desc    Delete client
// @route   DELETE /api/admin/clients/:id
// @access  Private/Admin
exports.deleteClient = async (req, res) => {
  try {
    const client = await User.findOne({ _id: req.params.id, role: 'client' });
    
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    await client.deleteOne();
    res.json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du client', error: error.message });
  }
};
