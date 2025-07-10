const Setting = require('../models/Setting');

// @desc    Get site status
// @route   GET /api/superadmin/site-status
// @access  Private (SuperAdmin)
const getSiteStatus = async (req, res) => {
  try {
    let settings = await Setting.findOne({ _id: 'site' });
    
    // If settings don't exist, create them with default values
    if (!settings) {
      settings = new Setting({ _id: 'site', active: true });
      await settings.save();
    }
    
    res.json({ active: settings.active });
  } catch (error) {
    console.error('Error getting site status:', error);
    res.status(500).json({ message: 'Erreur du serveur lors de la récupération du statut.' });
  }
};

// @desc    Toggle site status
// @route   POST /api/superadmin/site-status/toggle
// @access  Private (SuperAdmin)
const toggleSiteStatus = async (req, res) => {
  try {
    let settings = await Setting.findOne({ _id: 'site' });
    
    // If settings don't exist, create them
    if (!settings) {
      settings = new Setting({ _id: 'site', active: false });
    } else {
      settings.active = !settings.active;
    }
    
    await settings.save();

    res.json({ 
      message: `Site ${settings.active ? 'activé' : 'désactivé'} avec succès.`,
      active: settings.active 
    });
  } catch (error) {
    console.error('Error toggling site status:', error);
    res.status(500).json({ message: 'Erreur du serveur lors de la mise à jour du statut.' });
  }
};

module.exports = {
  getSiteStatus,
  toggleSiteStatus,
};
