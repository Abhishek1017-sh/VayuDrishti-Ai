/**
 * AQI Controller
 * Handles AQI calculation and historical data
 */

const aqiService = require('../services/aqiService');
const dataStore = require('../utils/dataStore');

/**
 * Calculate AQI from sensor data
 */
exports.calculateAQI = async (req, res) => {
  try {
    const { smoke, humidity } = req.body;

    if (smoke === undefined || humidity === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: smoke and humidity' 
      });
    }

    // Calculate AQI
    const aqiData = aqiService.calculateAQI(smoke, humidity);

    // Store AQI reading
    dataStore.addAQIReading(aqiData);

    res.json({
      success: true,
      data: aqiData
    });

  } catch (error) {
    console.error('Error calculating AQI:', error);
    res.status(500).json({ 
      error: 'Failed to calculate AQI',
      details: error.message 
    });
  }
};

/**
 * Get current AQI value
 */
exports.getCurrentAQI = (req, res) => {
  try {
    const currentAQI = dataStore.getLatestAQI();
    
    if (!currentAQI) {
      return res.status(404).json({ 
        error: 'No AQI data available' 
      });
    }

    res.json({
      success: true,
      data: currentAQI
    });

  } catch (error) {
    console.error('Error fetching current AQI:', error);
    res.status(500).json({ 
      error: 'Failed to fetch current AQI' 
    });
  }
};

/**
 * Get AQI history
 */
exports.getAQIHistory = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const hoursInt = parseInt(hours);

    let history = [];

    // Prefer persisted data so old readings survive restarts
    try {
      const SensorData = require('../models/SensorData');
      const cutoffTime = new Date(Date.now() - hoursInt * 60 * 60 * 1000);
      const docs = await SensorData.find({ createdAt: { $gte: cutoffTime } })
        .sort({ createdAt: 1 })
        .select('aqi status createdAt');

      history = docs.map((doc) => ({
        value: doc.aqi,
        status: doc.status,
        category: normalizeStatus(doc.status),
        timestamp: doc.createdAt
      }));
    } catch (dbError) {
      console.log('⚠️  MongoDB not available for AQI history, falling back to in-memory');
    }

    // Fallback to in-memory buffer if DB returned nothing
    if (!history.length) {
      history = dataStore.getAQIHistory(hoursInt);
    }

    res.json({
      success: true,
      data: history,
      count: history.length
    });

  } catch (error) {
    console.error('Error fetching AQI history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch AQI history' 
    });
  }
};

// Normalize stored status values to the labels used by charts
function normalizeStatus(status) {
  if (!status) return 'Unknown';
  const map = {
    GOOD: 'Good',
    MODERATE: 'Moderate',
    POOR: 'Poor',
    VERY_POOR: 'Very Poor',
    SEVERE: 'Very Poor'
  };
  return map[status] || status;
}
