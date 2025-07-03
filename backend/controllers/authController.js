const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Create initial admin account
// @route   POST /api/auth/create-initial-admin
// @access  Public (only works if no admin exists)
const createInitialAdmin = async (req, res) => {
  try {
    // Check if any admin user exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(403).json({ 
        message: 'Un compte administrateur existe déjà' 
      });
    }

    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Veuillez fournir un nom, un email et un mot de passe' 
      });
    }

    // Check password strength
    if (password.length < 8) {
      return res.status(400).json({ 
        message: 'Le mot de passe doit contenir au moins 8 caractères' 
      });
    }

    // Check if email is already in use
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        message: 'Cet email est déjà utilisé' 
      });
    }

    // Create admin user
    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });

    // Generate token
    const token = generateToken(admin._id, 'admin');

    res.status(201).json({
      message: 'Compte administrateur créé avec succès',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la création du compte administrateur', 
      error: error.message 
    });
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Create user with client role
    const user = await User.create({
      name,
      email,
      password,
      role: 'client' // Only clients can self-register
    });

    res.status(201).json({
      message: 'Inscription réussie',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'inscription', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Generate token with role
    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du profil', error: error.message });
  }
};

// @desc    Create travailleur account (Admin only)
// @route   POST /api/auth/create-travailleur
// @access  Private/Admin
const createTravailleur = async (req, res) => {
  console.log('Creating travailleur with data:', req.body);
  try {
    // Check if the requesting user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé. Seul l\'administrateur peut créer des comptes travailleur.' });
    }

    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    console.log('Creating travailleur in database...');
    // Create travailleur account
    const travailleur = await User.create({
      name,
      email,
      password,
      role: 'travailleur'
    });

    res.status(201).json({
      message: 'Compte travailleur créé avec succès',
      user: {
        id: travailleur._id,
        name: travailleur.name,
        email: travailleur.email,
        role: travailleur.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du compte travailleur', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  createTravailleur,
  createInitialAdmin
};
