const DailySale = require('../models/DailySale');

// @desc    Get all daily sales
// @route   GET /api/admin/sales
// @access  Private/Admin
exports.getAllDailySales = async (req, res) => {
  try {
    const sales = await DailySale.find({})
      .populate('worker', 'name') // Populate worker's name
      .sort({ date: -1 }); // Sort by most recent
    res.json(sales);
  } catch (error) {
    console.error('Error fetching daily sales:', error);
    res.status(500).json({ message: 'Server error while fetching daily sales', error: error.message });
  }
};
