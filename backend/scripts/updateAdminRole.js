const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const updateAdminRole = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Update existing admin user with admin role
    const result = await User.findOneAndUpdate(
      { email: 'admin@yallaclean.com' },
      { role: 'admin' },
      { new: true }
    );

    if (result) {
      console.log('Admin role updated successfully for:', result.email);
    } else {
      console.log('Admin user not found');
    }
  } catch (error) {
    console.error('Error updating admin role:', error);
  } finally {
    await mongoose.connection.close();
  }
};

updateAdminRole();
