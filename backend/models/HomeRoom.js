/**
 * Home Room Model
 * Represents residential rooms with AQI monitoring and health recommendations
 */

const mongoose = require('mongoose');

const homeRoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  roomName: {
    type: String,
    required: true,
  },
  homeId: {
    type: String,
    required: true,
    index: true,
  },
  homeName: {
    type: String,
    required: true,
  },
  roomType: {
    type: String,
    enum: ['LIVING_ROOM', 'KITCHEN', 'BEDROOM', 'BATHROOM', 'OUTDOOR'],
    required: true,
  },
  deviceId: {
    type: String, // Single device per room
  },
  currentAQI: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['GOOD', 'MODERATE', 'UNHEALTHY', 'HAZARDOUS', 'OFFLINE'],
    default: 'GOOD',
  },
  occupants: {
    total: {
      type: Number,
      default: 1,
    },
    vulnerable: {
      type: Boolean,
      default: false, // Kids, elderly, health conditions
    },
  },
  automationEnabled: {
    type: Boolean,
    default: true,
  },
  preferences: {
    aqiThreshold: {
      type: Number,
      default: 100,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
homeRoomSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Method to get health recommendation
homeRoomSchema.methods.getHealthRecommendation = function() {
  if (this.currentAQI <= 50) {
    return {
      level: 'GOOD',
      icon: '✅',
      title: 'Air quality is excellent',
      message: 'Safe for all activities.',
      action: 'Open windows for fresh air',
      color: 'green',
    };
  } else if (this.currentAQI <= 100) {
    return {
      level: 'MODERATE',
      icon: '⚠️',
      title: 'Air quality is acceptable',
      message: 'Acceptable for most people.',
      action: 'Sensitive individuals should limit outdoor exposure',
      color: 'yellow',
    };
  } else if (this.currentAQI <= 200) {
    return {
      level: 'UNHEALTHY',
      icon: '🚨',
      title: 'Unhealthy air quality',
      message: 'May cause health issues for sensitive groups.',
      action: 'Turn on air purifier. Avoid outdoor activities.',
      color: 'orange',
    };
  } else {
    return {
      level: 'HAZARDOUS',
      icon: '☠️',
      title: 'Health alert! Hazardous air',
      message: 'Air quality is dangerous.',
      action: 'Stay indoors. Use air purifier. Consult doctor if needed.',
      color: 'red',
    };
  }
};

// Static method to get rooms by home
homeRoomSchema.statics.getByHome = function(homeId) {
  return this.find({ homeId });
};

module.exports = mongoose.model('HomeRoom', homeRoomSchema);
