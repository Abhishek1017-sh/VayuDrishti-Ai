/**
 * Drone Controller
 * Handles drone activation for pollution mitigation
 * 
 * Drone capabilities:
 * - Water spray for smoke suppression
 * - NO₂ (Nitrogen Dioxide) spray for pollution neutralization
 * - Autonomous zone coverage
 */

const Device = require('../models/Device');
const AutomationLog = require('../models/AutomationLog');

/**
 * Activate drone for pollution mitigation
 * 
 * POST /api/drone/activate
 * Body: {
 *   deviceId: string,
 *   zone: string,
 *   duration: number (seconds),
 *   mode: 'water' | 'no2' | 'water_and_no2'
 * }
 */
exports.activateDrone = async (req, res) => {
  try {
    const { deviceId, zone, duration = 300, mode = 'water_and_no2' } = req.body;

    // Validate input
    if (!deviceId || !zone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: deviceId, zone'
      });
    }

    // Check if drone is available
    const droneId = `DRONE-${zone}-01`;
    
    // Log automation action
    const automationLog = await AutomationLog.create({
      deviceId,
      action: 'DRONE_ACTIVATED',
      droneId,
      mode,
      duration,
      zone,
      triggeredBy: 'ML_POLLUTION_DETECTION',
      status: 'active',
      startTime: new Date(),
      estimatedEndTime: new Date(Date.now() + duration * 1000)
    });

    // TODO: Send command to actual drone hardware via IoT gateway
    console.log(`🚁 Drone ${droneId} activated:`, {
      mode,
      duration,
      zone,
      deviceId
    });

    res.status(200).json({
      success: true,
      message: 'Drone activated successfully',
      droneId,
      mode,
      duration,
      zone,
      automationLogId: automationLog._id,
      estimatedCompletion: automationLog.estimatedEndTime
    });

  } catch (error) {
    console.error('Error activating drone:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate drone',
      error: error.message
    });
  }
};

/**
 * Deactivate drone
 * 
 * POST /api/drone/deactivate
 */
exports.deactivateDrone = async (req, res) => {
  try {
    const { droneId, reason } = req.body;

    if (!droneId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: droneId'
      });
    }

    // Update automation log
    await AutomationLog.updateMany(
      { droneId, status: 'active' },
      { 
        status: 'completed',
        endTime: new Date(),
        completionReason: reason || 'Manual deactivation'
      }
    );

    console.log(`🚁 Drone ${droneId} deactivated`);

    res.status(200).json({
      success: true,
      message: 'Drone deactivated successfully',
      droneId
    });

  } catch (error) {
    console.error('Error deactivating drone:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate drone',
      error: error.message
    });
  }
};

/**
 * Get drone status
 * 
 * GET /api/drone/status/:zone
 */
exports.getDroneStatus = async (req, res) => {
  try {
    const { zone } = req.params;
    const droneId = `DRONE-${zone}-01`;

    // Get active drone missions
    const activeMissions = await AutomationLog.find({
      droneId,
      status: 'active'
    }).sort({ startTime: -1 });

    // Get recent completed missions
    const recentMissions = await AutomationLog.find({
      droneId,
      status: 'completed'
    })
    .sort({ endTime: -1 })
    .limit(10);

    res.status(200).json({
      success: true,
      droneId,
      zone,
      isActive: activeMissions.length > 0,
      activeMissions,
      recentMissions
    });

  } catch (error) {
    console.error('Error getting drone status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get drone status',
      error: error.message
    });
  }
};

/**
 * Emergency stop for all drones
 * 
 * POST /api/drone/emergency-stop
 */
exports.emergencyStop = async (req, res) => {
  try {
    const { reason = 'Emergency stop activated' } = req.body;

    // Deactivate all active drones
    const result = await AutomationLog.updateMany(
      { action: 'DRONE_ACTIVATED', status: 'active' },
      {
        status: 'emergency_stopped',
        endTime: new Date(),
        completionReason: reason
      }
    );

    console.log(`🚨 EMERGENCY STOP: ${result.modifiedCount} drones stopped`);

    res.status(200).json({
      success: true,
      message: 'Emergency stop executed',
      dronesAffected: result.modifiedCount,
      reason
    });

  } catch (error) {
    console.error('Error executing emergency stop:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute emergency stop',
      error: error.message
    });
  }
};
