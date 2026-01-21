/**
 * Sensor Data Controller
 * Handles sensor data reception, validation, and storage
 */

const sensorService = require('../services/sensorService');
const dataStore = require('../utils/dataStore');
const SensorData = require('../models/SensorData');

/**
 * Receive and validate sensor data from IoT devices (NodeMCU)
 * Expects: { deviceId, mq, aqi, temperature, humidity, status }
 */
exports.receiveSensorData = async (req, res) => {
  try {
    const { deviceId, mq, aqi, temperature, humidity, status } = req.body;

    // Validate input - support both new (MQ+DHT11) and old (smoke+humidity) formats
    const mqValue = mq !== undefined ? mq : req.body.smoke;
    const tempValue = temperature !== undefined ? temperature : 25; // default
    const humValue = humidity !== undefined ? humidity : req.body.humidity;

    if (mqValue === undefined || humValue === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: mq/smoke and humidity are required' 
      });
    }

    // Validate sensor data ranges
    const validation = sensorService.validateIoTSensorData({
      mq: mqValue,
      temperature: tempValue,
      humidity: humValue
    });

    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Invalid sensor data',
        details: validation.errors 
      });
    }

    // Calculate AQI if not provided
    const calculatedAQI = aqi !== undefined ? aqi : sensorService.mqToAQI(mqValue);
    const calculatedStatus = status || sensorService.getAQIStatus(calculatedAQI);

    // Prepare data for storage
    const sensorData = {
      deviceId: deviceId || 'classroom-01',
      mq: mqValue,
      aqi: calculatedAQI,
      temperature: tempValue,
      humidity: humValue,
      status: calculatedStatus,
      createdAt: new Date()
    };

    // Try to save to MongoDB first, fallback to in-memory
    let savedData;
    try {
      savedData = await SensorData.create(sensorData);
      console.log(`✅ Data saved to MongoDB: AQI=${calculatedAQI}, Status=${calculatedStatus}`);
    } catch (dbError) {
      console.log('⚠️  MongoDB not available, using in-memory storage');
      savedData = dataStore.addSensorReading(sensorData);
    }

    // Also store in memory for backward compatibility
    dataStore.addSensorReading(sensorData);
    
    // Store AQI reading for dashboard
    dataStore.addAQIReading({
      value: calculatedAQI,
      status: calculatedStatus,
      timestamp: new Date().toISOString()
    });

    // ========================================
    // TRIGGER ALERT IF AQI > 100
    // ========================================
    if (calculatedAQI > 100) {
      const alert = {
        type: 'HIGH_AQI',
        severity: calculatedAQI > 200 ? 'CRITICAL' : 'WARNING',
        message: `Air Quality Alert: AQI ${calculatedAQI} (${calculatedStatus})`,
        aqi: calculatedAQI,
        deviceId: sensorData.deviceId,
        timestamp: new Date().toISOString(),
        relayActivated: true,
        acknowledged: false
      };
      
      dataStore.addAlert(alert);
      console.log(`🚨 ALERT TRIGGERED: AQI=${calculatedAQI}, Status=${calculatedStatus}`);
    }

    res.status(201).json({
      success: true,
      message: 'Sensor data received and stored',
      data: savedData,
      alert: calculatedAQI > 100 ? 'Relay activated - Air quality alert triggered' : null
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
exports.getLatestSensorData = async (req, res) => {
  try {
    let latestReading;
    
    // Try MongoDB first
    try {
      latestReading = await SensorData.findOne().sort({ createdAt: -1 });
    } catch (dbError) {
      console.log('⚠️  MongoDB not available, using in-memory data');
      latestReading = dataStore.getLatestSensorReading();
    }
    
    if (!latestReading) {
      return res.status(404).json({ 
        error: 'No sensor data available',
        message: 'Waiting for first sensor reading from NodeMCU'
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
 * Get sensor history (for charts)
 */
exports.getSensorHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const hours = parseInt(req.query.hours) || 24;
    
    let history;
    
    // Try MongoDB first
    try {
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      history = await SensorData.find({ createdAt: { $gte: cutoffTime } })
        .sort({ createdAt: 1 })
        .limit(limit);
    } catch (dbError) {
      console.log('⚠️  MongoDB not available, using in-memory data');
      history = dataStore.getSensorHistory(hours).slice(-limit);
    }
    
    res.json({
      success: true,
      count: history.length,
      data: history
    });

  } catch (error) {
    console.error('Error fetching sensor history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sensor history' 
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
