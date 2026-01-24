const mongoose = require('mongoose');

/**
 * Water Tank Schema
 * Stores tank configuration, municipality mapping, and real-time water levels
 */
const waterTankSchema = new mongoose.Schema({
  tankId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  zone: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    long: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  capacity: {
    type: Number,
    required: true,
    min: 0,
    comment: 'Tank capacity in liters'
  },
  currentLevel: {
    type: Number,
    required: true,
    default: 100,
    min: 0,
    max: 100,
    comment: 'Current water level as percentage (0-100%)'
  },
  status: {
    type: String,
    enum: ['NORMAL', 'LOW', 'CRITICAL', 'EMPTY'],
    default: 'NORMAL'
  },
  municipality: {
    name: {
      type: String,
      required: true
    },
    contactPerson: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  lastRefillDate: {
    type: Date,
    default: null
  },
  sensorDeviceId: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdateTime: {
    type: Date,
    default: Date.now
  },
  alertHistory: [{
    alertId: mongoose.Schema.Types.ObjectId,
    timestamp: Date,
    waterLevel: Number,
    alertType: String
  }]
}, {
  timestamps: true
});

/**
 * Virtual: Get status color for UI
 */
waterTankSchema.virtual('statusColor').get(function() {
  const colors = {
    NORMAL: 'green',
    LOW: 'yellow',
    CRITICAL: 'orange',
    EMPTY: 'red'
  };
  return colors[this.status] || 'gray';
});

/**
 * Method: Determine status based on current level
 */
waterTankSchema.methods.getStatus = function() {
  if (this.currentLevel < 5) {
    return 'EMPTY';
  } else if (this.currentLevel < 20) {
    return 'CRITICAL';
  } else if (this.currentLevel < 40) {
    return 'LOW';
  } else {
    return 'NORMAL';
  }
};

/**
 * Method: Check if sprinklers should be disabled
 */
waterTankSchema.methods.shouldDisableSprinklers = function() {
  return this.currentLevel < 20 || this.status === 'CRITICAL' || this.status === 'EMPTY';
};

/**
 * Method: Check if level crossed a threshold
 * @param {Number} previousLevel - Previous water level
 * @param {Number} newLevel - New water level
 * @returns {Object} - { crossed: Boolean, from: String, to: String, severity: String }
 */
waterTankSchema.statics.checkThresholdCrossing = function(previousLevel, newLevel) {
  const getStatusFromLevel = (level) => {
    if (level < 5) return 'EMPTY';
    if (level < 20) return 'CRITICAL';
    if (level < 40) return 'LOW';
    return 'NORMAL';
  };

  const previousStatus = getStatusFromLevel(previousLevel);
  const newStatus = getStatusFromLevel(newLevel);

  if (previousStatus !== newStatus) {
    // Determine severity based on transition direction
    let severity = 'info';
    if (newStatus === 'EMPTY') severity = 'critical';
    else if (newStatus === 'CRITICAL') severity = 'critical';
    else if (newStatus === 'LOW') severity = 'warning';
    else if (newStatus === 'NORMAL' && previousStatus !== 'LOW') severity = 'info'; // Refill

    return {
      crossed: true,
      from: previousStatus,
      to: newStatus,
      severity: severity,
      direction: newLevel > previousLevel ? 'increasing' : 'decreasing'
    };
  }

  return { crossed: false };
};

/**
 * Method: Update water level and status
 */
waterTankSchema.methods.updateLevel = function(newLevel) {
  const previousLevel = this.currentLevel;
  this.currentLevel = newLevel;
  this.status = this.getStatus();
  this.lastUpdateTime = new Date();

  // Check if refilled (crossed from below 40% to above 40%)
  if (previousLevel < 40 && newLevel >= 40) {
    this.lastRefillDate = new Date();
  }

  return {
    previousLevel,
    newLevel,
    previousStatus: this.constructor.checkThresholdCrossing(previousLevel, newLevel).from || this.status,
    newStatus: this.status
  };
};

/**
 * Index for efficient queries
 */
waterTankSchema.index({ tankId: 1 });
waterTankSchema.index({ zone: 1 });
waterTankSchema.index({ status: 1 });
waterTankSchema.index({ sensorDeviceId: 1 });

module.exports = mongoose.model('WaterTank', waterTankSchema);
