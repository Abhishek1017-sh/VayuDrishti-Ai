/**
 * ML Routes
 * API endpoints for ML-based FIRE/POLLUTION detection
 */

const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');

/**
 * POST /api/ml/process-event
 * Process sensor event with ML classification and automated actions
 * 
 * Body:
 * {
 *   deviceId: string,
 *   zone: string,
 *   latitude: number (optional),
 *   longitude: number (optional),
 *   currentAQI: number (optional, will be calculated if not provided)
 * }
 */
router.post('/process-event', mlController.processEvent);

/**
 * POST /api/ml/test-classify
 * Test ML classification with custom sensor data
 * 
 * Body:
 * {
 *   smoke: number[],      // 60 readings
 *   humidity: number[],   // 60 readings
 *   temperature: number[], // 60 readings
 *   aqi: number (optional)
 * }
 */
router.post('/test-classify', mlController.testClassify);

/**
 * GET /api/ml/status
 * Get ML service status and configuration
 */
router.get('/status', mlController.getStatus);

module.exports = router;
