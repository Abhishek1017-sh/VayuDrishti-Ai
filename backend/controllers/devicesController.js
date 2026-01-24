/**
 * Devices Controller
 * Handles device management and status
 */

const Device = require('../models/Device');
const SensorData = require('../models/SensorData');
const dataStore = require('../utils/dataStore');

/**
 * Get all devices with their latest sensor data
 */
exports.getAllDevices = async (req, res) => {
  try {
    // Get all known devices from Device collection or derive from SensorData
    let devices = [];
    
    try {
      // Try to get devices from Device model
      devices = await Device.find().lean();
    } catch (dbError) {
      console.log('⚠️  Device collection not available');
    }

    // If no devices in DB, derive from SensorData
    if (devices.length === 0) {
      try {
        const uniqueDevices = await SensorData.aggregate([
          {
            $group: {
              _id: '$deviceId',
              lastReading: { $max: '$createdAt' },
              location: { $first: '$deviceId' }
            }
          }
        ]);

        devices = uniqueDevices.map(d => ({
          deviceId: d._id,
          location: `Location: ${d._id}`,
          zone: 'Zone-1',
          status: 'ONLINE',
          lastSeen: d.lastReading
        }));
      } catch (aggError) {
        console.log('⚠️  Could not aggregate devices from SensorData');
      }
    }

    // Enrich with latest sensor readings
    const enrichedDevices = await Promise.all(
      devices.map(async (device) => {
        try {
          let latestReading = null;
          let useMemoryStorage = false;
          
          // Try MongoDB first
          try {
            latestReading = await SensorData.findOne({ deviceId: device.deviceId })
              .sort({ createdAt: -1 })
              .lean();
              
            // Check if MongoDB data is stale (older than 2 minutes)
            if (latestReading) {
              const dataAge = Date.now() - new Date(latestReading.createdAt).getTime();
              if (dataAge > 2 * 60 * 1000) {
                console.log(`⚠️  MongoDB data is stale (${Math.round(dataAge/1000)}s old), using in-memory storage`);
                useMemoryStorage = true;
              }
            } else {
              useMemoryStorage = true;
            }
          } catch (dbError) {
            console.log('⚠️  MongoDB query failed, using in-memory storage');
            useMemoryStorage = true;
          }
          
          // Use in-memory storage if MongoDB data is stale or unavailable
          if (useMemoryStorage) {
            const memoryReading = dataStore.getLatestSensorReading();
            if (memoryReading && memoryReading.deviceId === device.deviceId) {
              latestReading = memoryReading;
            }
          }

          const now = Date.now();
          const timestamp = latestReading?.createdAt || latestReading?.timestamp || device.lastSeen;
          const lastSeen = timestamp ? new Date(timestamp).getTime() : now - (10 * 60 * 1000);
          const isOnline = (now - lastSeen) < 5 * 60 * 1000; // 5 minutes

          return {
            deviceId: device.deviceId,
            location: device.location,
            zone: device.zone || 'Zone-1',
            aqi: latestReading?.aqi || 0,
            mq: latestReading?.mq || 0,
            temperature: latestReading?.temperature || 0,
            humidity: latestReading?.humidity || 0,
            status: isOnline ? 'ONLINE' : 'OFFLINE',
            lastUpdated: latestReading ? timeAgo(timestamp) : 'N/A'
          };
        } catch (err) {
          return {
            deviceId: device.deviceId,
            location: device.location,
            zone: device.zone || 'Zone-1',
            aqi: 0,
            mq: 0,
            temperature: 0,
            humidity: 0,
            status: 'OFFLINE',
            lastUpdated: 'N/A'
          };
        }
      })
    );

    res.json({
      success: true,
      count: enrichedDevices.length,
      data: enrichedDevices
    });

  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ 
      error: 'Failed to fetch devices',
      message: error.message 
    });
  }
};

/**
 * Get device by ID
 */
exports.getDeviceById = async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    const device = await Device.findOne({ deviceId });
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Get latest sensor reading
    const latestReading = await SensorData.findOne({ deviceId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        ...device.toObject(),
        latestReading
      }
    });

  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({ 
      error: 'Failed to fetch device' 
    });
  }
};

/**
 * Register or update a device
 */
exports.registerDevice = async (req, res) => {
  try {
    const { deviceId, location, zone } = req.body;

    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    const device = await Device.findOneAndUpdate(
      { deviceId },
      {
        deviceId,
        location: location || deviceId,
        zone: zone || 'Zone-1',
        status: 'ONLINE',
        lastSeen: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Device registered successfully',
      data: device
    });

  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({ 
      error: 'Failed to register device' 
    });
  }
};

// Helper function to format time ago
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  if (seconds < 60) return 'now';
  if (seconds < 120) return '1 min ago';
  if (seconds < 3600) return Math.floor(seconds / 60) + ' min ago';
  if (seconds < 7200) return '1 hour ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
  return Math.floor(seconds / 86400) + ' days ago';
}
