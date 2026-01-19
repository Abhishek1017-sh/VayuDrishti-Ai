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
exports.getAQIHistory = (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const history = dataStore.getAQIHistory(parseInt(hours));

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
