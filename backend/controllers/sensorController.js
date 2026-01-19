/**
 * Sensor Data Controller
 * Handles sensor data reception, validation, and storage
 */

const sensorService = require('../services/sensorService');
const dataStore = require('../utils/dataStore');

/**
 * Receive and validate sensor data from IoT devices
 */
exports.receiveSensorData = async (req, res) => {
  try {
    const { smoke, humidity, location, timestamp } = req.body;

    // Validate input
    if (smoke === undefined || humidity === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: smoke and humidity' 
      });
    }

    // Validate sensor data
    const validation = sensorService.validateSensorData(smoke, humidity);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Invalid sensor data',
        details: validation.errors 
      });
    }

    // Clean and normalize sensor data
    const cleanedData = sensorService.cleanSensorData({
      smoke,
      humidity,
      location: location || 'default',
      timestamp: timestamp || new Date().toISOString()
    });

    // Store cleaned data
    dataStore.addSensorReading(cleanedData);

    res.json({
      success: true,
      data: cleanedData,
      message: 'Sensor data received and processed'
    });

  } catch (error) {
    console.error('Error processing sensor data:', error);
    res.status(500).json({ 
      error: 'Failed to process sensor data',
      details: error.message 
    });
  }
};

/**
 * Get latest sensor readings
 */
exports.getLatestSensorData = (req, res) => {
  try {
    const latestReading = dataStore.getLatestSensorReading();
    
    if (!latestReading) {
      return res.status(404).json({ 
        error: 'No sensor data available' 
      });
    }

    res.json({
      success: true,
      data: latestReading
    });

  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sensor data' 
    });
  }
};

/**
 * Get sensor health status
 */
exports.getSensorHealth = (req, res) => {
  try {
    const healthStatus = sensorService.checkSensorHealth();
    
    res.json({
      success: true,
      health: healthStatus
    });

  } catch (error) {
    console.error('Error checking sensor health:', error);
    res.status(500).json({ 
      error: 'Failed to check sensor health' 
    });
  }
};
