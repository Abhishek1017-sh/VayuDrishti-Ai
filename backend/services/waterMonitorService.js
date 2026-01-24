/**
 * Water Monitoring Service
 * Handles water level updates, threshold checks, municipality alerts,
 * and sprinkler automation control based on water availability
 */

const WaterTank = require('../models/WaterTank');
const Alert = require('../models/Alert');
const Device = require('../models/Device');
const { sendNotification } = require('./notificationService');

// Water level thresholds
const WATER_THRESHOLDS = {
  NORMAL: 40,      // > 40%
  LOW: 20,         // 20-40%
  CRITICAL: 20,    // < 20%
  EMPTY: 5         // < 5%
};

/**
 * Process incoming water level update from sensor
 * @param {String} tankId - Tank identifier
 * @param {Number} waterLevel - Current water level percentage (0-100)
 * @param {String} sensorDeviceId - ESP32 device ID
 * @returns {Object} - Updated tank and any alerts created
 */
async function processWaterLevelUpdate(tankId, waterLevel, sensorDeviceId) {
  try {
    // Validate water level
    if (waterLevel < 0 || waterLevel > 100) {
      throw new Error('Invalid water level. Must be between 0-100%');
    }

    // Find tank
    const tank = await WaterTank.findOne({ tankId });
    if (!tank) {
      throw new Error(`Water tank ${tankId} not found`);
    }

    // Verify sensor device
    if (tank.sensorDeviceId !== sensorDeviceId) {
      console.warn(`Sensor device mismatch for tank ${tankId}. Expected ${tank.sensorDeviceId}, got ${sensorDeviceId}`);
    }

    // Store previous level
    const previousLevel = tank.currentLevel;
    
    // Update tank level and status
    const updateResult = tank.updateLevel(waterLevel);
    
    // Save tank
    await tank.save();

    console.log(`[Water Monitor] Tank ${tankId}: ${previousLevel}% → ${waterLevel}% (Status: ${tank.status})`);

    // Check if threshold was crossed
    const thresholdCheck = await checkWaterThresholds(tank, waterLevel, previousLevel);

    // Handle threshold crossing
    let alerts = [];
    if (thresholdCheck.shouldAlert) {
      alerts = await handleThresholdCrossing(tank, thresholdCheck, previousLevel, waterLevel);
    }

    return {
      success: true,
      tank: {
        tankId: tank.tankId,
        currentLevel: tank.currentLevel,
        status: tank.status,
        zone: tank.zone,
        previousLevel,
        sprinklersDisabled: tank.shouldDisableSprinklers()
      },
      alerts,
      actions: thresholdCheck.actions || []
    };

  } catch (error) {
    console.error('[Water Monitor] Error processing water level:', error);
    throw error;
  }
}

/**
 * Check if water level crossed any thresholds
 * @param {Object} tank - Tank document
 * @param {Number} newLevel - New water level
 * @param {Number} previousLevel - Previous water level
 * @returns {Object} - Threshold check result
 */
async function checkWaterThresholds(tank, newLevel, previousLevel) {
  const crossing = WaterTank.checkThresholdCrossing(previousLevel, newLevel);

  if (!crossing.crossed) {
    return { shouldAlert: false };
  }

  console.log(`[Water Monitor] Threshold crossed: ${crossing.from} → ${crossing.to}`);

  // Determine actions needed
  const actions = [];
  
  // Decreasing water level - entering worse state
  if (crossing.direction === 'decreasing') {
    if (crossing.to === 'CRITICAL' || crossing.to === 'EMPTY') {
      actions.push('DISABLE_SPRINKLERS');
      actions.push('NOTIFY_MUNICIPALITY');
    }
    if (crossing.to === 'EMPTY') {
      actions.push('FORCE_SPRINKLERS_OFF');
      actions.push('ESCALATE_ALERT');
    }
  }
  
  // Increasing water level - recovery
  if (crossing.direction === 'increasing' && crossing.to === 'NORMAL') {
    actions.push('ENABLE_SPRINKLERS');
    actions.push('AUTO_ACKNOWLEDGE_ALERTS');
  }

  return {
    shouldAlert: true,
    severity: crossing.severity,
    transition: crossing,
    actions
  };
}

/**
 * Handle threshold crossing events
 * @param {Object} tank - Tank document
 * @param {Object} thresholdCheck - Result from checkWaterThresholds
 * @param {Number} previousLevel - Previous water level
 * @param {Number} newLevel - New water level
 * @returns {Array} - Created alerts
 */
async function handleThresholdCrossing(tank, thresholdCheck, previousLevel, newLevel) {
  const alerts = [];
  const { transition, severity, actions } = thresholdCheck;

  // Execute actions
  for (const action of actions) {
    switch (action) {
      case 'DISABLE_SPRINKLERS':
        await disableSprinklersForWaterShortage(tank.tankId, tank.zone);
        alerts.push(await createWaterAlert(tank, 'SPRINKLER_DISABLED_WATER', 'critical', newLevel, previousLevel));
        break;

      case 'NOTIFY_MUNICIPALITY':
        const municipalityAlert = await notifyMunicipality(tank, newLevel);
        if (municipalityAlert) alerts.push(municipalityAlert);
        break;

      case 'FORCE_SPRINKLERS_OFF':
        await forceSprinklersOff(tank.zone);
        break;

      case 'ESCALATE_ALERT':
        // Alert is created with EMERGENCY severity
        break;

      case 'ENABLE_SPRINKLERS':
        await enableSprinklersAfterRefill(tank.tankId, tank.zone);
        alerts.push(await createWaterAlert(tank, 'SPRINKLER_REENABLED', 'info', newLevel, previousLevel));
        break;

      case 'AUTO_ACKNOWLEDGE_ALERTS':
        await autoAcknowledgePreviousAlerts(tank.tankId);
        break;
    }
  }

  // Create main threshold alert
  const subcategory = transition.to === 'EMPTY' ? 'WATER_EMPTY' :
                      transition.to === 'CRITICAL' ? 'WATER_CRITICAL' :
                      transition.to === 'LOW' ? 'WATER_LOW' :
                      'WATER_REFILLED';

  const mainAlert = await createWaterAlert(tank, subcategory, severity, newLevel, previousLevel);
  alerts.unshift(mainAlert);

  return alerts;
}

/**
 * Create water-related alert
 * @param {Object} tank - Tank document
 * @param {String} subcategory - Alert subcategory
 * @param {String} severity - Alert severity
 * @param {Number} currentLevel - Current water level
 * @param {Number} previousLevel - Previous water level
 * @returns {Object} - Created alert
 */
async function createWaterAlert(tank, subcategory, severity, currentLevel, previousLevel) {
  // Check for duplicate alerts
  const isDuplicate = await preventDuplicateAlerts(tank.tankId, subcategory);
  if (isDuplicate) {
    console.log(`[Water Monitor] Duplicate alert prevented for ${tank.tankId} - ${subcategory}`);
    return null;
  }

  const typeMap = {
    WATER_LOW: 'Water Low',
    WATER_CRITICAL: 'Water Critical',
    WATER_EMPTY: 'Water Empty',
    WATER_REFILLED: 'Water Refilled',
    SPRINKLER_DISABLED_WATER: 'Sprinkler Disabled',
    SPRINKLER_REENABLED: 'Sprinkler Disabled',
    MUNICIPALITY_NOTIFIED: 'Municipality Notified'
  };

  const messageMap = {
    WATER_LOW: `Water tank ${tank.tankId} level is LOW (${currentLevel}%). Monitoring closely.`,
    WATER_CRITICAL: `⚠️ CRITICAL: Water tank ${tank.tankId} level dropped to ${currentLevel}%. Sprinklers disabled. Municipality notified.`,
    WATER_EMPTY: `🚨 EMERGENCY: Water tank ${tank.tankId} is nearly EMPTY (${currentLevel}%). All sprinklers forced OFF.`,
    WATER_REFILLED: `✅ Water tank ${tank.tankId} refilled to ${currentLevel}%. Sprinklers re-enabled.`,
    SPRINKLER_DISABLED_WATER: `Sprinkler system in ${tank.zone} disabled due to water shortage (${currentLevel}%).`,
    SPRINKLER_REENABLED: `Sprinkler system in ${tank.zone} re-enabled after water refill (${currentLevel}%).`,
    MUNICIPALITY_NOTIFIED: `Municipality notified about water shortage in ${tank.zone}.`
  };

  const alert = new Alert({
    category: subcategory === 'MUNICIPALITY_NOTIFIED' ? 'MUNICIPALITY' : 'WATER_RESOURCE',
    subcategory,
    type: typeMap[subcategory],
    severity: severity === 'EMERGENCY' ? 'critical' : severity,
    status: 'active',
    deviceId: tank.sensorDeviceId,
    facilityId: tank.zone,
    zone: tank.zone,
    location: {
      latitude: tank.location.lat,
      longitude: tank.location.long
    },
    resourceData: {
      tankId: tank.tankId,
      waterLevel: currentLevel,
      previousLevel: previousLevel,
      zone: tank.zone,
      location: tank.location,
      municipalityStatus: {
        notified: false,
        acknowledged: false
      },
      sprinklerStatus: {
        wasDisabled: subcategory === 'SPRINKLER_DISABLED_WATER',
        disabledAt: subcategory === 'SPRINKLER_DISABLED_WATER' ? new Date() : null
      }
    },
    message: messageMap[subcategory],
    timestamp: new Date()
  });

  await alert.save();

  // Add to tank's alert history
  tank.alertHistory.push({
    alertId: alert._id,
    timestamp: new Date(),
    waterLevel: currentLevel,
    alertType: subcategory
  });
  await tank.save();

  console.log(`[Water Monitor] Alert created: ${alert.type} for ${tank.tankId}`);

  return alert;
}

/**
 * Disable sprinklers in zone due to water shortage
 * @param {String} tankId - Tank identifier
 * @param {String} zone - Zone identifier
 */
async function disableSprinklersForWaterShortage(tankId, zone) {
  try {
    // Find all devices in the zone
    const devices = await Device.find({ zone, isActive: true });

    for (const device of devices) {
      // Mark device as having water restriction
      device.waterRestriction = true;
      device.waterRestrictionReason = `Water tank ${tankId} critical`;
      device.waterRestrictionSince = new Date();
      await device.save();
    }

    console.log(`[Water Monitor] Sprinklers disabled in ${zone} (${devices.length} devices affected)`);

    return {
      success: true,
      devicesAffected: devices.length,
      zone
    };
  } catch (error) {
    console.error('[Water Monitor] Error disabling sprinklers:', error);
    throw error;
  }
}

/**
 * Force all sprinklers OFF in emergency
 * @param {String} zone - Zone identifier
 */
async function forceSprinklersOff(zone) {
  try {
    const devices = await Device.find({ zone, isActive: true });

    for (const device of devices) {
      // Force pump/sprinkler relay OFF
      if (device.relayState && device.relayState.pump) {
        device.relayState.pump = false;
        device.lastRelayUpdate = new Date();
        await device.save();
        
        console.log(`[Water Monitor] EMERGENCY: Forced pump OFF for device ${device.deviceId}`);
      }
    }

    return { success: true, devicesAffected: devices.length };
  } catch (error) {
    console.error('[Water Monitor] Error forcing sprinklers off:', error);
    throw error;
  }
}

/**
 * Re-enable sprinklers after water refill
 * @param {String} tankId - Tank identifier
 * @param {String} zone - Zone identifier
 */
async function enableSprinklersAfterRefill(tankId, zone) {
  try {
    const devices = await Device.find({ 
      zone, 
      isActive: true, 
      waterRestriction: true 
    });

    for (const device of devices) {
      // Remove water restriction
      device.waterRestriction = false;
      device.waterRestrictionReason = null;
      device.waterRestrictionSince = null;
      await device.save();
    }

    console.log(`[Water Monitor] Sprinklers re-enabled in ${zone} (${devices.length} devices)`);

    return {
      success: true,
      devicesAffected: devices.length,
      zone
    };
  } catch (error) {
    console.error('[Water Monitor] Error enabling sprinklers:', error);
    throw error;
  }
}

/**
 * Notify municipality about water shortage
 * @param {Object} tank - Tank document
 * @param {Number} waterLevel - Current water level
 * @returns {Object} - Municipality notification alert
 */
async function notifyMunicipality(tank, waterLevel) {
  try {
    const municipality = tank.municipality;

    // Prepare notification data
    const notificationData = {
      subject: `🚨 Water Shortage Alert - Tank ${tank.tankId}`,
      message: `
        WATER SHORTAGE ALERT
        
        Tank ID: ${tank.tankId}
        Zone: ${tank.zone}
        Current Water Level: ${waterLevel}%
        Status: ${tank.status}
        
        Location:
        Latitude: ${tank.location.lat}
        Longitude: ${tank.location.long}
        
        Timestamp: ${new Date().toISOString()}
        
        ACTION REQUIRED: Water refill needed urgently.
        Pollution control sprinklers have been disabled until water is replenished.
        
        Contact: ${municipality.contactPerson}
        Phone: ${municipality.phone}
      `,
      recipient: {
        name: municipality.contactPerson,
        email: municipality.email,
        phone: municipality.phone
      },
      priority: waterLevel < 5 ? 'EMERGENCY' : 'HIGH',
      type: 'WATER_SHORTAGE'
    };

    // Send notification (email/SMS)
    const notificationResult = await sendNotification(notificationData);

    // Create municipality alert
    const alert = await createWaterAlert(tank, 'MUNICIPALITY_NOTIFIED', 'warning', waterLevel, tank.currentLevel);
    
    if (alert) {
      alert.resourceData.municipalityStatus.notified = true;
      alert.resourceData.municipalityStatus.notifiedAt = new Date();
      await alert.save();
    }

    console.log(`[Water Monitor] Municipality notified for tank ${tank.tankId}`);

    return alert;
  } catch (error) {
    console.error('[Water Monitor] Error notifying municipality:', error);
    // Don't throw - notification failure shouldn't block the system
    return null;
  }
}

/**
 * Prevent duplicate alerts for same tank within time window
 * @param {String} tankId - Tank identifier
 * @param {String} subcategory - Alert subcategory
 * @param {Number} timeWindowMinutes - Time window in minutes (default: 60)
 * @returns {Boolean} - True if duplicate found
 */
async function preventDuplicateAlerts(tankId, subcategory, timeWindowMinutes = 60) {
  const timeWindow = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

  const existingAlert = await Alert.findOne({
    'resourceData.tankId': tankId,
    subcategory,
    status: 'active',
    timestamp: { $gte: timeWindow }
  });

  return !!existingAlert;
}

/**
 * Auto-acknowledge previous critical alerts after refill
 * @param {String} tankId - Tank identifier
 */
async function autoAcknowledgePreviousAlerts(tankId) {
  try {
    const criticalAlerts = await Alert.find({
      'resourceData.tankId': tankId,
      category: 'WATER_RESOURCE',
      subcategory: { $in: ['WATER_CRITICAL', 'WATER_EMPTY', 'SPRINKLER_DISABLED_WATER'] },
      status: 'active'
    });

    for (const alert of criticalAlerts) {
      alert.status = 'acknowledged';
      alert.acknowledgedBy = 'SYSTEM_AUTO';
      alert.acknowledgedAt = new Date();
      alert.notes = 'Auto-acknowledged after water tank refill';
      await alert.save();
    }

    console.log(`[Water Monitor] Auto-acknowledged ${criticalAlerts.length} alerts for tank ${tankId}`);

    return criticalAlerts.length;
  } catch (error) {
    console.error('[Water Monitor] Error auto-acknowledging alerts:', error);
    return 0;
  }
}

/**
 * Check if sprinklers can be activated for a device
 * @param {String} deviceId - Device identifier
 * @returns {Object} - { allowed: Boolean, reason: String }
 */
async function canActivateSprinklers(deviceId) {
  try {
    const device = await Device.findOne({ deviceId });
    if (!device) {
      return { allowed: false, reason: 'Device not found' };
    }

    // Check if device has water restriction
    if (device.waterRestriction) {
      return { 
        allowed: false, 
        reason: device.waterRestrictionReason || 'Water shortage in zone'
      };
    }

    // Find tank for device's zone
    const tank = await WaterTank.findOne({ zone: device.zone, isActive: true });
    if (!tank) {
      return { 
        allowed: true, 
        reason: 'No water tank monitoring for this zone'
      };
    }

    // Check tank status
    if (tank.shouldDisableSprinklers()) {
      return {
        allowed: false,
        reason: `Water tank ${tank.tankId} status: ${tank.status} (${tank.currentLevel}%)`
      };
    }

    return { allowed: true, reason: 'Water available' };
  } catch (error) {
    console.error('[Water Monitor] Error checking sprinkler availability:', error);
    // Fail-safe: allow activation if check fails
    return { allowed: true, reason: 'Check failed - fail-safe allow' };
  }
}

module.exports = {
  processWaterLevelUpdate,
  checkWaterThresholds,
  disableSprinklersForWaterShortage,
  enableSprinklersAfterRefill,
  notifyMunicipality,
  preventDuplicateAlerts,
  autoAcknowledgePreviousAlerts,
  canActivateSprinklers,
  forceSprinklersOff,
  WATER_THRESHOLDS
};
