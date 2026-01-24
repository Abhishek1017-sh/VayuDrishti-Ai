/**
 * Alert Management Routes
 * Handles alert creation, retrieval, and management across roles
 */

const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alertsController');

// Admin routes - full access
router.get('/', alertsController.getAllAlerts);
router.get('/device/:deviceId', alertsController.getDeviceAlerts);
router.delete('/:alertId', alertsController.deleteAlert);

// General alert management
router.post('/', alertsController.createAlert);
router.post('/:alertId/acknowledge', alertsController.acknowledgeAlert);
router.post('/:alertId/resolve', alertsController.resolveAlert);

// Facility routes (Industry)
router.get('/facility/:facilityId', alertsController.getFacilityAlerts);

// Device control routes
router.post('/device/:deviceId/control', alertsController.relayControl);
router.get('/device/:deviceId/status', alertsController.getDeviceStatus);

// Automation logs
router.get('/automation/logs', alertsController.getAutomationLogs);

module.exports = router;
