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

// POST /api/admin/services
exports.createService = async (req, res) => {
  try {
    const { category, subcategory, name, price } = req.body;
    const service = await Service.create({ category, subcategory, name, price });
    res.status(201).json(service);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to create service' });
  }
};

// PUT /api/admin/services/:id
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { subcategory, name, price } = req.body;
    const service = await Service.findByIdAndUpdate(id, { subcategory, name, price }, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to update service' });
  }
};

// DELETE /api/admin/services/:id
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete service' });
  }
};
