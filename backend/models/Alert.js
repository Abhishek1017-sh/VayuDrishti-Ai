/**
 * Alert Model
 * MongoDB schema for storing air quality alerts
 * Enhanced for ML-based FIRE/POLLUTION detection
 */

const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
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
      'POLLUTION_CRITICAL'       // ML-detected pollution
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

module.exports = mongoose.model('Alert', AlertSchema);
