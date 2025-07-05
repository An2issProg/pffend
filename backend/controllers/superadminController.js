const fs = require('fs').promises;
const path = require('path');

const statusFilePath = path.join(__dirname, '..', 'config', 'status.json');

// @desc    Get site status
// @route   GET /api/superadmin/site-status
// @access  Private (SuperAdmin)
const getSiteStatus = async (req, res) => {
  try {
    const statusData = await fs.readFile(statusFilePath, 'utf-8');
    const status = JSON.parse(statusData);
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur lors de la récupération du statut.' });
  }
};

// @desc    Toggle site status
// @route   POST /api/superadmin/site-status/toggle
// @access  Private (SuperAdmin)
const toggleSiteStatus = async (req, res) => {
  try {
    const statusData = await fs.readFile(statusFilePath, 'utf-8');
    const status = JSON.parse(statusData);

    status.active = !status.active;

    await fs.writeFile(statusFilePath, JSON.stringify(status, null, 2));

    res.json({ 
      message: `Site ${status.active ? 'activé' : 'désactivé'} avec succès.`,
      active: status.active 
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur lors de la mise à jour du statut.' });
  }
};

module.exports = {
  getSiteStatus,
  toggleSiteStatus,
};
