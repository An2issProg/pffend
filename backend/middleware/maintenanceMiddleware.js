const Setting = require('../models/Setting');

const maintenanceMiddleware = async (req, res, next) => {
  try {
    // Allow access to the superadmin API and auth routes regardless of site status
    if (req.path.startsWith('/api/superadmin') || 
        req.path.startsWith('/api/auth/login') ||
        req.path === '/api/auth/me') {
      return next();
    }

    // Get site status from database
    const settings = await Setting.findOne({ _id: 'site' });
    
    // If settings don't exist, create them with default values
    if (!settings) {
      const newSettings = new Setting({ _id: 'site', active: true });
      await newSettings.save();
      return next();
    }

    // If site is inactive, check if user is superadmin
    if (!settings.active) {
      // Check if user is authenticated and has superadmin role
      if (req.user && req.user.role === 'superadmin') {
        return next();
      }
      
      // For all other cases, return maintenance message
      return res.status(503).json({ 
        message: 'Le site est actuellement en maintenance. Veuillez réessayer plus tard.',
        maintenance: true 
      });
    }

    next();
  } catch (error) {
    console.error('Maintenance check failed:', error);
    // In case of error, allow access to prevent complete site outage
    next();
  }
};

module.exports = maintenanceMiddleware;
