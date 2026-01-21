/**
 * AQI Calculation Service
 * Estimates Air Quality Index from sensor data
 */

/**
 * Calculate AQI from smoke and humidity values
 * Uses pollution index to estimate AQI
 */
exports.calculateAQI = (smoke, humidity) => {
  const sensorService = require('./sensorService');
  
  // Normalize and clean data
  const normalizedSmoke = sensorService.normalizeSmokeValue(smoke);
  const correctedIndex = sensorService.applyHumidityCorrection(
    normalizedSmoke, 
    humidity
  );
  
  // Map pollution index to AQI value
  // This is a simplified mapping for demonstration
  const aqiValue = this.mapPollutionIndexToAQI(correctedIndex);
  
  // Determine AQI category
  const category = this.getAQICategory(aqiValue);
  
  // Get category details
  const categoryInfo = this.getCategoryInfo(category);
  
  return {
    value: Math.round(aqiValue),
    category: category,
    color: categoryInfo.color,
    healthImplications: categoryInfo.healthImplications,
    cautionaryStatement: categoryInfo.cautionaryStatement,
    pollutionIndex: Math.round(correctedIndex),
    rawSmoke: smoke,
    humidity: humidity,
    timestamp: new Date().toISOString(),
    estimated: true
  };
};

/**
 * Map pollution index (0-100) to AQI value (0-500+)
 * Using simplified linear mapping
 */
exports.mapPollutionIndexToAQI = (pollutionIndex) => {
  // Standard AQI ranges:
  // 0-50: Good
  // 51-100: Moderate
  // 101-150: Unhealthy for Sensitive Groups
  // 151-200: Unhealthy
  // 201-300: Very Unhealthy
  // 301+: Hazardous
  
  // Simple linear mapping for demonstration
  // In production, use official AQI calculation formulas
  let aqi;
  
  if (pollutionIndex <= 20) {
    // Good range
    aqi = (pollutionIndex / 20) * 50;
  } else if (pollutionIndex <= 40) {
    // Moderate range
    aqi = 50 + ((pollutionIndex - 20) / 20) * 50;
  } else if (pollutionIndex <= 60) {
    // Poor range
    aqi = 100 + ((pollutionIndex - 40) / 20) * 50;
  } else if (pollutionIndex <= 80) {
    // Very Poor range
    aqi = 150 + ((pollutionIndex - 60) / 20) * 50;
  } else {
    // Severe range
    aqi = 200 + ((pollutionIndex - 80) / 20) * 100;
  }
  
  return aqi;
};

/**
 * Determine AQI category based on value
 */
exports.getAQICategory = (aqiValue) => {
  if (aqiValue <= 50) return 'Good';
  if (aqiValue <= 100) return 'Moderate';
  if (aqiValue <= 150) return 'Poor';
  if (aqiValue <= 200) return 'Very Poor';
  if (aqiValue <= 300) return 'Severe';
  return 'Hazardous';
};

/**
 * Get detailed information for AQI category
 */
exports.getCategoryInfo = (category) => {
  const categoryMap = {
    'Good': {
      color: '#00E400',
      healthImplications: 'Air quality is satisfactory',
      cautionaryStatement: 'None'
    },
    'Moderate': {
      color: '#FFFF00',
      healthImplications: 'Acceptable air quality',
      cautionaryStatement: 'Unusually sensitive people should consider limiting prolonged outdoor exertion'
    },
    'Poor': {
      color: '#FF7E00',
      healthImplications: 'Unhealthy for sensitive groups',
      cautionaryStatement: 'Active children and adults with respiratory disease should limit prolonged outdoor exertion'
    },
    'Very Poor': {
      color: '#FF0000',
      healthImplications: 'Everyone may begin to experience health effects',
      cautionaryStatement: 'Active children and adults, and people with respiratory disease should avoid prolonged outdoor exertion'
    },
    'Severe': {
      color: '#8F3F97',
      healthImplications: 'Health alert: everyone may experience serious effects',
      cautionaryStatement: 'Everyone should avoid all outdoor exertion'
    },
    'Hazardous': {
      color: '#7E0023',
      healthImplications: 'Health warnings of emergency conditions',
      cautionaryStatement: 'Everyone should remain indoors and avoid all outdoor activities'
    }
  };
  
  return categoryMap[category] || categoryMap['Good'];
};
