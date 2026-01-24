/**
 * Automation Service
 * Handles automatic corrective actions based on AQI levels
/**
 * Automation Service
 * Handles automatic corrective actions based on AQI levels
 */

const dataStore = require('../utils/dataStore');

// Track automation state
let automationState = {
  waterSprinkling: {
    active: false,
    lastActivated: null,
    cooldownUntil: null
  },
  ventilation: {
    active: false,
    lastActivated: null,
    cooldownUntil: null
  },
  droneSystem: {
    active: false,
    lastActivated: null,
    activatedAt: null,
    zone: null,
    deviceId: null,
    aqiAtActivation: null
  },
  emergencyAlert: {
    active: false,
    lastTriggered: null,
    zone: null,
    fireBrigadeNotified: false,
    emailSent: false
  },
  safetyDelay: {
    active: false,
    delayUntil: null
  }
};

// Configuration from environment
const AQI_ALERT_THRESHOLD = parseInt(process.env.AQI_ALERT_THRESHOLD) || 100;
const AQI_CRITICAL_THRESHOLD = parseInt(process.env.AQI_CRITICAL_THRESHOLD) || 150;
const AQI_DRONE_THRESHOLD = parseInt(process.env.AQI_DRONE_THRESHOLD) || 500;
const AQI_EMERGENCY_THRESHOLD = parseInt(process.env.AQI_EMERGENCY_THRESHOLD) || 1000;
const SPRINKLING_COOLDOWN_MS = (parseInt(process.env.SPRINKLING_COOLDOWN_MINUTES) || 30) * 60 * 1000;
const VENTILATION_COOLDOWN_MS = (parseInt(process.env.VENTILATION_COOLDOWN_MINUTES) || 15) * 60 * 1000;
const SAFETY_DELAY_MS = (parseInt(process.env.SAFETY_DELAY_SECONDS) || 5) * 1000;

/**
 * Process AQI reading and trigger automation if needed
 */
exports.processAQIReading = (aqiData) => {
  const { value } = aqiData;
  
  if (value >= AQI_EMERGENCY_THRESHOLD) {
    this.triggerEmergencyActions(aqiData);
  } else if (value >= AQI_DRONE_THRESHOLD) {
    this.triggerDroneActions(aqiData);
  } else if (value >= AQI_CRITICAL_THRESHOLD) {
    this.triggerCriticalActions(aqiData);
  } else if (value >= AQI_ALERT_THRESHOLD) {
    this.triggerAlertActions(aqiData);
  } else {
    this.deactivateActions();
  }
  
  return this.getAutomationStatus();
};

/**
 * Trigger critical level actions
 */
exports.triggerCriticalActions = (aqiData) => {
  console.log(`🚨 CRITICAL AQI: ${aqiData.value} - Triggering all actions`);
  
  dataStore.addAlert({
    severity: 'critical',
    message: `Critical air quality detected: AQI ${aqiData.value}`,
    aqiValue: aqiData.value,
    category: aqiData.category,
    actions: ['water_sprinkling', 'ventilation', 'notification']
  });
  
  this.activateWaterSprinkling();
  this.activateVentilation();
};

/**
 * Trigger alert level actions
 */
exports.triggerAlertActions = (aqiData) => {
  console.log(`⚠️ ALERT AQI: ${aqiData.value} - Triggering preventive actions`);
  
  dataStore.addAlert({
    severity: 'warning',
    message: `Poor air quality detected: AQI ${aqiData.value}`,
    aqiValue: aqiData.value,
    category: aqiData.category,
    actions: ['ventilation', 'notification']
  });
  
  this.activateVentilation();
};

/**
 * Activate water sprinkling system
 */
exports.activateWaterSprinkling = () => {
  const now = Date.now();
  
  if (automationState.waterSprinkling.cooldownUntil && now < automationState.waterSprinkling.cooldownUntil) {
    const remainingMinutes = Math.ceil((automationState.waterSprinkling.cooldownUntil - now) / 60000);
    console.log(`💧 Water sprinkling on cooldown (${remainingMinutes} min remaining)`);
    return false;
  }
  
  if (!automationState.safetyDelay.active) {
    automationState.safetyDelay.active = true;
    automationState.safetyDelay.delayUntil = now + SAFETY_DELAY_MS;
    
    setTimeout(() => {
      automationState.safetyDelay.active = false;
      this.executeWaterSprinkling();
    }, SAFETY_DELAY_MS);
    
    console.log(`⏳ Safety delay activated (${SAFETY_DELAY_MS / 1000}s)`);
  }
  
  return true;
};

/**
 * Execute water sprinkling activation
 */
exports.executeWaterSprinkling = () => {
  const now = Date.now();
  
  automationState.waterSprinkling.active = true;
  automationState.waterSprinkling.lastActivated = new Date(now).toISOString();
  automationState.waterSprinkling.cooldownUntil = now + SPRINKLING_COOLDOWN_MS;
  
  console.log('💧 Water sprinkling system ACTIVATED');
};

/**
 * Activate ventilation system
 */
exports.activateVentilation = () => {
  const now = Date.now();
  
  if (automationState.ventilation.cooldownUntil && now < automationState.ventilation.cooldownUntil) {
    const remainingMinutes = Math.ceil((automationState.ventilation.cooldownUntil - now) / 60000);
    console.log(`🌬️ Ventilation on cooldown (${remainingMinutes} min remaining)`);
    return false;
  }
  
  automationState.ventilation.active = true;
  automationState.ventilation.lastActivated = new Date(now).toISOString();
  automationState.ventilation.cooldownUntil = now + VENTILATION_COOLDOWN_MS;
  
  console.log('🌬️ Ventilation system ACTIVATED');
  
  return true;
};

/**
 * Trigger emergency actions (AQI >= 1000)
 */
exports.triggerEmergencyActions = async (aqiData) => {
  const { value, zone, deviceId } = aqiData;
  console.log(`🚨🚨 EMERGENCY - AQI: ${value} in ${zone} - Notifying Fire Brigade`);
  
  const notificationService = require('./notificationService');
  const FireBrigadeContact = require('../models/FireBrigadeContact');
  const Alert = require('../models/Alert');
  
  try {
    await Alert.create({
      severity: 'Emergency',
      message: `🔥 EMERGENCY: Critical air quality detected - AQI ${value} in ${zone}`,
      aqiValue: value,
      category: aqiData.category || 'Hazardous',
      zone,
      deviceId,
      actions: ['fire_brigade_notified', 'drone_activated', 'water_sprinkling', 'ventilation'],
      isAcknowledged: false
    });
  } catch (err) {
    console.error('Error creating emergency alert:', err);
  }
  
  try {
    const fireBrigade = await FireBrigadeContact.findOne({ zone, isActive: true });
    
    if (fireBrigade && !automationState.emergencyAlert.emailSent) {
      const emailSent = await notificationService.sendFireBrigadeEmail({
        zone,
        aqi: value,
        deviceId,
        fireBrigadeEmail: fireBrigade.email,
        fireBrigadeName: fireBrigade.contactPerson || fireBrigade.zoneName,
        phone: fireBrigade.phone,
        address: fireBrigade.address
      });
      
      automationState.emergencyAlert = {
        active: true,
        lastTriggered: new Date().toISOString(),
        zone,
        fireBrigadeNotified: true,
        emailSent
      };
      
      console.log(`📧 Fire Brigade ${emailSent ? 'NOTIFIED' : 'NOTIFICATION FAILED'} - ${fireBrigade.email}`);
    } else if (!fireBrigade) {
      console.warn(`⚠️ No fire brigade contact found for ${zone}`);
      automationState.emergencyAlert = {
        active: true,
        lastTriggered: new Date().toISOString(),
        zone,
        fireBrigadeNotified: false,
        emailSent: false
      };
    }
  } catch (err) {
    console.error('Error notifying fire brigade:', err);
  }
  
  this.activateDroneSystem(aqiData);
  this.activateWaterSprinkling();
  this.activateVentilation();
};

/**
 * Trigger drone activation (AQI >= 500)
 */
exports.triggerDroneActions = (aqiData) => {
  const { value, zone, deviceId } = aqiData;
  console.log(`🚁 DRONE THRESHOLD REACHED - AQI: ${value} in ${zone}`);
  
  const Alert = require('../models/Alert');
  
  Alert.create({
    severity: 'Critical',
    message: `🚁 Drone system activated - AQI ${value} in ${zone}`,
    aqiValue: value,
    category: aqiData.category || 'Severe',
    zone,
    deviceId,
    actions: ['drone_activated', 'water_sprinkling', 'ventilation'],
    isAcknowledged: false
  }).catch(err => console.error('Error creating drone alert:', err));
  
  this.activateDroneSystem(aqiData);
  this.activateWaterSprinkling();
  this.activateVentilation();
};

/**
 * Activate drone system with nitrogen solution
 */
exports.activateDroneSystem = (aqiData) => {
  const { zone, deviceId, value } = aqiData;
  
  if (automationState.droneSystem.active) {
    console.log('🚁 Drone system already active');
    return false;
  }
  
  const now = Date.now();
  
  automationState.droneSystem = {
    active: true,
    lastActivated: new Date(now).toISOString(),
    activatedAt: new Date(now).toISOString(),
    zone,
    deviceId,
    aqiAtActivation: value
  };
  
  console.log(`🚁 DRONE SYSTEM ACTIVATED in ${zone}`);
  console.log(`   📍 Device: ${deviceId}`);
  console.log(`   💨 AQI: ${value}`);
  console.log(`   💧 Deploying nitrogen solution...`);
  
  return true;
};

/**
 * Deactivate all actions
 */
exports.deactivateActions = () => {
  if (automationState.waterSprinkling.active || automationState.ventilation.active || automationState.droneSystem.active) {
    console.log('✅ AQI normalized - Deactivating systems');
    
    automationState.waterSprinkling.active = false;
    automationState.ventilation.active = false;
    
    if (automationState.droneSystem.active) {
      console.log('🚁 Deactivating drone system');
      automationState.droneSystem.active = false;
    }
    
    if (automationState.emergencyAlert.active) {
      console.log('🔔 Clearing emergency alert status');
      automationState.emergencyAlert.active = false;
    }
  }
};

/**
 * Get current automation status
 */
exports.getAutomationStatus = () => {
  const now = Date.now();
  
  return {
    waterSprinkling: {
      active: automationState.waterSprinkling.active,
      lastActivated: automationState.waterSprinkling.lastActivated,
      onCooldown: automationState.waterSprinkling.cooldownUntil > now,
      cooldownRemaining: automationState.waterSprinkling.cooldownUntil > now 
        ? Math.ceil((automationState.waterSprinkling.cooldownUntil - now) / 60000) 
        : 0
    },
    ventilation: {
      active: automationState.ventilation.active,
      lastActivated: automationState.ventilation.lastActivated,
      onCooldown: automationState.ventilation.cooldownUntil > now,
      cooldownRemaining: automationState.ventilation.cooldownUntil > now 
        ? Math.ceil((automationState.ventilation.cooldownUntil - now) / 60000) 
        : 0
    },
    droneSystem: {
      active: automationState.droneSystem.active,
      lastActivated: automationState.droneSystem.lastActivated,
      zone: automationState.droneSystem.zone,
      deviceId: automationState.droneSystem.deviceId,
      aqiAtActivation: automationState.droneSystem.aqiAtActivation
    },
    emergencyAlert: {
      active: automationState.emergencyAlert.active,
      lastTriggered: automationState.emergencyAlert.lastTriggered,
      zone: automationState.emergencyAlert.zone,
      fireBrigadeNotified: automationState.emergencyAlert.fireBrigadeNotified,
      emailSent: automationState.emergencyAlert.emailSent
    },
    safetyDelay: {
      active: automationState.safetyDelay.active,
      remaining: automationState.safetyDelay.delayUntil > now 
        ? Math.ceil((automationState.safetyDelay.delayUntil - now) / 1000) 
        : 0
    },
    thresholds: {
      alert: AQI_ALERT_THRESHOLD,
      critical: AQI_CRITICAL_THRESHOLD,
      drone: AQI_DRONE_THRESHOLD,
      emergency: AQI_EMERGENCY_THRESHOLD
    }
  };
};
