/**
 * Water Tank Routes
 * API endpoints for water tank monitoring and management
 */

const express = require('express');
const router = express.Router();
const WaterTank = require('../models/WaterTank');
const Alert = require('../models/Alert');
const waterMonitorService = require('../services/waterMonitorService');

/**
 * POST /api/water-tanks/level
 * Update water level from sensor device
 * Body: { tankId, waterLevel, sensorDeviceId }
 */
router.post('/level', async (req, res) => {
  try {
    const { tankId, waterLevel, sensorDeviceId } = req.body;

    // Validation
    if (!tankId || waterLevel === undefined || !sensorDeviceId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tankId, waterLevel, sensorDeviceId'
      });
    }

    if (typeof waterLevel !== 'number' || waterLevel < 0 || waterLevel > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid water level. Must be a number between 0-100'
      });
    }

    // Process water level update
    const result = await waterMonitorService.processWaterLevelUpdate(
      tankId,
      waterLevel,
      sensorDeviceId
    );

    res.status(200).json({
      success: true,
      message: 'Water level updated successfully',
      data: result
    });

  } catch (error) {
    console.error('[Water Tank API] Error updating water level:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update water level'
    });
  }
});

/**
 * GET /api/water-tanks
 * Get list of all water tanks with optional filtering
 * Query params: ?zone=ZoneA&status=CRITICAL&isActive=true
 */
router.get('/', async (req, res) => {
  try {
    const { zone, status, isActive } = req.query;

    // Build query filter
    const filter = {};
    if (zone) filter.zone = zone;
    if (status) filter.status = status;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const tanks = await WaterTank.find(filter).sort({ zone: 1, tankId: 1 });

    res.status(200).json({
      success: true,
      count: tanks.length,
      data: tanks
    });

  } catch (error) {
    console.error('[Water Tank API] Error fetching tanks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch water tanks'
    });
  }
});

/**
 * GET /api/water-tanks/:tankId
 * Get detailed information about a specific tank
 */
router.get('/:tankId', async (req, res) => {
  try {
    const { tankId } = req.params;

    const tank = await WaterTank.findOne({ tankId });

    if (!tank) {
      return res.status(404).json({
        success: false,
        error: `Water tank ${tankId} not found`
      });
    }

    // Get recent alerts for this tank
    const recentAlerts = await Alert.find({
      'resourceData.tankId': tankId,
      category: 'WATER_RESOURCE'
    })
    .sort({ timestamp: -1 })
    .limit(10);

    res.status(200).json({
      success: true,
      data: {
        tank,
        recentAlerts,
        sprinklersDisabled: tank.shouldDisableSprinklers()
      }
    });

  } catch (error) {
    console.error('[Water Tank API] Error fetching tank:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tank details'
    });
  }
});

/**
 * POST /api/water-tanks
 * Create a new water tank configuration
 * Admin only
 */
router.post('/', async (req, res) => {
  try {
    const {
      tankId,
      zone,
      location,
      capacity,
      sensorDeviceId,
      municipality
    } = req.body;

    // Validation
    if (!tankId || !zone || !location || !capacity || !sensorDeviceId || !municipality) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Check if tank already exists
    const existingTank = await WaterTank.findOne({ tankId });
    if (existingTank) {
      return res.status(409).json({
        success: false,
        error: `Water tank ${tankId} already exists`
      });
    }

    // Create new tank
    const tank = new WaterTank({
      tankId,
      zone,
      location,
      capacity,
      sensorDeviceId,
      municipality,
      currentLevel: req.body.currentLevel || 100,
      status: 'NORMAL',
      isActive: true
    });

    await tank.save();

    res.status(201).json({
      success: true,
      message: 'Water tank created successfully',
      data: tank
    });

  } catch (error) {
    console.error('[Water Tank API] Error creating tank:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create water tank'
    });
  }
});

/**
 * PUT /api/water-tanks/:tankId
 * Update water tank configuration
 * Admin only
 */
router.put('/:tankId', async (req, res) => {
  try {
    const { tankId } = req.params;
    const updates = req.body;

    // Don't allow updating tankId, currentLevel, or status via this endpoint
    delete updates.tankId;
    delete updates.currentLevel;
    delete updates.status;

    const tank = await WaterTank.findOneAndUpdate(
      { tankId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!tank) {
      return res.status(404).json({
        success: false,
        error: `Water tank ${tankId} not found`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Water tank updated successfully',
      data: tank
    });

  } catch (error) {
    console.error('[Water Tank API] Error updating tank:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update water tank'
    });
  }
});

/**
 * DELETE /api/water-tanks/:tankId
 * Deactivate a water tank (soft delete)
 * Admin only
 */
router.delete('/:tankId', async (req, res) => {
  try {
    const { tankId } = req.params;

    const tank = await WaterTank.findOneAndUpdate(
      { tankId },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!tank) {
      return res.status(404).json({
        success: false,
        error: `Water tank ${tankId} not found`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Water tank deactivated successfully',
      data: tank
    });

  } catch (error) {
    console.error('[Water Tank API] Error deactivating tank:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deactivate water tank'
    });
  }
});

/**
 * GET /api/water-tanks/:tankId/sprinkler-status
 * Check if sprinklers can be activated for this tank's zone
 */
router.get('/:tankId/sprinkler-status', async (req, res) => {
  try {
    const { tankId } = req.params;

    const tank = await WaterTank.findOne({ tankId });

    if (!tank) {
      return res.status(404).json({
        success: false,
        error: `Water tank ${tankId} not found`
      });
    }

    const canActivate = !tank.shouldDisableSprinklers();
    const reason = canActivate 
      ? 'Water available' 
      : `Tank status: ${tank.status} (${tank.currentLevel}%)`;

    res.status(200).json({
      success: true,
      data: {
        tankId: tank.tankId,
        zone: tank.zone,
        currentLevel: tank.currentLevel,
        status: tank.status,
        canActivateSprinklers: canActivate,
        reason: reason
      }
    });

  } catch (error) {
    console.error('[Water Tank API] Error checking sprinkler status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check sprinkler status'
    });
  }
});

/**
 * POST /api/water-tanks/:tankId/refill-acknowledge
 * Municipality acknowledges refill request
 */
router.post('/:tankId/refill-acknowledge', async (req, res) => {
  try {
    const { tankId } = req.params;
    const { acknowledgedBy, responseNotes } = req.body;

    // Find active municipality alerts for this tank
    const alerts = await Alert.find({
      'resourceData.tankId': tankId,
      subcategory: 'MUNICIPALITY_NOTIFIED',
      status: 'active'
    });

    for (const alert of alerts) {
      alert.resourceData.municipalityStatus.acknowledged = true;
      alert.resourceData.municipalityStatus.acknowledgedAt = new Date();
      alert.resourceData.municipalityStatus.responseNotes = responseNotes || '';
      alert.status = 'acknowledged';
      alert.acknowledgedBy = acknowledgedBy || 'MUNICIPALITY';
      alert.acknowledgedAt = new Date();
      await alert.save();
    }

    res.status(200).json({
      success: true,
      message: 'Refill request acknowledged',
      data: {
        alertsAcknowledged: alerts.length
      }
    });

  } catch (error) {
    console.error('[Water Tank API] Error acknowledging refill:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to acknowledge refill request'
    });
  }
});

/**
 * GET /api/water-tanks/:tankId/alerts
 * Get all alerts for a specific tank
 */
router.get('/:tankId/alerts', async (req, res) => {
  try {
    const { tankId } = req.params;
    const { status, limit = 50 } = req.query;

    const query = {
      'resourceData.tankId': tankId,
      category: 'WATER_RESOURCE'
    };

    if (status) {
      query.status = status;
    }

    const alerts = await Alert.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });

  } catch (error) {
    console.error('[Water Tank API] Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tank alerts'
    });
  }
});

/**
 * GET /api/water-tanks/zone/:zone
 * Get all tanks in a specific zone
 */
router.get('/zone/:zone', async (req, res) => {
  try {
    const { zone } = req.params;

    const tanks = await WaterTank.find({ zone, isActive: true });

    res.status(200).json({
      success: true,
      count: tanks.length,
      data: tanks
    });

  } catch (error) {
    console.error('[Water Tank API] Error fetching tanks by zone:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tanks for zone'
    });
  }
});

module.exports = router;
