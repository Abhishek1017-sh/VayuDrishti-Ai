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
  safetyDelay: {
    active: false,
    delayUntil: null
  }
};

// Configuration from environment
const AQI_ALERT_THRESHOLD = parseInt(process.env.AQI_ALERT_THRESHOLD) || 100;
const AQI_CRITICAL_THRESHOLD = parseInt(process.env.AQI_CRITICAL_THRESHOLD) || 150;
const SPRINKLING_COOLDOWN_MS = (parseInt(process.env.SPRINKLING_COOLDOWN_MINUTES) || 30) * 60 * 1000;
const VENTILATION_COOLDOWN_MS = (parseInt(process.env.VENTILATION_COOLDOWN_MINUTES) || 15) * 60 * 1000;
const SAFETY_DELAY_MS = (parseInt(process.env.SAFETY_DELAY_SECONDS) || 5) * 1000;

/**
 * Process AQI reading and trigger automation if needed
 */
exports.processAQIReading = (aqiData) => {
  const { value, category } = aqiData;
  
  // Check if automation should be triggered
  if (value >= AQI_CRITICAL_THRESHOLD) {
    this.triggerCriticalActions(aqiData);
  } else if (value >= AQI_ALERT_THRESHOLD) {
    this.triggerAlertActions(aqiData);
  } else {
    // AQI is acceptable, deactivate if active
    this.deactivateActions();
  }
  
  return this.getAutomationStatus();
};

/**
 * Trigger critical level actions
 */
exports.triggerCriticalActions = (aqiData) => {
  console.log(`🚨 CRITICAL AQI: ${aqiData.value} - Triggering all actions`);
  
  // Create critical alert
  dataStore.addAlert({
    severity: 'critical',
    message: `Critical air quality detected: AQI ${aqiData.value}`,
    aqiValue: aqiData.value,
    category: aqiData.category,
    actions: ['water_sprinkling', 'ventilation', 'notification']
  });
  
  // Activate water sprinkling
  this.activateWaterSprinkling();
  
  // Activate ventilation
  this.activateVentilation();
};

/**
 * Trigger alert level actions
 */
exports.triggerAlertActions = (aqiData) => {
  console.log(`⚠️ ALERT AQI: ${aqiData.value} - Triggering preventive actions`);
  
  // Create alert
  dataStore.addAlert({
    severity: 'warning',
    message: `Poor air quality detected: AQI ${aqiData.value}`,
    aqiValue: aqiData.value,
    category: aqiData.category,
    actions: ['ventilation', 'notification']
  });
  
  // Activate ventilation only
  this.activateVentilation();
};

/**
 * Activate water sprinkling system
 */
exports.activateWaterSprinkling = () => {
  const now = Date.now();
  
  // Check cooldown
  if (automationState.waterSprinkling.cooldownUntil && now < automationState.waterSprinkling.cooldownUntil) {
    const remainingMinutes = Math.ceil((automationState.waterSprinkling.cooldownUntil - now) / 60000);
    console.log(`💧 Water sprinkling on cooldown (${remainingMinutes} min remaining)`);
    return false;
  }
  
  // Apply safety delay
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
  
  // In production, send signal to IoT device
  // mqtt.publish('iot/sprinkling', 'ON');
};

/**
 * Activate ventilation system
 */
exports.activateVentilation = () => {
  const now = Date.now();
  
  // Check cooldown
  if (automationState.ventilation.cooldownUntil && now < automationState.ventilation.cooldownUntil) {
    const remainingMinutes = Math.ceil((automationState.ventilation.cooldownUntil - now) / 60000);
    console.log(`🌬️ Ventilation on cooldown (${remainingMinutes} min remaining)`);
    return false;
  }
  
  automationState.ventilation.active = true;
  automationState.ventilation.lastActivated = new Date(now).toISOString();
  automationState.ventilation.cooldownUntil = now + VENTILATION_COOLDOWN_MS;
  
  console.log('🌬️ Ventilation system ACTIVATED');
  
  // In production, send signal to IoT device
  // mqtt.publish('iot/ventilation', 'ON');
  
  return true;
};

/**
 * Deactivate all actions
 */
exports.deactivateActions = () => {
  if (automationState.waterSprinkling.active || automationState.ventilation.active) {
    console.log('✅ AQI normalized - Deactivating systems');
    
    automationState.waterSprinkling.active = false;
    automationState.ventilation.active = false;
    
    // In production, send signals to IoT devices
    // mqtt.publish('iot/sprinkling', 'OFF');
    // mqtt.publish('iot/ventilation', 'OFF');
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
    safetyDelay: {
      active: automationState.safetyDelay.active,
      remaining: automationState.safetyDelay.delayUntil > now 
        ? Math.ceil((automationState.safetyDelay.delayUntil - now) / 1000) 
        : 0
    },
    thresholds: {
      alert: AQI_ALERT_THRESHOLD,
      critical: AQI_CRITICAL_THRESHOLD
    }
  };
};
