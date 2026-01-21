/**
 * Sensor Data Routes
 * Handles incoming sensor data from IoT devices
 */

const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

// POST /api/sensors/data - Receive and validate sensor data
router.post('/data', sensorController.receiveSensorData);

// POST /api/sensors - Simplified endpoint for NodeMCU (matches your guide)
router.post('/', sensorController.receiveSensorData);

// GET /api/sensors/latest - Get latest sensor readings
router.get('/latest', sensorController.getLatestSensorData);

// GET /api/sensors/history - Get sensor history (for charts)
router.get('/history', sensorController.getSensorHistory);

// GET /api/sensors/health - Check sensor health status
router.get('/health', sensorController.getSensorHealth);

module.exports = router;
