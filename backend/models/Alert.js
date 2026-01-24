/**
 * Alert Model
 * MongoDB schema for storing air quality alerts
 * Enhanced for ML-based FIRE/POLLUTION detection
 */

const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  // Alert Category System
  category: {
    type: String,
    enum: ['AIR_QUALITY', 'DEVICE', 'WATER_RESOURCE', 'MUNICIPALITY'],
    default: 'AIR_QUALITY',
    index: true
  },
  subcategory: {
    type: String,
    enum: [
      // Air Quality subcategories
      'HIGH_SMOKE', 'HIGH_TEMPERATURE', 'LOW_HUMIDITY', 'POOR_AQI',
      'FIRE_DETECTED', 'POLLUTION_CRITICAL',
      // Device subcategories
      'DEVICE_OFFLINE', 'SENSOR_MALFUNCTION',
      // Water Resource subcategories
      'WATER_LOW', 'WATER_CRITICAL', 'WATER_EMPTY', 'WATER_REFILLED',
      'SPRINKLER_DISABLED_WATER', 'SPRINKLER_REENABLED',
      // Municipality subcategories
      'MUNICIPALITY_NOTIFIED', 'REFILL_REQUESTED', 'MUNICIPALITY_ACKNOWLEDGED'
    ]
  },
  type: {
    type: String,
    required: true,
    enum: [
      'High Smoke Level', 
      'High Temperature', 
      'Low Humidity', 
      'Device Offline', 
      'Compliance Alert',
      'FIRE_DETECTED',           // ML-detected fire
      'POLLUTION_CRITICAL',      // ML-detected pollution
      'Water Low',               // 20-40%
      'Water Critical',          // < 20%
      'Water Empty',             // < 5%
      'Water Refilled',          // Recovery
      'Sprinkler Disabled',      // Auto-disabled
      'Municipality Notified'    // Alert sent
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['critical', 'warning', 'info', 'EMERGENCY', 'CRITICAL'],
    default: 'warning'
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'acknowledged', 'resolved'],
    default: 'active'
  },
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  facilityId: {
    type: String,
    index: true
  },
  zone: {
    type: String,
    index: true
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  aqi: {
    type: Number,
    min: 0
  },
  readings: {
    smoke: {
      type: Number,
      min: 0,
      max: 2500
    },
    temperature: {
      type: Number,
      min: -10,
      max: 150
    },
    humidity: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  // ML Classification Data
  mlConfidence: {
    type: Number,
    min: 0,
    max: 1
  },
  decisionSource: {
    type: String,
    enum: ['ml_prediction', 'fail_safe_default', 'error_fail_safe', 'manual']
  },
  automationActions: [{
    type: String,
    enum: ['LED_ALERT_ON', 'LED_ALERT_OFF', 'FAN_ON', 'FAN_OFF', 'PUMP_ON', 'PUMP_OFF']
  }],
  automationsActivated: [{
    type: String
  }],
  automationBlocked: {
    type: String
  },
  // Water Resource Specific Data
  resourceData: {
    tankId: String,
    waterLevel: Number,
    previousLevel: Number,
    zone: String,
    location: {
      lat: Number,
      long: Number
    },
    municipalityStatus: {
      notified: {
        type: Boolean,
        default: false
      },
      notifiedAt: Date,
      acknowledged: {
        type: Boolean,
        default: false
      },
      acknowledgedAt: Date,
      responseNotes: String
    },
    sprinklerStatus: {
      wasDisabled: {
        type: Boolean,
        default: false
      },
      disabledAt: Date,
      reenabledAt: Date
    }
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  acknowledgedBy: {
    type: String
  },
  acknowledgedAt: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  },
  resolvedBy: {
    type: String
  },
  resolvedAt: {
    type: Date
  },
  resolutionNotes: {
    type: String,
    default: ''
  },
  complianceImpact: {
    type: String,
    default: ''
  },
  responseTime: {
    type: Number
  }
}, {
  timestamps: true
});

// Index for querying recent ML alerts
AlertSchema.index({ type: 1, timestamp: -1 });
AlertSchema.index({ deviceId: 1, severity: 1, status: 1 });
AlertSchema.index({ category: 1, status: 1 });
AlertSchema.index({ 'resourceData.tankId': 1, status: 1 });

module.exports = mongoose.model('Alert', AlertSchema);
