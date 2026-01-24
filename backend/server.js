require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');

// Import routes
const sensorRoutes = require('./routes/sensorRoutes');
const aqiRoutes = require('./routes/aqiRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const alertRoutes = require('./routes/alertRoutes');
const automationRoutes = require('./routes/automationRoutes');
const devicesRoutes = require('./routes/devicesRoutes');
const droneRoutes = require('./routes/droneRoutes');
const mlRoutes = require('./routes/mlRoutes');
const waterTankRoutes = require('./routes/waterTankRoutes');
const industryRoutes = require('./routes/industryRoutes');
const homeRoutes = require('./routes/homeRoutes');

const app = express();
const PORT = process.env.PORT || 9000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'VayuDrishti AI Backend',
    features: {
      mlEnabled: true,
      fireDetection: true,
      pollutionDetection: true,
      automatedActions: true,
      waterResourceMonitoring: true
    }
  });
});

// API Routes
app.use('/api/sensors', sensorRoutes);
app.use('/api/aqi', aqiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/drone', droneRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/water-tanks', waterTankRoutes);
app.use('/api/industry', industryRoutes);
app.use('/api/home', homeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 VayuDrishti AI Backend Server Running`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 ML-Enabled: FIRE vs POLLUTION Detection`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
});

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});

module.exports = app;
