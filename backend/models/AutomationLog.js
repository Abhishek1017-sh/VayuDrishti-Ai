const mongoose = require('mongoose');

const automationLogSchema = new mongoose.Schema({
  alertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert',
    required: true
  },
  deviceId: String,
  zone: String,
  aqi: Number,
  trigger: {
    type: String,
    enum: ['EMERGENCY_ALERT', 'DRONE_ACTIVATION', 'FAN_ON', 'PUMP_ON', 'LED_ON'],
    required: true
  },
  action: {
    type: String,
    enum: ['EMAIL_SENT', 'DRONE_ACTIVATED', 'RELAY_TRIGGERED', 'PENDING', 'FAILED'],
    default: 'PENDING'
  },
  details: {
    emailSent: Boolean,
    recipients: [String],
    droneStatus: String,
    relayInfo: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  error: String
});

module.exports = mongoose.model('AutomationLog', automationLogSchema);
