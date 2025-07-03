const Setting = require('../models/Setting');

// Ensure singleton doc exists
const ensureSettingDoc = async () => {
  const exists = await Setting.findById('site');
  if (!exists) {
    await Setting.create({ _id: 'site', active: true });
  }
};

exports.getStatus = async (req, res) => {
  try {
    await ensureSettingDoc();
    const setting = await Setting.findById('site');
    res.json({ active: setting.active });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du statut du site', error: error.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    await ensureSettingDoc();
    const setting = await Setting.findById('site');
    setting.active = !setting.active;
    await setting.save();
    res.json({ message: 'Statut du site mis à jour', active: setting.active });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut du site', error: error.message });
  }
};
