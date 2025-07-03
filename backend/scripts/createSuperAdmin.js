const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connecté à MongoDB');

    const existing = await User.findOne({ role: 'superadmin' });
    if (existing) {
      console.log('Un superadmin existe déjà:', existing.email);
      return;
    }

    const password = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!';

    const superadmin = await User.create({
      name: 'Super Admin',
      email: process.env.SUPERADMIN_EMAIL || 'superadmin@yallaclean.com',
      password,
      role: 'superadmin',
    });

    console.log('Superadmin créé avec succès:', superadmin.email);
  } catch (err) {
    console.error('Erreur lors de la création du superadmin:', err);
  } finally {
    await mongoose.connection.close();
  }
};

createSuperAdmin();
