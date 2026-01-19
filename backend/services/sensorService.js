/**
 * Sensor Data Service
 * Handles sensor data validation, cleaning, and normalization
 */

/**
 * Validate sensor data ranges
 */
exports.validateSensorData = (smoke, humidity) => {
  const errors = [];
  
  // Smoke sensor range: 0-1023 (typical analog sensor)
  if (typeof smoke !== 'number' || smoke < 0 || smoke > 1023) {
    errors.push('Smoke value must be between 0 and 1023');
  }
  
  // Humidity range: 0-100%
  if (typeof humidity !== 'number' || humidity < 0 || humidity > 100) {
    errors.push('Humidity value must be between 0 and 100');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Clean and normalize sensor data
 * Removes noise and smooths readings
 */
exports.cleanSensorData = (rawData) => {
  const { smoke, humidity, location, timestamp } = rawData;
  
  // Apply simple moving average for noise reduction
  const smoothedSmoke = this.smoothValue(smoke);
  const smoothedHumidity = this.smoothValue(humidity);
  
  // Normalize smoke value to pollution index (0-100)
  const pollutionIndex = this.normalizeSmokeValue(smoothedSmoke);
  
  // Apply humidity correction
  const correctedPollutionIndex = this.applyHumidityCorrection(
    pollutionIndex, 
    smoothedHumidity
  );
  
  return {
    raw: {
      smoke,
      humidity
    },
    processed: {
      smoke: smoothedSmoke,
      humidity: smoothedHumidity,
      pollutionIndex: Math.round(correctedPollutionIndex)
    },
    location,
    timestamp,
    processedAt: new Date().toISOString()
  };
};

/**
 * Simple smoothing algorithm
 * In production, maintain a rolling buffer
 */
exports.smoothValue = (value) => {
  // For simplicity, apply a basic filter
  // In real implementation, use moving average with history
  return Math.round(value * 100) / 100;
};

/**
 * Normalize smoke sensor value to pollution index (0-100)
 * Maps raw sensor value (0-1023) to pollution index
 */
exports.normalizeSmokeValue = (smokeValue) => {
  // Linear mapping: 0-1023 -> 0-100
  // Adjust thresholds based on sensor calibration
  const normalized = (smokeValue / 1023) * 100;
  
  // Apply non-linear curve for better sensitivity at lower values
  // Using a quadratic curve for demonstration
  const curved = Math.pow(normalized / 100, 1.5) * 100;
  
  return Math.min(100, Math.max(0, curved));
};

/**
 * Apply humidity correction to pollution index
 * High humidity can trap pollutants but also affects sensor readings
 */
exports.applyHumidityCorrection = (pollutionIndex, humidity) => {
  // High humidity (>70%) can affect sensor accuracy
  // Apply correction factor
  let correctionFactor = 1.0;
  
  if (humidity > 70) {
    // Reduce pollution index slightly for high humidity
    correctionFactor = 0.85;
  } else if (humidity > 50) {
    correctionFactor = 0.95;
  }
  
  return pollutionIndex * correctionFactor;
};

/**
 * Check sensor health status
 */
exports.checkSensorHealth = () => {
  // In production, check last reading time, value patterns, etc.
  const dataStore = require('../utils/dataStore');
  const latestReading = dataStore.getLatestSensorReading();
  
  if (!latestReading) {
    return {
      status: 'offline',
      message: 'No sensor data available',
      lastSeen: null
    };
  }
  
  const lastSeenTime = new Date(latestReading.timestamp);
  const timeSinceLastReading = Date.now() - lastSeenTime.getTime();
  const minutesSinceLastReading = timeSinceLastReading / (1000 * 60);
  
  if (minutesSinceLastReading > 10) {
    return {
      status: 'warning',
      message: 'No recent data received',
      lastSeen: lastSeenTime.toISOString(),
      minutesSinceLastReading: Math.round(minutesSinceLastReading)
    };
  }
  
  return {
    status: 'healthy',
    message: 'Sensor functioning normally',
    lastSeen: lastSeenTime.toISOString(),
    minutesSinceLastReading: Math.round(minutesSinceLastReading)
  };
};
