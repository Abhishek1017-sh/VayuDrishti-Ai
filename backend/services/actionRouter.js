/**
 * Action Router Service
 * 
 * Routes ML classification decisions to appropriate automation actions.
 * Implements safety-first logic:
 * - FIRE: Emergency alerts, fire station notification, NO drone/sprinklers
 * - POLLUTION: Drone activation, sprinklers (if water available), ventilation
 * - Water Safety: Check water tank status before sprinkler activation
 */

const MLService = require('./mlService');
const waterMonitorService = require('./waterMonitorService');

class ActionRouter {
  /**
   * Process sensor event and route to appropriate actions
   * 
   * @param {Object} params
   * @param {number} params.aqi - Current AQI value
   * @param {Array} params.sensorWindow - 60 seconds of sensor readings
   * @param {string} params.deviceId - Device identifier
   * @param {string} params.zone - Geographic zone
   * @param {number} params.latitude - Device latitude
   * @param {number} params.longitude - Device longitude
   * @returns {Promise<Object>} Action result
   */
  static async processEvent(params) {
    const {
      aqi,
      sensorWindow,
      deviceId,
      zone,
      latitude,
      longitude
    } = params;

    try {
      // Step 1: Check AQI threshold
      if (aqi < 500) {
        return {
          triggered: false,
          reason: `AQI ${aqi} below critical threshold (500)`,
          actions: []
        };
      }

      // Step 2: Prepare sensor data for ML
      const sensorData = {
        smoke: sensorWindow.map(r => r.smoke),
        humidity: sensorWindow.map(r => r.humidity),
        temperature: sensorWindow.map(r => r.temperature),
        aqi: aqi
      };

      // Step 3: Get ML classification
      const mlResult = await MLService.classifyEvent(sensorData);

      if (!mlResult.shouldRunML && mlResult.shouldRunML !== undefined) {
        return {
          triggered: false,
          reason: mlResult.message,
          actions: []
        };
      }

      const { cause, confidence, decision_source } = mlResult;

      // Step 4: Route to appropriate actions
      let actions = [];
      
      if (cause === 'FIRE') {
        actions = await this._handleFireEvent({
          deviceId,
          zone,
          latitude,
          longitude,
          aqi,
          confidence,
          decision_source
        });
      } else if (cause === 'POLLUTION') {
        actions = await this._handlePollutionEvent({
          deviceId,
          zone,
          latitude,
          longitude,
          aqi,
          confidence,
          decision_source
        });
      }

      return {
        triggered: true,
        cause,
        confidence,
        decision_source,
        aqi,
        deviceId,
        zone,
        actions,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Action Router Error:', error.message);
      
      // FAIL-SAFE: Treat as FIRE
      const actions = await this._handleFireEvent({
        deviceId,
        zone,
        latitude,
        longitude,
        aqi,
        confidence: 0.0,
        decision_source: 'error_fail_safe'
      });

      return {
        triggered: true,
        cause: 'FIRE',
        confidence: 0.0,
        decision_source: 'error_fail_safe',
        error: error.message,
        aqi,
        deviceId,
        zone,
        actions,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Handle FIRE event
   * 
   * Actions:
   * - Create EMERGENCY alert
   * - Notify fire station
   * - DO NOT activate drone or sprinklers
   * 
   * @private
   */
  static async _handleFireEvent(params) {
    const {
      deviceId,
      zone,
      latitude,
      longitude,
      aqi,
      confidence,
      decision_source
    } = params;

    const actions = [];

    try {
      // Action 1: Create EMERGENCY alert
      const alertData = {
        type: 'FIRE_DETECTED',
        severity: 'EMERGENCY',
        deviceId,
        zone,
        location: { latitude, longitude },
        aqi,
        mlConfidence: confidence,
        decisionSource: decision_source,
        message: `FIRE DETECTED - AQI: ${aqi} | Confidence: ${(confidence * 100).toFixed(1)}%`,
        automationBlocked: 'Drone and sprinklers DISABLED for safety',
        timestamp: new Date()
      };

      // Import alert controller (will be created next)
      const Alert = require('../models/Alert');
      const alert = await Alert.create(alertData);
      
      actions.push({
        action: 'emergency_alert_created',
        alertId: alert._id,
        status: 'success'
      });

      // Action 2: Notify fire station
      const fireStationResult = await this._notifyFireStation({
        zone,
        deviceId,
        latitude,
        longitude,
        aqi,
        confidence
      });

      actions.push({
        action: 'fire_station_notified',
        ...fireStationResult,
        status: fireStationResult.success ? 'success' : 'failed'
      });

      // Action 3: Log blocked automations
      actions.push({
        action: 'automation_blocked',
        blocked: ['drone', 'sprinklers'],
        reason: 'FIRE safety protocol',
        status: 'success'
      });

    } catch (error) {
      console.error('Error handling FIRE event:', error);
      actions.push({
        action: 'error',
        message: error.message,
        status: 'failed'
      });
    }

    return actions;
  }

  /**
   * Handle POLLUTION event
   * 
   * Actions:
   * - Activate drone (water + NO₂ spray)
   * - Activate sprinklers
   * - Enable ventilation safe mode
   * - Create CRITICAL alert
   * 
   * @private
   */
  static async _handlePollutionEvent(params) {
    const {
      deviceId,
      zone,
      latitude,
      longitude,
      aqi,
      confidence,
      decision_source
    } = params;

    const actions = [];

    try {
      // Action 1: Create CRITICAL alert
      const Alert = require('../models/Alert');
      const alertData = {
        type: 'POLLUTION_CRITICAL',
        severity: 'CRITICAL',
        deviceId,
        zone,
        location: { latitude, longitude },
        aqi,
        mlConfidence: confidence,
        decisionSource: decision_source,
        message: `CRITICAL POLLUTION - AQI: ${aqi} | Confidence: ${(confidence * 100).toFixed(1)}%`,
        automationsActivated: ['drone', 'sprinklers', 'ventilation'],
        timestamp: new Date()
      };

      const alert = await Alert.create(alertData);
      
      actions.push({
        action: 'critical_alert_created',
        alertId: alert._id,
        status: 'success'
      });

      // Action 2: Activate drone
      try {
        const droneResult = await this._activateDrone(deviceId, zone);
        actions.push({
          action: 'drone_activated',
          ...droneResult,
          status: droneResult.success ? 'success' : 'failed'
        });
      } catch (error) {
        actions.push({
          action: 'drone_activation_failed',
          error: error.message,
          status: 'failed'
        });
      }

      // Action 3: Activate sprinklers
      try {
        const sprinklerResult = await this._activateSprinklers(deviceId);
        actions.push({
          action: 'sprinklers_activated',
          ...sprinklerResult,
          status: sprinklerResult.success ? 'success' : 'failed'
        });
      } catch (error) {
        actions.push({
          action: 'sprinkler_activation_failed',
          error: error.message,
          status: 'failed'
        });
      }

      // Action 4: Enable ventilation safe mode
      try {
        const ventilationResult = await this._enableVentilation(deviceId);
        actions.push({
          action: 'ventilation_enabled',
          ...ventilationResult,
          status: ventilationResult.success ? 'success' : 'failed'
        });
      } catch (error) {
        actions.push({
          action: 'ventilation_failed',
          error: error.message,
          status: 'failed'
        });
      }

    } catch (error) {
      console.error('Error handling POLLUTION event:', error);
      actions.push({
        action: 'error',
        message: error.message,
        status: 'failed'
      });
    }

    return actions;
  }

  /**
   * Notify nearest fire station
   * @private
   */
  static async _notifyFireStation(params) {
    const { zone, deviceId, latitude, longitude, aqi, confidence } = params;

    try {
      const FireBrigadeContact = require('../models/FireBrigadeContact');
      
      // Find nearest fire station by zone
      const fireStation = await FireBrigadeContact.findOne({ zone }).sort({ priority: 1 });

      if (!fireStation) {
        return {
          success: false,
          message: `No fire station found for zone: ${zone}`
        };
      }

      // Prepare emergency message
      const emergencyMessage = {
        alert: 'FIRE DETECTED',
        zone,
        deviceId,
        coordinates: { latitude, longitude },
        aqi,
        mlConfidence: `${(confidence * 100).toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        contact: fireStation.phone
      };

      // TODO: Integrate with SMS/notification service
      console.log('🚒 FIRE STATION NOTIFICATION:', emergencyMessage);

      return {
        success: true,
        fireStation: fireStation.name,
        contact: fireStation.phone,
        message: emergencyMessage
      };

    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Activate drone for pollution mitigation
   * @private
   */
  static async _activateDrone(deviceId, zone) {
    // TODO: Integrate with drone controller
    console.log(`🚁 Activating drone for device ${deviceId} in zone ${zone}`);
    
    return {
      success: true,
      droneId: `DRONE-${zone}-01`,
      mode: 'water_and_no2_spray',
      duration: 300 // seconds
    };
  }

  /**
   * Activate sprinkler system
   * NOW WITH WATER SAFETY CHECK
   * @private
   */
  static async _activateSprinklers(deviceId) {
    try {
      // SAFETY CHECK: Verify water availability before activation
      const waterCheck = await waterMonitorService.canActivateSprinklers(deviceId);

      if (!waterCheck.allowed) {
        console.log(`💦❌ Sprinkler activation BLOCKED for device ${deviceId}: ${waterCheck.reason}`);
        
        return {
          success: false,
          blocked: true,
          reason: waterCheck.reason,
          message: 'Sprinkler activation prevented due to water shortage'
        };
      }

      // Water available - proceed with activation
      console.log(`💦✅ Activating sprinklers for device ${deviceId} - Water available`);
      
      // TODO: Integrate with sprinkler controller hardware
      // Send command to ESP32 to turn pump relay ON
      
      return {
        success: true,
        duration: 180, // seconds
        waterStatus: 'available'
      };

    } catch (error) {
      console.error(`Error activating sprinklers for ${deviceId}:`, error);
      
      // FAIL-SAFE: If water check fails, allow activation (system availability priority)
      return {
        success: true,
        duration: 180,
        waterStatus: 'unknown',
        warning: 'Water check failed - proceeding with fail-safe activation'
      };
    }
  }

  /**
   * Enable ventilation safe mode
   * @private
   */
  static async _enableVentilation(deviceId) {
    // TODO: Integrate with ventilation controller
    console.log(`🌀 Enabling ventilation for device ${deviceId}`);
    
    return {
      success: true,
      mode: 'safe_mode',
      fanSpeed: 80 // percentage
    };
  }
}

module.exports = ActionRouter;
