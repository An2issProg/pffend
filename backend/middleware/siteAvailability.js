const Setting = require('../models/Setting');

// Middleware to block site when inactive (maintenance mode)
// Skips auth and superadmin routes so superadmin can login and toggle
module.exports = async (req, res, next) => {
  const skipPaths = ['/api/auth', '/api/superadmin'];
  if (skipPaths.some((p) => req.path.startsWith(p))) {
    return next();
  }

  try {
    const setting = await Setting.findById('site');
    if (setting && !setting.active) {
      return res.status(503).json({ message: 'Site en maintenance. Merci de revenir plus tard.' });
    }
    return next();
  } catch (error) {
    // If settings collection missing, allow access
    return next();
  }
};
