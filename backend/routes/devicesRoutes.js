/**
 * Devices Routes
 * Handles device management endpoints
 */

const express = require('express');
const router = express.Router();
const devicesController = require('../controllers/devicesController');

// GET /api/devices - Get all devices
router.get('/', devicesController.getAllDevices);

// GET /api/devices/:deviceId - Get device by ID
router.get('/:deviceId', devicesController.getDeviceById);

// POST /api/devices - Register or update a device
router.post('/', devicesController.registerDevice);

module.exports = router;
