const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');
const maintenanceMiddleware = require('./middleware/maintenanceMiddleware');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const superAdminRoutes = require('./routes/superadminRoutes');
const clientRoutes = require('./routes/clientRoutes');
const productRoutes = require('./routes/productRoutes');
const salesRoutes = require('./routes/salesRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const adminServiceRoutes = require('./routes/adminServiceRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const clientReservationRoutes = require('./routes/clientReservationRoutes');
const workerReservationRoutes = require('./routes/workerReservationRoutes');
const workerRoutes = require('./routes/workerRoutes');

const app = express();

// Basic middleware
app.use(express.json());

// Serve static files from the public directory
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Enable CORS for all routes
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: false
}));

// Middleware to check if site is active (maintenance mode)
app.use(maintenanceMiddleware);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Headers:`, req.headers);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: err.message });
});

// Routes (order matters)
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/admin/clients', clientRoutes);
app.use('/api/admin/products', productRoutes);
app.use('/api/admin/sales', salesRoutes);
app.use('/api', catalogRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/client/reservations', clientReservationRoutes);
app.use('/api/worker/reservations', workerReservationRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/admin', adminServiceRoutes);
app.use('/api', serviceRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;


connectDB().then(() => {
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});
