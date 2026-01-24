const Alert = require('../models/Alert');
const Device = require('../models/Device');
const FireBrigadeContact = require('../models/FireBrigadeContact');
const AutomationLog = require('../models/AutomationLog');
const notificationService = require('./notificationService');

class AutomationService {
  // Check AQI thresholds and trigger automations
  static async processAQIThreshold(deviceId, aqi, zone) {
    try {
      let automationTriggered = false;

      // EMERGENCY_ALERT: AQI >= 1000
      if (aqi >= 1000) {
        await this.triggerEmergencyAlert(deviceId, aqi, zone);
        automationTriggered = true;
      }
      // DRONE_ACTIVATION: AQI >= 500 and < 1000
      else if (aqi >= 500) {
        await this.triggerDroneActivation(deviceId, aqi, zone);
        automationTriggered = true;
      }

      return automationTriggered;
    } catch (error) {
      console.error('Error processing AQI threshold:', error);
      throw error;
    }
  }

  // Trigger emergency alert (AQI >= 1000)
  static async triggerEmergencyAlert(deviceId, aqi, zone) {
    try {
      // Create alert record
      const alert = new Alert({
        type: 'EMERGENCY_AQI_ALERT',
        severity: 'critical',
        deviceId,
        zone,
        readings: {
          smoke: aqi
        },
        automationActions: ['EMERGENCY_EMAIL', 'FIRE_BRIGADE_ALERT'],
        status: 'active',
        message: `EMERGENCY: AQI level ${aqi} detected. Fire brigade alerted.`
      });

      await alert.save();

      // Get fire brigade contact for this zone
      const fireBrigade = await FireBrigadeContact.findOne({ zone, isActive: true });

      if (fireBrigade) {
        // Send email to fire brigade
        await notificationService.sendEmergencyAlert({
          alertId: alert._id,
          zone,
          aqi,
          deviceId,
          fireBrigadeEmail: fireBrigade.email,
          fireBrigadeName: fireBrigade.contactPerson || 'Fire Brigade'
        });

        // Log automation action
        const automationLog = new AutomationLog({
          alertId: alert._id,
          deviceId,
          zone,
          aqi,
          trigger: 'EMERGENCY_ALERT',
          action: 'EMAIL_SENT',
          details: {
            emailSent: true,
            recipients: [fireBrigade.email]
          }
        });

        await automationLog.save();
      }

      return alert;
    } catch (error) {
      console.error('Error triggering emergency alert:', error);
      throw error;
    }
  }

  // Trigger drone activation (AQI >= 500)
  static async triggerDroneActivation(deviceId, aqi, zone) {
    try {
      // Create alert record
      const alert = new Alert({
        type: 'HIGH_AQI_ALERT',
        severity: 'warning',
        deviceId,
        zone,
        readings: {
          smoke: aqi
        },
        automationActions: ['DRONE_ACTIVATE', 'FAN_ON'],
        status: 'active',
        message: `AQI level ${aqi} detected. Drone activated for AQI reduction.`
      });

      await alert.save();

      // Trigger drone activation
      const droneActivated = await this.activateDrone(deviceId, zone, aqi);

      // Log automation action
      const automationLog = new AutomationLog({
        alertId: alert._id,
        deviceId,
        zone,
        aqi,
        trigger: 'DRONE_ACTIVATION',
        action: droneActivated ? 'DRONE_ACTIVATED' : 'PENDING',
        details: {
          droneStatus: droneActivated ? 'ACTIVATED' : 'PENDING'
        }
      });

      await automationLog.save();

      return alert;
    } catch (error) {
      console.error('Error triggering drone activation:', error);
      throw error;
    }
  }

  // Activate drone
  static async activateDrone(deviceId, zone, aqi) {
    try {
      // This would be an actual API call to drone control system
      console.log(`[DRONE] Activating drone for device ${deviceId} in ${zone} (AQI: ${aqi})`);

      // Simulate drone activation - in production, call actual drone API
      // POST to drone control endpoint
      // Example: await axios.post('https://drone-api.example.com/activate', { zone, aqi })

      return true;
    } catch (error) {
      console.error('Error activating drone:', error);
      return false;
    }
  }

  // Get automation logs for a device
  static async getAutomationLogs(deviceId = null, limit = 50) {
    try {
      const query = deviceId ? { deviceId } : {};
      const logs = await AutomationLog.find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('alertId');

      return logs;
    } catch (error) {
      console.error('Error fetching automation logs:', error);
      throw error;
    }
  }

  // Get all automation logs
  static async getAllAutomationLogs(limit = 100) {
    try {
      const logs = await AutomationLog.find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('alertId');

      return logs;
    } catch (error) {
      console.error('Error fetching all automation logs:', error);
      throw error;
    }
  }
}

module.exports = AutomationService;
