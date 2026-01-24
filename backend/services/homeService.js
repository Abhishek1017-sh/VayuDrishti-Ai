/**
 * Home Service
 * Business logic for residential home monitoring and health recommendations
 */

const HomeRoom = require('../models/HomeRoom');
const Device = require('../models/Device');
const SensorData = require('../models/SensorData');
const WaterTank = require('../models/WaterTank');
const Alert = require('../models/Alert');

class HomeService {
  /**
   * Get comprehensive home dashboard summary
   */
  async getDashboardSummary(homeId) {
    try {
      const rooms = await HomeRoom.getByHome(homeId);
      
      if (rooms.length === 0) {
        return {
          success: true,
          homeId,
          summary: this.getEmptySummary(),
          rooms: [],
          waterTank: null,
          recentAlerts: [],
        };
      }

      // Get latest sensor data for each room
      const roomData = await Promise.all(
        rooms.map(async (room) => {
          const device = await Device.findOne({ deviceId: room.deviceId });
          
          if (!device) {
            return {
              roomId: room.roomId,
              roomName: room.roomName,
              roomType: room.roomType,
              currentAQI: 0,
              status: 'OFFLINE',
              temperature: null,
              humidity: null,
              smoke: null,
              recommendation: room.getHealthRecommendation(),
              device: null,
              vulnerable: room.occupants.vulnerable,
            };
          }
          
          // Get latest sensor reading
          const latestData = await SensorData.findOne({ deviceId: device.deviceId })
            .sort({ timestamp: -1 })
            .limit(1);
          
          const currentAQI = latestData?.aqi || 0;
          
          // Update room AQI
          // Calculate room status (read-only)
          let roomStatus;
          if (currentAQI === 0) {
            roomStatus = 'OFFLINE';
          } else if (currentAQI <= 50) {
            roomStatus = 'GOOD';
          } else if (currentAQI <= 100) {
            roomStatus = 'MODERATE';
          } else if (currentAQI <= 200) {
            roomStatus = 'UNHEALTHY';
          } else {
            roomStatus = 'HAZARDOUS';
          }
          
          return {
            roomId: room.roomId,
            roomName: room.roomName,
            roomType: room.roomType,
            currentAQI,
            status: roomStatus,
            temperature: latestData?.temperature,
            humidity: latestData?.humidity,
            smoke: latestData?.smoke,
            timestamp: latestData?.timestamp,
            recommendation: room.getHealthRecommendation(),
            device: {
              deviceId: device.deviceId,
              status: device.status,
              relayState: device.relayState || { led: false, fan: false, pump: false },
            },
            vulnerable: room.occupants.vulnerable,
            automationEnabled: room.automationEnabled,
          };
        })
      );
      
      // Get water tank for home
      const waterTank = await WaterTank.findOne({ 
        zone: { $regex: homeId, $options: 'i' } 
      });
      
      // Get recent alerts for home
      const recentAlerts = await Alert.find({
        $or: [
          { deviceId: { $in: rooms.map(r => r.deviceId) } },
          { 'resourceData.zone': { $regex: homeId, $options: 'i' } },
        ],
        status: { $in: ['active', 'acknowledged'] },
      }).sort({ timestamp: -1 }).limit(5);
      
      // Calculate summary
      const summary = {
        totalRooms: rooms.length,
        goodRooms: roomData.filter(r => r.status === 'GOOD').length,
        moderateRooms: roomData.filter(r => r.status === 'MODERATE').length,
        unhealthyRooms: roomData.filter(r => ['UNHEALTHY', 'HAZARDOUS'].includes(r.status)).length,
        offlineRooms: roomData.filter(r => r.status === 'OFFLINE').length,
        averageAQI: roomData.length > 0
          ? Math.round(roomData.reduce((sum, r) => sum + r.currentAQI, 0) / roomData.length)
          : 0,
        overallStatus: this.getOverallStatus(roomData),
        waterLevel: waterTank?.currentLevel || 0,
        waterStatus: waterTank?.status || 'UNKNOWN',
        activeAlerts: recentAlerts.filter(a => a.status === 'active').length,
        vulnerableOccupants: roomData.some(r => r.vulnerable),
      };
      
      return {
        success: true,
        homeId,
        summary,
        rooms: roomData,
        waterTank: waterTank ? {
          tankId: waterTank.tankId,
          currentLevel: waterTank.currentLevel,
          status: waterTank.status,
          capacity: waterTank.capacity,
          sprinklersDisabled: waterTank.sprinklersDisabled,
          location: waterTank.location,
        } : null,
        recentAlerts,
      };
    } catch (error) {
      console.error('Home dashboard error:', error);
      throw error;
    }
  }
  
  /**
   * Get overall home status based on all rooms
   */
  getOverallStatus(rooms) {
    if (rooms.some(r => r.status === 'HAZARDOUS')) return 'HAZARDOUS';
    if (rooms.some(r => r.status === 'UNHEALTHY')) return 'UNHEALTHY';
    if (rooms.some(r => r.status === 'MODERATE')) return 'MODERATE';
    if (rooms.every(r => r.status === 'OFFLINE')) return 'OFFLINE';
    return 'GOOD';
  }
  
  /**
   * Get room history for trends
   */
  async getRoomHistory(roomId, hours = 24) {
    try {
      const room = await HomeRoom.findOne({ roomId });
      if (!room) {
        throw new Error('Room not found');
      }
      
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - hours);
      
      const history = await SensorData.find({
        deviceId: room.deviceId,
        timestamp: { $gte: startTime },
      }).sort({ timestamp: 1 });
      
      return {
        success: true,
        roomId,
        roomName: room.roomName,
        period: { hours, startTime, endTime: new Date() },
        data: history.map(d => ({
          timestamp: d.timestamp,
          aqi: d.aqi,
          temperature: d.temperature,
          humidity: d.humidity,
          smoke: d.smoke,
        })),
      };
    } catch (error) {
      console.error('Room history error:', error);
      throw error;
    }
  }
  
  /**
   * Control room device (sprinkler, fan, etc.)
   */
  async controlDevice(roomId, action, relayType) {
    try {
      const room = await HomeRoom.findOne({ roomId });
      if (!room) {
        throw new Error('Room not found');
      }
      
      const device = await Device.findOne({ deviceId: room.deviceId });
      if (!device) {
        throw new Error('Device not found');
      }
      
      // Initialize relayState if not exists
      if (!device.relayState) {
        device.relayState = { led: false, fan: false, pump: false };
      }
      
      // Update relay state
      if (action === 'ON') {
        device.relayState[relayType] = true;
      } else if (action === 'OFF') {
        device.relayState[relayType] = false;
      } else if (action === 'TOGGLE') {
        device.relayState[relayType] = !device.relayState[relayType];
      }
      
      device.lastRelayUpdate = Date.now();
      await device.save();
      
      return {
        success: true,
        roomId,
        roomName: room.roomName,
        deviceId: device.deviceId,
        action,
        relayType,
        newState: device.relayState[relayType],
        relayState: device.relayState,
      };
    } catch (error) {
      console.error('Device control error:', error);
      throw error;
    }
  }

  /**
   * Get empty summary for homes with no rooms
   */
  getEmptySummary() {
    return {
      totalRooms: 0,
      goodRooms: 0,
      moderateRooms: 0,
      unhealthyRooms: 0,
      offlineRooms: 0,
      averageAQI: 0,
      overallStatus: 'OFFLINE',
      waterLevel: 0,
      waterStatus: 'UNKNOWN',
      activeAlerts: 0,
      vulnerableOccupants: false,
    };
  }
}

module.exports = new HomeService();
