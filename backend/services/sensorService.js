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
  
  const lastSeenTime = new Date(latestReading.timestamp || latestReading.createdAt);
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

/**
 * ========================================
 * IoT-Specific Functions (MQ + DHT11)
 * ========================================
 */

/**
 * Validate IoT sensor data (MQ smoke sensor + DHT11)
 */
exports.validateIoTSensorData = (data) => {
  const errors = [];
  const { mq, temperature, humidity } = data;
  
  // MQ sensor range: 0-1023 (10-bit ADC in ESP8266)
  if (typeof mq !== 'number' || mq < 0 || mq > 1023) {
    errors.push('MQ value must be between 0 and 1023');
  }
  
  // Temperature range: -10 to 60°C (DHT11 typical range)
  if (typeof temperature !== 'number' || temperature < -10 || temperature > 60) {
    errors.push('Temperature must be between -10 and 60°C');
  }
  
  // Humidity range: 0-100% (DHT11)
  if (typeof humidity !== 'number' || humidity < 0 || humidity > 100) {
    errors.push('Humidity must be between 0 and 100%');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Convert MQ sensor reading to AQI-like score (0-500)
 * Based on the custom mapping for MQ smoke/gas sensor
 */
exports.mqToAQI = (mqValue) => {
  // Clamp input to valid range
  const clampedMQ = Math.max(0, Math.min(1023, mqValue));
  
  // Map MQ reading (300-900) to AQI (0-500)
  // 300 = clean air baseline
  // 900 = severe pollution
  const minMQ = 300;
  const maxMQ = 900;
  const minAQI = 0;
  const maxAQI = 500;
  
  // Linear mapping
  let aqi = ((clampedMQ - minMQ) / (maxMQ - minMQ)) * (maxAQI - minAQI) + minAQI;
  
  // Clamp to 0-500 range
  aqi = Math.max(minAQI, Math.min(maxAQI, aqi));
  
  return Math.round(aqi);
};

/**
 * Get AQI status category based on AQI value
 */
exports.getAQIStatus = (aqi) => {
  if (aqi <= 50) return 'GOOD';
  if (aqi <= 100) return 'MODERATE';
  if (aqi <= 200) return 'POOR';
  if (aqi <= 300) return 'VERY_POOR';
  return 'SEVERE';
};

/**
 * Get AQI color code for UI
 */
exports.getAQIColor = (aqi) => {
  if (aqi <= 50) return '#00E400'; // Green
  if (aqi <= 100) return '#FFFF00'; // Yellow
  if (aqi <= 200) return '#FF7E00'; // Orange
  if (aqi <= 300) return '#FF0000'; // Red
  return '#8F3F97'; // Purple
};

/**
 * Get health recommendation based on AQI
 */
exports.getHealthRecommendation = (aqi) => {
  if (aqi <= 50) {
    return 'Air quality is good. Enjoy outdoor activities!';
  }
  if (aqi <= 100) {
    return 'Air quality is acceptable. Sensitive individuals should consider limiting prolonged outdoor exertion.';
  }
  if (aqi <= 200) {
    return 'Unhealthy air quality. Everyone should reduce prolonged or heavy outdoor exertion.';
  }
  if (aqi <= 300) {
    return 'Very unhealthy air. Everyone should avoid prolonged outdoor exertion.';
  }
  return 'Hazardous air quality. Everyone should avoid all outdoor exertion.';
};

