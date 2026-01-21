/**
 * Data Store Utility
 * In-memory storage for sensor readings, AQI data, and alerts
 * In production, replace with a database (MongoDB, PostgreSQL, etc.)
 */

// In-memory storage
let sensorReadings = [];
let aqiReadings = [];
let alerts = [];

// Storage limits
const MAX_SENSOR_READINGS = 1000;
const MAX_AQI_READINGS = 1000;
const MAX_ALERTS = 500;

/**
 * Add sensor reading
 */
exports.addSensorReading = (reading) => {
  sensorReadings.unshift(reading);
  
  // Maintain storage limit
  if (sensorReadings.length > MAX_SENSOR_READINGS) {
    sensorReadings = sensorReadings.slice(0, MAX_SENSOR_READINGS);
  }
  
  return reading;
};

/**
 * Get latest sensor reading
 */
exports.getLatestSensorReading = () => {
  return sensorReadings[0] || null;
};

/**
 * Get sensor readings history
 */
exports.getSensorHistory = (hours = 24) => {
  const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
  return sensorReadings.filter(reading => 
    new Date(reading.timestamp).getTime() > cutoffTime
  );
};

/**
 * Add AQI reading
 */
exports.addAQIReading = (aqiData) => {
  aqiReadings.unshift(aqiData);
  
  // Maintain storage limit
  if (aqiReadings.length > MAX_AQI_READINGS) {
    aqiReadings = aqiReadings.slice(0, MAX_AQI_READINGS);
  }
  
  // Trigger automation check
  const automationService = require('../services/automationService');
  automationService.processAQIReading(aqiData);
  
  return aqiData;
};

/**
 * Get latest AQI reading
 */
exports.getLatestAQI = () => {
  return aqiReadings[0] || null;
};

/**
 * Get AQI history
 */
exports.getAQIHistory = (hours = 24) => {
  const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
  return aqiReadings.filter(reading => 
    new Date(reading.timestamp).getTime() > cutoffTime
  );
};

/**
 * Add alert
 */
exports.addAlert = (alertData) => {
  const alert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...alertData,
    timestamp: new Date().toISOString(),
    acknowledged: false,
    acknowledgedBy: null,
    acknowledgedAt: null
  };
  
  alerts.unshift(alert);
  
  // Maintain storage limit
  if (alerts.length > MAX_ALERTS) {
    alerts = alerts.slice(0, MAX_ALERTS);
  }
  
  console.log(`🔔 Alert created: ${alert.message}`);
  
  return alert;
};

/**
 * Get all alerts
 */
exports.getAllAlerts = () => {
  return alerts;
};

/**
 * Get active (unacknowledged) alerts
 */
exports.getActiveAlerts = () => {
  return alerts.filter(alert => !alert.acknowledged);
};

/**
 * Acknowledge an alert
 */
exports.acknowledgeAlert = (alertId, acknowledgedBy = 'system') => {
  const alertIndex = alerts.findIndex(a => a.id === alertId);
  
  if (alertIndex === -1) {
    return null;
  }
  
  alerts[alertIndex].acknowledged = true;
  alerts[alertIndex].acknowledgedBy = acknowledgedBy;
  alerts[alertIndex].acknowledgedAt = new Date().toISOString();
  
  console.log(`✅ Alert acknowledged: ${alertId}`);
  
  return alerts[alertIndex];
};

/**
 * Clear old data (cleanup function)
 */
exports.clearOldData = (daysToKeep = 7) => {
  const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
  
  sensorReadings = sensorReadings.filter(reading => 
    new Date(reading.timestamp).getTime() > cutoffTime
  );
  
  aqiReadings = aqiReadings.filter(reading => 
    new Date(reading.timestamp).getTime() > cutoffTime
  );
  
  alerts = alerts.filter(alert => 
    new Date(alert.timestamp).getTime() > cutoffTime
  );
  
  console.log(`🧹 Cleaned old data (kept ${daysToKeep} days)`);
};

/**
 * Get storage statistics
 */
exports.getStorageStats = () => {
  return {
    sensorReadings: {
      count: sensorReadings.length,
      max: MAX_SENSOR_READINGS,
      oldest: sensorReadings[sensorReadings.length - 1]?.timestamp || null,
      newest: sensorReadings[0]?.timestamp || null
    },
    aqiReadings: {
      count: aqiReadings.length,
      max: MAX_AQI_READINGS,
      oldest: aqiReadings[aqiReadings.length - 1]?.timestamp || null,
      newest: aqiReadings[0]?.timestamp || null
    },
    alerts: {
      count: alerts.length,
      active: alerts.filter(a => !a.acknowledged).length,
      max: MAX_ALERTS
    }
  };
};
