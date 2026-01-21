/**
 * Sensor Data Model
 * MongoDB schema for storing IoT sensor readings
 */

const mongoose = require('mongoose');

const SensorDataSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    default: 'classroom-01'
  },
  mq: {
    type: Number,
    required: true,
    min: 0,
    max: 1023
  },
  aqi: {
    type: Number,
    required: true,
    min: 0,
    max: 500
  },
  temperature: {
    type: Number,
    required: true,
    min: -10,
    max: 60
  },
  humidity: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    required: true,
    enum: ['GOOD', 'MODERATE', 'POOR', 'VERY_POOR', 'SEVERE']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for faster queries
SensorDataSchema.index({ deviceId: 1, createdAt: -1 });

module.exports = mongoose.model('SensorData', SensorDataSchema);
