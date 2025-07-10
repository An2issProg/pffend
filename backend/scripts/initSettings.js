const mongoose = require('mongoose');
const Setting = require('../models/Setting');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../.env' });

const initSettings = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected...');

    // Check if settings exist
    let settings = await Setting.findOne({ _id: 'site' });
    
    if (!settings) {
      // Create default settings
      settings = new Setting({
        _id: 'site',
        active: true
      });
      
      await settings.save();
      console.log('Default settings created successfully');
    } else {
      console.log('Settings already exist');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing settings:', error);
    process.exit(1);
  }
};

// Run the initialization
initSettings();
