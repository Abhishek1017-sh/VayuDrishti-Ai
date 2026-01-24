const express = require('express');
const Alert = require('../models/Alert');
const Device = require('../models/Device');
const { sendNotification } = require('../services/notificationService');

// Get all alerts (Admin)
const getAllAlerts = async (req, res) => {
  try {
    const { status, severity, facilityId, deviceId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (facilityId) filter.facilityId = facilityId;
    if (deviceId) filter.deviceId = deviceId;

    const alerts = await Alert.find(filter)
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get facility alerts (Industry)
const getFacilityAlerts = async (req, res) => {
  try {
    const { facilityId } = req.params;
    const { status, severity } = req.query;

    const filter = { facilityId };
    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    const alerts = await Alert.find(filter)
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('Error fetching facility alerts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get device alerts (Home)
const getDeviceAlerts = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { status } = req.query;

    const filter = { deviceId };
    if (status) filter.status = status;

    const alerts = await Alert.find(filter)
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('Error fetching device alerts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Acknowledge alert
const acknowledgeAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { acknowledgedBy, notes } = req.body;

    const alert = await Alert.findByIdAndUpdate(
      alertId,
      {
        status: 'acknowledged',
        acknowledgedBy,
        acknowledgedAt: new Date(),
        notes: notes || ''
      },
      { new: true }
    );

    res.json({
      success: true,
      data: alert,
      message: 'Alert acknowledged successfully'
    });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Resolve alert
const resolveAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { resolvedBy, notes } = req.body;

    const alert = await Alert.findByIdAndUpdate(
      alertId,
      {
        status: 'resolved',
        resolvedBy,
        resolvedAt: new Date(),
        resolutionNotes: notes || ''
      },
      { new: true }
    );

    res.json({
      success: true,
      data: alert,
      message: 'Alert resolved successfully'
    });
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete alert (Admin only)
const deleteAlert = async (req, res) => {
  try {
    const { alertId } = req.params;

    await Alert.findByIdAndDelete(alertId);

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Control relay (LED, Fan, Pump)
const relayControl = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { relay, state, duration } = req.body;

    // Validate inputs
    if (!['LED', 'FAN', 'PUMP'].includes(relay.toUpperCase())) {
      return res.status(400).json({ success: false, error: 'Invalid relay type' });
    }

    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    // Update relay state in database
    const relayKey = `relayState.${relay.toLowerCase()}`;
    await Device.findByIdAndUpdate(
      deviceId,
      {
        [relayKey]: state,
        lastRelayControl: new Date(),
        lastRelayControlType: relay,
        pumpDuration: relay.toUpperCase() === 'PUMP' ? duration : undefined
      }
    );

    // TODO: Send command to ESP32 device via MQTT or HTTP
    console.log(`Relay Control: Device ${deviceId}, ${relay} set to ${state}${duration ? ` for ${duration}s` : ''}`);

    res.json({
      success: true,
      message: `${relay} relay set to ${state ? 'ON' : 'OFF'}`,
      data: {
        deviceId,
        relay,
        state,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error controlling relay:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get automation logs
const getAutomationLogs = async (req, res) => {
  try {
    const { facilityId, deviceId } = req.query;
    const filter = {};

    if (facilityId) filter.facilityId = facilityId;
    if (deviceId) filter.deviceId = deviceId;

    const logs = await Alert.find({
      ...filter,
      automationActions: { $exists: true, $ne: [] }
    })
      .select('timestamp automationActions deviceId readings type')
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    console.error('Error fetching automation logs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get device status
const getDeviceStatus = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    res.json({
      success: true,
      data: {
        id: device._id,
        name: device.name,
        location: device.location,
        status: device.online ? 'online' : 'offline',
        lastSeen: device.lastSeen,
        relayState: device.relayState,
        currentReadings: device.currentReadings
      }
    });
  } catch (error) {
    console.error('Error fetching device status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create alert from sensor data
const createAlert = async (req, res) => {
  try {
    const { type, severity, deviceId, facilityId, readings, automationActions } = req.body;

    const alert = new Alert({
      type,
      severity,
      status: 'active',
      deviceId,
      facilityId,
      readings,
      automationActions: automationActions || [],
      timestamp: new Date(),
      message: `${type}: Smoke ${readings.smoke}PPM, Temp ${readings.temperature}°C, Humidity ${readings.humidity}%`
    });

    await alert.save();

    // Send notifications if critical
    if (severity === 'critical') {
      await sendNotification({
        type: 'critical_alert',
        title: type,
        message: alert.message,
        facilityId
      });
    }

    res.json({
      success: true,
      data: alert,
      message: 'Alert created successfully'
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllAlerts,
  getFacilityAlerts,
  getDeviceAlerts,
  acknowledgeAlert,
  resolveAlert,
  deleteAlert,
  relayControl,
  getAutomationLogs,
  getDeviceStatus,
  createAlert
};
