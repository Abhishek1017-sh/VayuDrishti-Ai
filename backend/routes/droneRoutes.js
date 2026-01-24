/**
 * Drone Routes
 * API endpoints for drone system control
 */

const express = require('express');
const router = express.Router();
const automationService = require('../services/automationService');

/**
 * POST /api/drone/activate
 * Manually activate drone system
 */
router.post('/activate', async (req, res) => {
  try {
    const { zone, deviceId, aqi } = req.body;
    
    if (!zone || !deviceId || !aqi) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: zone, deviceId, aqi'
      });
    }
    
    // Activate drone system
    const activated = automationService.activateDroneSystem({
      zone,
      deviceId,
      value: aqi
    });
    
    const status = automationService.getAutomationStatus();
    
    res.json({
      success: true,
      message: activated ? 'Drone system activated' : 'Drone system already active',
      data: {
        droneSystem: status.droneSystem,
        thresholds: status.thresholds
      }
    });
  } catch (error) {
    console.error('Error activating drone:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate drone system',
      error: error.message
    });
  }
});

/**
 * GET /api/drone/status
 * Get drone system status
 */
router.get('/status', (req, res) => {
  try {
    const status = automationService.getAutomationStatus();
    
    res.json({
      success: true,
      data: {
        droneSystem: status.droneSystem,
        emergencyAlert: status.emergencyAlert,
        thresholds: status.thresholds
      }
    });
  } catch (error) {
    console.error('Error getting drone status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get drone status',
      error: error.message
    });
  }
});

module.exports = router;
