/**
 * Device Model
 * MongoDB schema for storing IoT device information
 */

const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  facilityId: {
    type: String,
    required: true,
    index: true
  },
  zone: {
    type: String,
    index: true,
    comment: 'Zone identifier for grouping devices and water tank association'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  online: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  relayState: {
    led: {
      type: Boolean,
      default: false
    },
    fan: {
      type: Boolean,
      default: false
    },
    pump: {
      type: Boolean,
      default: false
    }
  },
  currentReadings: {
    smoke: {
      type: Number,
      default: 0,
      min: 0,
      max: 500
    },
    temperature: {
      type: Number,
      default: 0,
      min: -10,
      max: 60
    },
    humidity: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  lastRelayControl: {
    type: Date
  },
  lastRelayControlType: {
    type: String,
    enum: ['LED', 'FAN', 'PUMP']
  },
  // Water Resource Restriction
  waterRestriction: {
    type: Boolean,
    default: false,
    comment: 'True if sprinkler/pump disabled due to water shortage'
  },
  waterRestrictionReason: {
    type: String,
    comment: 'Reason for water restriction (e.g., tank ID and status)'
  },
  waterRestrictionSince: {
    type: Date,
    comment: 'When water restriction was applied'
  },
  lastRelayUpdate: {
    type: Date,
    comment: 'Last time relay state was modified'
  },
  pumpDuration: {
    type: Number,
    min: 10,
    max: 120
  },
  firmwareVersion: {
    type: String,
    default: 'v1.0.0'
  },
  ipAddress: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Device', DeviceSchema);
