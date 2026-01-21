/**
 * Dashboard Controller
 * Provides aggregated data for dashboard views
 */

const dataStore = require('../utils/dataStore');
const automationService = require('../services/automationService');
const SensorData = require('../models/SensorData');

/**
 * Get complete dashboard data
 */
exports.getDashboardData = async (req, res) => {
  try {
    // Try to get from MongoDB first
    let latestSensor;
    try {
      latestSensor = await SensorData.findOne().sort({ createdAt: -1 });
    } catch (dbError) {
      console.log('⚠️  MongoDB not available, using in-memory data');
      latestSensor = dataStore.getLatestSensorReading();
    }
    
    // Fallback to in-memory if MongoDB returns nothing
    if (!latestSensor) {
      latestSensor = dataStore.getLatestSensorReading();
    }

    const activeAlerts = dataStore.getActiveAlerts();
    const automationStatus = automationService.getAutomationStatus();

    const dashboardData = {
      aqi: latestSensor ? {
        value: latestSensor.aqi || 0,
        category: latestSensor.status || 'Unknown',
        color: getAQIColor(latestSensor.aqi || 0),
        timestamp: latestSensor.createdAt || new Date().toISOString(),
        estimated: false
      } : {
        value: 0,
        category: 'Unknown',
        color: '#gray',
        timestamp: new Date().toISOString(),
        estimated: true
      },
      sensorData: latestSensor ? {
        mq: latestSensor.mq || 0,
        temperature: latestSensor.temperature || 0,
        humidity: latestSensor.humidity || 0,
        aqi: latestSensor.aqi || 0,
        status: latestSensor.status || 'Unknown',
        timestamp: latestSensor.createdAt || new Date().toISOString()
      } : {
        mq: 0,
        temperature: 0,
        humidity: 0,
        aqi: 0,
        status: 'Unknown',
        timestamp: new Date().toISOString()
      },
      automation: automationStatus,
      alerts: {
        active: activeAlerts,
        count: activeAlerts.length
      },
      lastUpdated: new Date().toISOString(),
      deviceId: latestSensor?.deviceId || 'Unknown'
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data' 
    });
  }
};

/**
 * Get analytics data
 */
exports.getAnalytics = (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    let hours = 24;
    if (period === '7d') hours = 168;
    if (period === '30d') hours = 720;

    const aqiHistory = dataStore.getAQIHistory(hours);
    
    // Calculate trends
    const analytics = {
      period,
      dataPoints: aqiHistory.length,
      average: calculateAverage(aqiHistory),
      peak: calculatePeak(aqiHistory),
      trend: calculateTrend(aqiHistory),
      hourlyData: groupByHour(aqiHistory),
      categoryDistribution: getCategoryDistribution(aqiHistory)
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics' 
    });
  }
};

// Helper functions
function calculateAverage(data) {
  if (!data.length) return 0;
  const sum = data.reduce((acc, item) => acc + item.value, 0);
  return Math.round(sum / data.length);
}

function calculatePeak(data) {
  if (!data.length) return { value: 0, timestamp: null };
  const peak = data.reduce((max, item) => 
    item.value > max.value ? item : max, 
    data[0]
  );
  return { value: peak.value, timestamp: peak.timestamp };
}

function calculateTrend(data) {
  if (data.length < 2) return 'stable';
  const recent = data.slice(-10);
  const older = data.slice(-20, -10);
  
  const recentAvg = calculateAverage(recent);
  const olderAvg = calculateAverage(older);
  
  if (recentAvg > olderAvg * 1.1) return 'increasing';
  if (recentAvg < olderAvg * 0.9) return 'decreasing';
  return 'stable';
}

function groupByHour(data) {
  const grouped = {};
  data.forEach(item => {
    const hour = new Date(item.timestamp).getHours();
    if (!grouped[hour]) grouped[hour] = [];
    grouped[hour].push(item.value);
  });
  
  return Object.entries(grouped).map(([hour, values]) => ({
    hour: parseInt(hour),
    average: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    count: values.length
  }));
}

function getCategoryDistribution(data) {
  const distribution = {
    Good: 0,
    Moderate: 0,
    Poor: 0,
    'Very Poor': 0
  };
  
  data.forEach(item => {
    if (distribution[item.category] !== undefined) {
      distribution[item.category]++;
    }
  });
  
  return distribution;
}

// Helper to get AQI color
function getAQIColor(aqi) {
  if (aqi <= 50) return '#00E400'; // Green
  if (aqi <= 100) return '#FFFF00'; // Yellow
  if (aqi <= 200) return '#FF7E00'; // Orange
  if (aqi <= 300) return '#FF0000'; // Red
  return '#8F3F97'; // Purple
}
