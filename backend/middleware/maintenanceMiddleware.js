const fs = require('fs').promises;
const path = require('path');

const statusFilePath = path.join(__dirname, '..', 'config', 'status.json');

const maintenanceMiddleware = async (req, res, next) => {
  try {
    // Allow access to the superadmin API regardless of site status
    if (req.path.startsWith('/api/superadmin')) {
      return next();
    }

    const statusData = await fs.readFile(statusFilePath, 'utf-8');
    const status = JSON.parse(statusData);

    if (!status.active) {
      // If site is inactive, return 503 Service Unavailable
      return res.status(503).json({ 
        message: 'Le site est actuellement en maintenance. Veuillez réessayer plus tard.',
        maintenance: true 
      });
    }

    next();
  } catch (error) {
    // If status file is missing or corrupt, assume site is active but log error
    console.error('Maintenance check failed:', error);
    next();
  }
};

module.exports = maintenanceMiddleware;
