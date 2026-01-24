/**
 * Fire Brigade Contact Model
 * MongoDB schema for storing fire station emergency contacts by zone
 * Used for FIRE detection emergency notifications
 */

const mongoose = require('mongoose');

const fireBrigadeContactSchema = new mongoose.Schema({
  zone: {
    type: String,
    required: true,
    index: true,
    enum: ['Zone-1', 'Zone-2', 'Zone-3', 'Zone-A', 'Zone-B', 'Zone-C', 'Facility-1', 'Facility-2']
  },
  name: {
    type: String,
    required: true
  },
  zoneName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  emergencyHotline: {
    type: String
  },
  contactPerson: String,
  city: String,
  address: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  responseTime: {
    type: Number, // Average response time in minutes
    default: 15
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for fast zone lookup during emergencies
fireBrigadeContactSchema.index({ zone: 1, priority: 1, isActive: 1 });

module.exports = mongoose.model('FireBrigadeContact', fireBrigadeContactSchema);
