const dataStore = require('../utils/dataStore');

exports.getAlerts = (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    
    let alerts = dataStore.getAllAlerts();
    
    // Filter by status if provided
    if (status === 'active') {
      alerts = dataStore.getActiveAlerts();
    } else if (status === 'acknowledged') {
      alerts = alerts.filter(a => a.acknowledged);
    }
    
    // Apply limit
    alerts = alerts.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });

  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch alerts' 
    });
  }
};

/**
 * Get only active alerts
 */
exports.getActiveAlerts = (req, res) => {
  try {
    const activeAlerts = dataStore.getActiveAlerts();

    res.json({
      success: true,
      data: activeAlerts,
      count: activeAlerts.length
    });

  } catch (error) {
    console.error('Error fetching active alerts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch active alerts' 
    });
  }
};

/**
 * Acknowledge an alert
 */
exports.acknowledgeAlert = (req, res) => {
  try {
    const { alertId, acknowledgedBy } = req.body;

    if (!alertId) {
      return res.status(400).json({ 
        error: 'Alert ID is required' 
      });
    }

    const result = dataStore.acknowledgeAlert(alertId, acknowledgedBy);

    if (!result) {
      return res.status(404).json({ 
        error: 'Alert not found' 
      });
    }

    res.json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: result
    });

  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ 
      error: 'Failed to acknowledge alert' 
    });
  }
};
