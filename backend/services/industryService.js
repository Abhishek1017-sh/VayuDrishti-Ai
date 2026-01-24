/**
 * Industry Service
 * Business logic for industrial facility monitoring, compliance, and analytics
 */

const IndustryZone = require('../models/IndustryZone');
const Device = require('../models/Device');
const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');
const WaterTank = require('../models/WaterTank');

class IndustryService {
  /**
   * Get compliance report for regulatory documentation
   */
  async getComplianceReport(facilityId, startDate, endDate) {
    try {
      const zones = await IndustryZone.getByFacility(facilityId);
      
      if (zones.length === 0) {
        return {
          success: false,
          message: 'No zones found for this facility'
        };
      }

      // Get all sensor data in the date range
      const sensorData = await SensorData.find({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }).sort({ createdAt: -1 });

      // Calculate zone compliance
      const zoneCompliance = await Promise.all(
        zones.map(async (zone) => {
          const zoneDevices = zone.devices;
          const zoneData = sensorData.filter(d => zoneDevices.includes(d.deviceId));
          
          const aqiValues = zoneData.map(d => d.aqi).filter(Boolean);
          const averageAQI = aqiValues.length > 0 
            ? Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length)
            : 0;
          const maxAQI = aqiValues.length > 0 ? Math.max(...aqiValues) : 0;
          
          const violations = zoneData.filter(d => d.aqi > zone.complianceLimit).length;
          const totalReadings = zoneData.length;
          const complianceRate = totalReadings > 0
            ? ((totalReadings - violations) / totalReadings * 100).toFixed(1)
            : 100;

          return {
            zoneName: zone.zoneName,
            zoneType: zone.zoneType,
            averageAQI,
            maxAQI,
            violations,
            complianceRate: parseFloat(complianceRate),
            status: complianceRate >= 95 ? 'COMPLIANT' : complianceRate >= 85 ? 'WARNING' : 'CRITICAL'
          };
        })
      );

      // Get violation details
      const violations = [];
      for (const zone of zones) {
        const zoneViolations = sensorData.filter(d => 
          zone.devices.includes(d.deviceId) && d.aqi > zone.complianceLimit
        );
        
        zoneViolations.forEach(v => {
          violations.push({
            timestamp: v.createdAt,
            zoneName: zone.zoneName,
            aqi: v.aqi,
            limit: zone.complianceLimit,
            excess: v.aqi - zone.complianceLimit,
            duration: 5 // Assuming 5-min intervals
          });
        });
      }

      // Calculate summary
      const allAQI = sensorData.map(d => d.aqi).filter(Boolean);
      const summary = {
        overallComplianceRate: zoneCompliance.length > 0
          ? (zoneCompliance.reduce((sum, z) => sum + z.complianceRate, 0) / zoneCompliance.length).toFixed(1)
          : 100,
        totalViolations: violations.length,
        averageAQI: allAQI.length > 0 ? Math.round(allAQI.reduce((a, b) => a + b, 0) / allAQI.length) : 0,
        peakAQI: allAQI.length > 0 ? Math.max(...allAQI) : 0,
        totalReadings: sensorData.length,
        complianceStatus: violations.length === 0 ? 'FULLY_COMPLIANT' : 
                         violations.length < 10 ? 'MINOR_VIOLATIONS' : 'CRITICAL_VIOLATIONS'
      };

      return {
        success: true,
        facilityId,
        reportPeriod: {
          start: startDate,
          end: endDate
        },
        summary,
        zoneCompliance,
        violations: violations.slice(0, 100), // Limit to 100 most recent
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Compliance report error:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive industry dashboard summary
   */
  async getDashboardSummary(facilityId) {
    try {
      const zones = await IndustryZone.getByFacility(facilityId);
      
      if (zones.length === 0) {
        return {
          success: true,
          facilityId,
          summary: this.getEmptySummary(),
          zones: [],
          recentAlerts: [],
          waterTanks: [],
        };
      }

      // Get latest sensor data for each zone
      const zoneData = await Promise.all(
        zones.map(async (zone) => {
          const devices = await Device.find({ 
            deviceId: { $in: zone.devices },
          });
          
          // Get latest AQI for zone (average of all devices)
          let totalAQI = 0;
          let deviceCount = 0;
          
          for (const device of devices) {
            const latestData = await SensorData.findOne({ deviceId: device.deviceId })
              .sort({ timestamp: -1 })
              .limit(1);
            
            if (latestData && latestData.aqi) {
              totalAQI += latestData.aqi;
              deviceCount++;
            }
          }
          
          const avgAQI = deviceCount > 0 ? Math.round(totalAQI / deviceCount) : 0;
          
          // Calculate zone status (don't save - read-only operation)
          let zoneStatus;
          if (avgAQI === 0) {
            zoneStatus = 'OFFLINE';
          } else if (avgAQI > zone.complianceLimit) {
            zoneStatus = 'CRITICAL';
          } else if (avgAQI > zone.complianceLimit * 0.8) {
            zoneStatus = 'WARNING';
          } else {
            zoneStatus = 'NORMAL';
          }
          
          return {
            zoneId: zone.zoneId,
            zoneName: zone.zoneName,
            zoneType: zone.zoneType,
            currentAQI: avgAQI,
            status: zoneStatus,
            complianceLimit: zone.complianceLimit,
            isCompliant: avgAQI <= zone.complianceLimit,
            deviceCount: devices.length,
            activeDevices: devices.filter(d => d.status === 'online').length,
            shift: zone.productionShift?.current || 'OFF',
          };
        })
      );
      
      // Get active alerts for facility
      const activeAlerts = await Alert.find({
        status: { $in: ['active', 'acknowledged'] },
        facilityId: facilityId,
      }).sort({ timestamp: -1 }).limit(10);
      
      // Get water tanks for facility
      const waterTanks = await WaterTank.find({
        zone: { $regex: facilityId, $options: 'i' }
      });
      
      // Calculate summary stats
      const summary = {
        totalZones: zones.length,
        activeZones: zoneData.filter(z => z.status !== 'OFFLINE').length,
        criticalZones: zoneData.filter(z => z.status === 'CRITICAL').length,
        warningZones: zoneData.filter(z => z.status === 'WARNING').length,
        compliantZones: zoneData.filter(z => z.isCompliant).length,
        complianceRate: zones.length > 0 
          ? ((zoneData.filter(z => z.isCompliant).length / zones.length) * 100).toFixed(1)
          : '100.0',
        totalDevices: zoneData.reduce((sum, z) => sum + z.deviceCount, 0),
        activeDevices: zoneData.reduce((sum, z) => sum + z.activeDevices, 0),
        averageAQI: zoneData.length > 0
          ? Math.round(zoneData.reduce((sum, z) => sum + z.currentAQI, 0) / zoneData.length)
          : 0,
        activeAlerts: activeAlerts.length,
        criticalAlerts: activeAlerts.filter(a => a.severity === 'critical').length,
      };
      
      return {
        success: true,
        facilityId,
        summary,
        zones: zoneData,
        recentAlerts: activeAlerts,
        waterTanks: waterTanks.map(tank => ({
          tankId: tank.tankId,
          zone: tank.zone,
          currentLevel: tank.currentLevel,
          status: tank.status,
          sprinklersDisabled: tank.sprinklersDisabled,
        })),
      };
    } catch (error) {
      console.error('Industry dashboard error:', error);
      throw error;
    }
  }

  /**
   * Get production shift correlation analysis
   */
  async getProductionCorrelation(facilityId, date) {
    try {
      const zones = await IndustryZone.getByFacility(facilityId);
      
      const shiftData = {
        MORNING: { zones: [], avgAQI: 0, count: 0 },
        AFTERNOON: { zones: [], avgAQI: 0, count: 0 },
        NIGHT: { zones: [], avgAQI: 0, count: 0 },
      };
      
      for (const zone of zones) {
        // Get sensor data for each shift
        const baseDate = new Date(date);
        
        const morningData = await SensorData.find({
          deviceId: { $in: zone.devices },
          timestamp: {
            $gte: new Date(baseDate.setHours(6, 0, 0, 0)),
            $lt: new Date(baseDate.setHours(14, 0, 0, 0)),
          },
        });
        
        const afternoonData = await SensorData.find({
          deviceId: { $in: zone.devices },
          timestamp: {
            $gte: new Date(baseDate.setHours(14, 0, 0, 0)),
            $lt: new Date(baseDate.setHours(22, 0, 0, 0)),
          },
        });
        
        const nightData = await SensorData.find({
          deviceId: { $in: zone.devices },
          timestamp: {
            $gte: new Date(baseDate.setHours(22, 0, 0, 0)),
            $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)).setHours(6, 0, 0, 0),
          },
        });
        
        const calcAvg = (data) => data.length > 0 
          ? data.reduce((sum, d) => sum + (d.aqi || 0), 0) / data.length 
          : 0;
        
        const morningAvg = calcAvg(morningData);
        const afternoonAvg = calcAvg(afternoonData);
        const nightAvg = calcAvg(nightData);
        
        shiftData.MORNING.zones.push({ zone: zone.zoneName, avgAQI: morningAvg });
        shiftData.AFTERNOON.zones.push({ zone: zone.zoneName, avgAQI: afternoonAvg });
        shiftData.NIGHT.zones.push({ zone: zone.zoneName, avgAQI: nightAvg });
        
        shiftData.MORNING.count += morningData.length;
        shiftData.AFTERNOON.count += afternoonData.length;
        shiftData.NIGHT.count += nightData.length;
      }
      
      // Calculate shift averages
      Object.keys(shiftData).forEach(shift => {
        const zones = shiftData[shift].zones;
        if (zones.length > 0) {
          shiftData[shift].avgAQI = zones.reduce((sum, z) => sum + z.avgAQI, 0) / zones.length;
        }
      });
      
      return {
        success: true,
        facilityId,
        date,
        shiftAnalysis: shiftData,
      };
    } catch (error) {
      console.error('Production correlation error:', error);
      throw error;
    }
  }

  /**
   * Get empty summary for facilities with no zones
   */
  getEmptySummary() {
    return {
      totalZones: 0,
      activeZones: 0,
      criticalZones: 0,
      warningZones: 0,
      compliantZones: 0,
      complianceRate: '100.0',
      totalDevices: 0,
      activeDevices: 0,
      averageAQI: 0,
      activeAlerts: 0,
      criticalAlerts: 0,
    };
  }
}

module.exports = new IndustryService();
