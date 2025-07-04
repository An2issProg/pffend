const DailySale = require('../models/DailySale');

// @desc    Close the day and save the sales
// @route   POST /api/worker/close-day
// @access  Private/Travailleur
exports.closeDay = async (req, res) => {
  console.log('--- Close Day Request Received ---');
  console.log('User:', req.user);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  try {
    const { cart, total } = req.body;
            const workerId = req.user._id; // from auth middleware

    console.log(`Attempting to save sale for worker: ${workerId}`);

    if (!cart || total === undefined) {
      return res.status(400).json({ message: 'Cart data and total are required' });
    }

    const newDailySale = new DailySale({
      worker: workerId,
      total,
      items: cart,
    });

    await newDailySale.save();

    res.status(201).json({ message: 'Day closed successfully', sale: newDailySale });
  } catch (error) {
    console.error('Error closing day:', error);
    res.status(500).json({ message: 'Server error while closing day', error: error.message });
  }
};
