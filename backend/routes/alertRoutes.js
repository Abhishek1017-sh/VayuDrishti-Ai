/**
 * Alert Management Routes
 * Handles alert creation, retrieval, and management
 */

const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

// GET /api/alerts - Get all alerts (active and historical)
router.get('/', alertController.getAlerts);

// GET /api/alerts/active - Get only active alerts
router.get('/active', alertController.getActiveAlerts);

// POST /api/alerts/acknowledge - Acknowledge an alert
router.post('/acknowledge', alertController.acknowledgeAlert);

module.exports = router;
