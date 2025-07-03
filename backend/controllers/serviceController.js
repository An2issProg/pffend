const Service = require('../models/Service');

// GET /api/services?category=nettoyage
exports.getServices = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const services = await Service.find(query).lean();
    res.json({ services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load services' });
  }
};
