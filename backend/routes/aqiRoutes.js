/**
 * AQI Calculation Routes
 * Handles AQI estimation and processing
 */

const express = require('express');
const router = express.Router();
const aqiController = require('../controllers/aqiController');

// POST /api/aqi/calculate - Calculate AQI from sensor data
router.post('/calculate', aqiController.calculateAQI);

// GET /api/aqi/current - Get current AQI value
router.get('/current', aqiController.getCurrentAQI);

// GET /api/aqi/history - Get AQI history
router.get('/history', aqiController.getAQIHistory);

module.exports = router;
