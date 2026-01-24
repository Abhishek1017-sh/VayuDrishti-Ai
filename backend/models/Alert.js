/**
 * Alert Model
 * MongoDB schema for storing air quality alerts
 */

const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['High Smoke Level', 'High Temperature', 'Low Humidity', 'Device Offline', 'Compliance Alert']
  },
  severity: {
    type: String,
    required: true,
    enum: ['critical', 'warning', 'info'],
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
    required: true,
    index: true
  },
  readings: {
    smoke: {
      type: Number,
      min: 0,
      max: 500
    },
    temperature: {
      type: Number,
      min: -10,
      max: 60
    },
    humidity: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  automationActions: [{
    type: String,
    enum: ['LED_ALERT_ON', 'LED_ALERT_OFF', 'FAN_ON', 'FAN_OFF', 'PUMP_ON', 'PUMP_OFF']
  }],
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

module.exports = mongoose.model('Alert', AlertSchema);
