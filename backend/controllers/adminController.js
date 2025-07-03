const User = require('../models/User');

// @desc    Get all travailleurs
// @route   GET /api/admin/travailleurs
// @access  Private/Admin
exports.getAllTravailleurs = async (req, res) => {
  try {
    const travailleurs = await User.find({ role: 'travailleur' }).select('-password');
    res.json({ travailleurs });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des travailleurs', error: error.message });
  }
};

// @desc    Get single travailleur
// @route   GET /api/admin/travailleurs/:id
// @access  Private/Admin
exports.getTravailleur = async (req, res) => {
  try {
    const travailleur = await User.findOne({
      _id: req.params.id,
      role: 'travailleur'
    }).select('-password');

    if (!travailleur) {
      return res.status(404).json({ message: 'Travailleur non trouvé' });
    }

    res.json({ travailleur });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du travailleur', error: error.message });
  }
};

// @desc    Update travailleur
// @route   PUT /api/admin/travailleurs/:id
// @access  Private/Admin
exports.updateTravailleur = async (req, res) => {
  try {
    const { name, email } = req.body;
    const travailleur = await User.findOne({
      _id: req.params.id,
      role: 'travailleur'
    });

    if (!travailleur) {
      return res.status(404).json({ message: 'Travailleur non trouvé' });
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== travailleur.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }

    travailleur.name = name || travailleur.name;
    travailleur.email = email || travailleur.email;

    const updatedTravailleur = await travailleur.save();
    res.json({
      message: 'Travailleur mis à jour avec succès',
      travailleur: {
        id: updatedTravailleur._id,
        name: updatedTravailleur.name,
        email: updatedTravailleur.email,
        role: updatedTravailleur.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du travailleur', error: error.message });
  }
};

// @desc    Delete travailleur
// @route   DELETE /api/admin/travailleurs/:id
// @access  Private/Admin
exports.deleteTravailleur = async (req, res) => {
  try {
    const travailleur = await User.findOne({
      _id: req.params.id,
      role: 'travailleur'
    });

    if (!travailleur) {
      return res.status(404).json({ message: 'Travailleur non trouvé' });
    }

    await travailleur.deleteOne();
    res.json({ message: 'Travailleur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du travailleur', error: error.message });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = {
      travailleursCount: await User.countDocuments({ role: 'travailleur' }),
      clientsCount: await User.countDocuments({ role: 'client' }),
      recentTravailleurs: await User.find({ role: 'travailleur' })
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(5)
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};
