const AutomationService = require('../services/automationRulesService');
const FireBrigadeContact = require('../models/FireBrigadeContact');
const AutomationLog = require('../models/AutomationLog');

// Get all automation logs
const getAutomationLogs = async (req, res) => {
  try {
    const { deviceId, limit = 50 } = req.query;
    const logs = deviceId
      ? await AutomationService.getAutomationLogs(deviceId, limit)
      : await AutomationService.getAllAutomationLogs(limit);

    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Trigger automation manually (for testing)
const triggerAutomation = async (req, res) => {
  try {
    const { deviceId, aqi, zone, trigger } = req.body;

    if (!deviceId || !aqi || !zone || !trigger) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: deviceId, aqi, zone, trigger'
      });
    }

    let result;

    if (trigger === 'EMERGENCY_ALERT') {
      result = await AutomationService.triggerEmergencyAlert(deviceId, aqi, zone);
    } else if (trigger === 'DRONE_ACTIVATION') {
      result = await AutomationService.triggerDroneActivation(deviceId, aqi, zone);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid trigger type. Must be EMERGENCY_ALERT or DRONE_ACTIVATION'
      });
    }

    res.json({
      success: true,
      message: `${trigger} triggered successfully`,
      alert: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== Fire Brigade Contact Management =====

// Get all fire brigade contacts
const getFireBrigadeContacts = async (req, res) => {
  try {
    const contacts = await FireBrigadeContact.find().sort({ zone: 1 });
    res.json({
      success: true,
      data: contacts,
      count: contacts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get fire brigade contact by zone
const getFireBrigadeByZone = async (req, res) => {
  try {
    const { zone } = req.params;
    const contact = await FireBrigadeContact.findOne({ zone });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: `Fire brigade contact not found for zone: ${zone}`
      });
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create fire brigade contact
const createFireBrigadeContact = async (req, res) => {
  try {
    const { zone, zoneName, email, phone, contactPerson, city, address } = req.body;

    if (!zone || !zoneName || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: zone, zoneName, email'
      });
    }

    // Check if contact already exists
    const existing = await FireBrigadeContact.findOne({ zone });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `Fire brigade contact already exists for zone: ${zone}`
      });
    }

    const contact = new FireBrigadeContact({
      zone,
      zoneName,
      email,
      phone,
      contactPerson,
      city,
      address
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Fire brigade contact created successfully',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update fire brigade contact
const updateFireBrigadeContact = async (req, res) => {
  try {
    const { zone } = req.params;
    const updates = req.body;

    const contact = await FireBrigadeContact.findOneAndUpdate(
      { zone },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: `Fire brigade contact not found for zone: ${zone}`
      });
    }

    res.json({
      success: true,
      message: 'Fire brigade contact updated successfully',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete fire brigade contact
const deleteFireBrigadeContact = async (req, res) => {
  try {
    const { zone } = req.params;

    const contact = await FireBrigadeContact.findOneAndDelete({ zone });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: `Fire brigade contact not found for zone: ${zone}`
      });
    }

    res.json({
      success: true,
      message: 'Fire brigade contact deleted successfully',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Initialize default fire brigade contacts
const initializeDefaultContacts = async (req, res) => {
  try {
    const defaultContacts = [
      {
        zone: 'Zone-1',
        zoneName: 'Zone A (Building A)',
        email: 'firebrigade.zoneA@emergency.gov',
        contactPerson: 'Fire Chief - Zone A',
        city: 'City 1'
      },
      {
        zone: 'Zone-2',
        zoneName: 'Zone B (Building B)',
        email: 'firebrigade.zoneB@emergency.gov',
        contactPerson: 'Fire Chief - Zone B',
        city: 'City 1'
      },
      {
        zone: 'Zone-3',
        zoneName: 'Zone C (Building C)',
        email: 'firebrigade.zoneC@emergency.gov',
        contactPerson: 'Fire Chief - Zone C',
        city: 'City 2'
      },
      {
        zone: 'Facility-1',
        zoneName: 'Facility 1',
        email: 'firebrigade.facility1@emergency.gov',
        contactPerson: 'Facility Manager',
        city: 'City 1'
      },
      {
        zone: 'Facility-2',
        zoneName: 'Facility 2',
        email: 'firebrigade.facility2@emergency.gov',
        contactPerson: 'Facility Manager',
        city: 'City 2'
      }
    ];

    // Clear existing
    await FireBrigadeContact.deleteMany({});

    // Insert defaults
    const inserted = await FireBrigadeContact.insertMany(defaultContacts);

    res.json({
      success: true,
      message: `${inserted.length} default fire brigade contacts initialized`,
      data: inserted
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getAutomationLogs,
  triggerAutomation,
  getFireBrigadeContacts,
  getFireBrigadeByZone,
  createFireBrigadeContact,
  updateFireBrigadeContact,
  deleteFireBrigadeContact,
  initializeDefaultContacts
};
