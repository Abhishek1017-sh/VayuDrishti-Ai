/**
 * Industry Zone Model
 * Represents industrial facility zones with AQI monitoring and compliance tracking
 */

const mongoose = require('mongoose');

const industryZoneSchema = new mongoose.Schema({
  zoneId: {
    type: String,
    required: true,
    unique: true,
  },
  zoneName: {
    type: String,
    required: true,
  },
  facilityId: {
    type: String,
    required: true,
    index: true,
  },
  facilityName: {
    type: String,
    required: true,
  },
  zoneType: {
    type: String,
    enum: ['PRODUCTION', 'WAREHOUSE', 'LOADING_DOCK', 'OFFICE', 'OUTDOOR'],
    required: true,
  },
  devices: [{
    type: String, // deviceId references
  }],
  currentAQI: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['NORMAL', 'WARNING', 'CRITICAL', 'OFFLINE'],
    default: 'NORMAL',
  },
  complianceLimit: {
    type: Number,
    default: 200, // AQI limit for compliance
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  productionShift: {
    current: {
      type: String,
      enum: ['MORNING', 'AFTERNOON', 'NIGHT', 'OFF'],
      default: 'OFF',
    },
    shiftStart: Date,
    shiftEnd: Date,
  },
  location: {
    lat: Number,
    lng: Number,
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
industryZoneSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Method to check compliance
industryZoneSchema.methods.isCompliant = function() {
  return this.currentAQI <= this.complianceLimit;
};

// Static method to get zones by facility
industryZoneSchema.statics.getByFacility = function(facilityId) {
  return this.find({ facilityId, isActive: true });
};

module.exports = mongoose.model('IndustryZone', industryZoneSchema);
