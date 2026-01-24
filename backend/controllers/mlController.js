/**
 * ML Integration Controller
 * 
 * Main entry point for ML-based FIRE/POLLUTION detection and action routing.
 * Integrates sensor data collection, ML classification, and automated responses.
 */

const MLService = require('../services/mlService');
const ActionRouter = require('../services/actionRouter');
const SensorData = require('../models/SensorData');

/**
 * Process sensor event with ML classification
 * 
 * This is the main endpoint that:
 * 1. Collects 60 seconds of sensor data
 * 2. Runs ML classification if AQI >= 500
 * 3. Routes to appropriate actions (FIRE or POLLUTION)
 * 
 * POST /api/ml/process-event
 */
exports.processEvent = async (req, res) => {
  try {
    const {
      deviceId,
      zone,
      latitude,
      longitude,
      currentAQI
    } = req.body;

    // Validate required fields
    if (!deviceId || !zone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: deviceId, zone'
      });
    }

    // Step 1: Get last 60 seconds of sensor data
    const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
    const sensorWindow = await SensorData.find({
      deviceId,
      timestamp: { $gte: sixtySecondsAgo }
    })
    .sort({ timestamp: 1 })
    .lean();

    if (sensorWindow.length < 60) {
      return res.status(400).json({
        success: false,
        message: `Insufficient sensor data: ${sensorWindow.length} readings (minimum 60 required for ML classification)`
      });
    }

    // Step 2: Calculate AQI if not provided
    let aqi = currentAQI;
    if (!aqi) {
      const latestReading = sensorWindow[sensorWindow.length - 1];
      aqi = calculateAQI(latestReading.smoke);
    }

    // Step 3: Process event through Action Router
    const result = await ActionRouter.processEvent({
      aqi,
      sensorWindow,
      deviceId,
      zone,
      latitude: latitude || 0,
      longitude: longitude || 0
    });

    res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('❌ ML Process Event Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process event',
      error: error.message
    });
  }
};

/**
 * Test ML classification with custom sensor data
 * 
 * POST /api/ml/test-classify
 */
exports.testClassify = async (req, res) => {
  try {
    const { smoke, humidity, temperature, aqi } = req.body;

    // Validate arrays
    if (!Array.isArray(smoke) || !Array.isArray(humidity) || !Array.isArray(temperature)) {
      return res.status(400).json({
        success: false,
        message: 'smoke, humidity, and temperature must be arrays'
      });
    }

    if (smoke.length < 60) {
      return res.status(400).json({
        success: false,
        message: `Insufficient data: ${smoke.length} readings (minimum 60 required)`
      });
    }

    const result = await MLService.classifyEvent({
      smoke,
      humidity,
      temperature,
      aqi: aqi || calculateAQI(smoke[smoke.length - 1])
    });

    res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('❌ ML Test Classify Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to classify event',
      error: error.message
    });
  }
};

/**
 * Get ML service status and configuration
 * 
 * GET /api/ml/status
 */
exports.getStatus = async (req, res) => {
  try {
    const status = MLService.getStatus();
    
    res.status(200).json({
      success: true,
      ...status
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get ML status',
      error: error.message
    });
  }
};

/**
 * Calculate AQI from smoke PPM
 * 
 * Simplified AQI calculation based on smoke sensor (MQ-135)
 * Real implementation should use EPA AQI formula
 * 
 * @param {number} smokePPM - Smoke level in PPM
 * @returns {number} AQI value
 */
function calculateAQI(smokePPM) {
  // Simplified conversion: smoke PPM to AQI
  // This is a rough approximation
  
  if (smokePPM < 50) return Math.round(smokePPM);
  if (smokePPM < 100) return Math.round(50 + (smokePPM - 50) * 0.5);
  if (smokePPM < 200) return Math.round(100 + (smokePPM - 100));
  if (smokePPM < 300) return Math.round(200 + (smokePPM - 200) * 1.5);
  if (smokePPM < 500) return Math.round(350 + (smokePPM - 300) * 0.75);
  
  // Above 500 PPM = AQI 500+
  return Math.round(500 + (smokePPM - 500) * 0.2);
}

module.exports = {
  processEvent: exports.processEvent,
  testClassify: exports.testClassify,
  getStatus: exports.getStatus
};
