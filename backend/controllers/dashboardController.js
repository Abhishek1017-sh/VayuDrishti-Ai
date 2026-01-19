/**
 * Dashboard Controller
 * Provides aggregated data for dashboard views
 */

const dataStore = require('../utils/dataStore');
const automationService = require('../services/automationService');

/**
 * Get complete dashboard data
 */
exports.getDashboardData = (req, res) => {
  try {
    const latestAQI = dataStore.getLatestAQI();
    const latestSensor = dataStore.getLatestSensorReading();
    const activeAlerts = dataStore.getActiveAlerts();
    const automationStatus = automationService.getAutomationStatus();

    const dashboardData = {
      aqi: latestAQI || {
        value: 0,
        category: 'Unknown',
        color: '#gray',
        timestamp: new Date().toISOString(),
        estimated: true
      },
      sensorData: latestSensor || {
        smoke: 0,
        humidity: 0,
        pollutionIndex: 0,
        timestamp: new Date().toISOString()
      },
      automation: automationStatus,
      alerts: {
        active: activeAlerts,
        count: activeAlerts.length
      },
      lastUpdated: new Date().toISOString(),
      location: latestSensor?.location || 'Unknown'
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
