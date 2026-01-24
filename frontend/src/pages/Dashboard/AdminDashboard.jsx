import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Zap, AlertTriangle, Activity, DownloadCloud, Settings, Wifi, WifiOff, Clock, Siren, Plane } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '../../components/Dashboard/Shared/StatCard';
import SensorCard from '../../components/Dashboard/Shared/SensorCard';
import AlertManager from '../../components/Dashboard/Shared/AlertManager';
import SystemControls from '../../components/Dashboard/Shared/SystemControls';
import SimpleTrendChart from '../../components/Dashboard/Shared/SimpleTrendChart';
import { dashboardAPI } from '../../services/api';

function AdminDashboard() {
  const [adminData, setAdminData] = useState(null);
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [automationStatus, setAutomationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncTime, setSyncTime] = useState(new Date());
  const [latestSensor, setLatestSensor] = useState(null);
  const [highestAQIRecord, setHighestAQIRecord] = useState(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('highestAQIRecord');
    return saved ? JSON.parse(saved) : { aqi: 0, zone: 'N/A', timestamp: null };
  });

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from new API endpoints
      const [devicesRes, alertsRes, adminRes, droneRes, sensorRes] = await Promise.all([
        fetch('/api/devices').catch(() => null),
        fetch('/api/alerts').catch(() => null),
        dashboardAPI.getAdminData?.().catch(() => null),
        fetch('/api/drone/status').catch(() => null),
        fetch('/api/sensors/latest').catch(() => null)
      ]);

      let devicesData = [];
      let alertsData = [];
      let adminDataResponse = null;
      let droneStatusData = null;
      let sensorData = null;

      if (sensorRes?.ok) {
        const response = await sensorRes.json();
        sensorData = response?.data;
        setLatestSensor(sensorData); // Store in state for persistence
        console.log('🔴 Latest Sensor Data:', sensorData); // DEBUG
        
        // Update highest AQI record if current value is higher
        if (sensorData && sensorData.aqi > highestAQIRecord.aqi) {
          const newRecord = {
            aqi: sensorData.aqi,
            zone: 'Zone-1',
            timestamp: new Date().toISOString()
          };
          setHighestAQIRecord(newRecord);
          localStorage.setItem('highestAQIRecord', JSON.stringify(newRecord)); // Persist to localStorage
          console.log('🏆 NEW HIGHEST AQI RECORD:', sensorData.aqi);
        }
      }

      if (devicesRes?.ok) {
        const data = await devicesRes.json();
        devicesData = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      } else {
        devicesData = getMockDevices(sensorData);
      }

      // CRITICAL FIX: Update device with real-time sensor data
      if (sensorData && devicesData.length > 0) {
        // Find the device by deviceId from sensor data, or use first device
        let targetDevice = devicesData.find(d => d.deviceId === sensorData.deviceId);
        
        if (!targetDevice) {
          // Try common device names
          targetDevice = devicesData.find(d => 
            d.deviceId === 'ESP_NodeMCU' || 
            d.deviceId === 'classroom-01' ||
            d.deviceId === 'test-device'
          );
        }
        
        if (!targetDevice && devicesData.length > 0) {
          // Fallback to first device
          targetDevice = devicesData[0];
        }
        
        // Update with latest sensor data
        if (targetDevice) {
          targetDevice.aqi = sensorData.aqi;
          targetDevice.mq = sensorData.mq;
          targetDevice.temperature = sensorData.temperature;
          targetDevice.humidity = sensorData.humidity;
          targetDevice.status = sensorData.status || 'ONLINE';
          targetDevice.lastUpdated = 'now';
        }
      }

      if (alertsRes?.ok) {
        const data = await alertsRes.json();
        alertsData = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      } else {
        alertsData = getMockAlerts();
      }

      if (adminRes?.data) {
        adminDataResponse = adminRes.data;
      } else {
        adminDataResponse = getMockAdminData();
      }

      if (droneRes?.ok) {
        const data = await droneRes.json();
        droneStatusData = data.data;
      }

      setDevices(devicesData);
      setAlerts(alertsData);
      setAdminData(adminDataResponse);
      setAutomationStatus(droneStatusData);
      setSyncTime(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load admin data');
      setAdminData(getMockAdminData());
      setDevices(getMockDevices());
      setAlerts(getMockAlerts());
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = (alertId) => {
    // API call to delete alert
    console.log('Delete alert:', alertId);
  };

  const handleAcknowledgeAlert = (alertId) => {
    // API call to acknowledge alert
    console.log('Acknowledge alert:', alertId);
  };

  const handleSaveSettings = (settings) => {
    console.log('Save settings:', settings);
    // API call to save settings
  };

  if (loading && !adminData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-2" />
          <p className="text-gray-400">Loading system overview...</p>
        </div>
      </div>
    );
  }

  const data = adminData || getMockAdminData();

  // Calculate metrics
  const totalDevices = devices.length;
  const activeDevices = devices.filter(d => d.status === 'ONLINE').length;
  const offlineDevices = totalDevices - activeDevices;
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'Emergency').length;
  const emergencyAlerts = alerts.filter(a => a.severity === 'Emergency').length;
  
  // CRITICAL: Always use latestSensor for real-time data, fallback to devices only if latestSensor is null
  const highestAQIDevice = (latestSensor && latestSensor.aqi !== undefined) 
    ? latestSensor 
    : (devices.length > 0 
        ? devices.reduce((max, d) => (d.aqi > max.aqi) ? d : max, devices[0])
        : { aqi: 0, location: 'N/A', temperature: 0, humidity: 0, mq: 0, lastUpdated: 'N/A' }
      );

  // Zone-wise AQI data - ALWAYS use latest sensor for real-time updates
  const zoneWiseAQI = devices.reduce((acc, device) => {
    const zone = device.zone || 'Unknown';
    const existing = acc.find(z => z.zone === zone);
    // Always use latestSensor if available for any Zone-1 device
    const deviceAqi = (zone === 'Zone-1' && latestSensor && latestSensor.aqi !== undefined) 
      ? latestSensor.aqi 
      : device.aqi;
    if (existing) {
      existing.total += deviceAqi;
      existing.count++;
      existing.aqi = existing.total / existing.count;
    } else {
      acc.push({ zone, aqi: deviceAqi, total: deviceAqi, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => b.aqi - a.aqi);

  const highestAQIZone = zoneWiseAQI.length > 0 
    ? zoneWiseAQI[0]
    : { zone: 'Zone-1', aqi: latestSensor?.aqi || 0 };

  const getAQISeverity = (aqi) => {
    if (aqi >= 300) return { label: 'Hazardous', badge: 'bg-red-500/20 text-red-200', color: 'text-red-300' };
    if (aqi >= 200) return { label: 'Severe', badge: 'bg-orange-500/20 text-orange-200', color: 'text-orange-200' };
    if (aqi >= 150) return { label: 'Unhealthy', badge: 'bg-amber-500/20 text-amber-200', color: 'text-amber-200' };
    if (aqi >= 100) return { label: 'Moderate', badge: 'bg-yellow-500/20 text-yellow-200', color: 'text-yellow-200' };
    return { label: 'Good', badge: 'bg-green-500/20 text-green-200', color: 'text-green-200' };
  };

  // LIVE AQI STREAM: Always use current sensor data (latestSensor)
  const primaryAqi = latestSensor?.aqi || data?.aqi?.value || 0;
  const primarySeverity = getAQISeverity(primaryAqi);
  
  // For display metrics, use highestAQIDevice which could be from devices or latestSensor
  const displayDevice = highestAQIDevice;
  
  console.log('🟢 LIVE AQI (current):', primaryAqi, '| HIGHEST AQI (max):', highestAQIRecord.aqi); // DEBUG

  const formatSyncTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="space-y-8">
      {/* Emergency Alert Banner */}
      {automationStatus?.emergencyAlert?.active && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-lg border-2 border-red-500 bg-gradient-to-r from-red-600/30 to-orange-600/30 backdrop-blur-sm p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-full animate-pulse">
                <Siren className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-100">🚨 EMERGENCY ALERT ACTIVE</h3>
                <p className="text-red-200 mt-1">
                  Critical AQI level detected in {automationStatus.emergencyAlert.zone} • 
                  Fire Brigade {automationStatus.emergencyAlert.fireBrigadeNotified ? '✅ Notified' : '⏳ Pending'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-red-300">Last Triggered</p>
              <p className="text-sm font-mono text-red-100">
                {new Date(automationStatus.emergencyAlert.lastTriggered).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Drone Status Banner */}
      {automationStatus?.droneSystem?.active && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-lg border-2 border-cyan-500 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 backdrop-blur-sm p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-cyan-500 rounded-full">
                <Plane className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-cyan-100">🚁 DRONE SYSTEM ACTIVATED</h3>
                <p className="text-cyan-200 mt-1">
                  Deploying nitrogen solution in {automationStatus.droneSystem.zone} • 
                  Device: {automationStatus.droneSystem.deviceId} • 
                  AQI: {automationStatus.droneSystem.aqiAtActivation}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-cyan-300">Activated At</p>
              <p className="text-sm font-mono text-cyan-100">
                {new Date(automationStatus.droneSystem.lastActivated).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-widest text-cyan-300/70 font-semibold">LIVE ATMOSPHERE FEED</p>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mt-2">
            Adaptive Air Command Center
          </h1>
          <p className="text-gray-400 mt-1">Fusion view of AQI, micro-climate and device health with automation readiness.</p>
        </div>
        <div className="flex items-center gap-3 text-cyan-300/80 flex-wrap">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-cyan-500/20">
            <Clock size={16} />
            <span className="text-sm font-mono">Synced at {formatSyncTime(syncTime)}</span>
          </div>
          <button
            onClick={fetchAdminData}
            className="px-4 py-2 rounded-lg border border-cyan-400/50 text-sm font-semibold text-white bg-cyan-500/20 hover:bg-cyan-500/30 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryMetricCard
          title="Total Devices"
          value={totalDevices}
          icon="📱"
          bgGradient="from-blue-500/20 to-blue-700/10"
          borderColor="border-blue-500/30"
        />
        <SummaryMetricCard
          title="Active Devices"
          value={activeDevices}
          icon="🟢"
          bgGradient="from-green-500/20 to-green-700/10"
          borderColor="border-green-500/30"
          subtext="Online"
        />
        <SummaryMetricCard
          title="Offline Devices"
          value={offlineDevices}
          icon="🔴"
          bgGradient="from-red-500/20 to-red-700/10"
          borderColor="border-red-500/30"
        />
        <SummaryMetricCard
          title="Highest AQI Zone"
          value={highestAQIRecord.aqi.toFixed(0)}
          icon="⚠️"
          bgGradient="from-orange-500/20 to-orange-700/10"
          borderColor="border-orange-500/30"
          subtext={highestAQIRecord.zone}
        />
        <SummaryMetricCard
          title="Critical Alerts"
          value={criticalAlerts}
          icon="🚨"
          bgGradient="from-red-500/20 to-red-700/10"
          borderColor="border-red-500/30"
          badge={emergencyAlerts > 0 ? `${emergencyAlerts} Emergency` : null}
        />
      </div>

      {/* Main Grid */}
      <div className="space-y-6">
        {/* Live AQI + Telemetry */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 gap-4 items-stretch"
        >
          <div
            className="relative overflow-hidden rounded-3xl p-6 md:p-8 border border-cyan-500/25"
            style={{ background: 'radial-gradient(120% 120% at 10% 20%, rgba(123,31,162,0.2), rgba(6,182,212,0.08)), linear-gradient(145deg, rgba(13,17,23,0.9), rgba(9,12,20,0.9))' }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80 font-semibold">Live AQI Stream</p>
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  Unknown location
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <span className="w-2 h-2 rounded-full bg-green-400" /> Synced at {formatSyncTime(syncTime)}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">
              <div className="lg:col-span-2 flex gap-4 items-center rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="bg-gradient-to-br from-purple-500/50 to-indigo-500/40 shadow-inner rounded-2xl px-6 py-6 text-white min-w-[120px] text-center">
                  <p className="text-6xl font-black leading-none">{primaryAqi}</p>
                </div>
                <div className="space-y-2">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${primarySeverity.badge}`}>
                    {primarySeverity.label}
                  </span>
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                    {latestSensor?.deviceId ? `Location: ${latestSensor.deviceId}` : (displayDevice?.location || 'Unknown location')}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {formatSyncTime(syncTime)}
                  </div>
                </div>
              </div>

              <LiveMetric label="Temperature" value={latestSensor?.temperature || displayDevice?.temperature || 0} suffix="°C" color="text-gray-100" />
              <LiveMetric label="Humidity" value={latestSensor?.humidity || displayDevice?.humidity || 0} suffix="%" color="text-gray-100" />
              <LiveMetric label="MQ Index" value={latestSensor?.mq || displayDevice?.mq || 0} suffix="" color="text-gray-100" />
            </div>

            <div className="mt-6 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-1/2 bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 via-red-500 to-purple-600" />
            </div>
          </div>
        </motion.div>

        {/* Automation + Thresholds */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl p-6 border border-cyan-500/20 backdrop-blur"
            style={{ background: 'linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))' }}
          >
            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-widest">Automation Status</h3>
            <p className="text-xs text-gray-500 mb-3">Automatic corrective actions</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <div>
                  <p className="text-sm text-gray-300 font-medium">Water Sprinking</p>
                  <p className="text-xs text-yellow-400 mt-1">Cooldown: 30 min remaining</p>
                </div>
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <div>
                  <p className="text-sm text-gray-300 font-medium">Ventilation</p>
                  <p className="text-xs text-yellow-400 mt-1">Cooldown: 16 min remaining</p>
                </div>
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative overflow-hidden rounded-2xl p-7 border border-cyan-500/20 backdrop-blur"
            style={{ background: 'linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))' }}
          >
            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-widest">Activation Thresholds</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-white/5 rounded-lg border border-yellow-500/20">
                <p className="text-xs text-gray-400 mb-1">Alert</p>
                <p className="text-2xl font-bold text-yellow-400">{automationStatus?.thresholds?.alert || 100}</p>
                <p className="text-xs text-gray-500 mt-1">AQI Threshold</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-orange-500/20">
                <p className="text-xs text-gray-400 mb-1">Critical</p>
                <p className="text-2xl font-bold text-orange-400">{automationStatus?.thresholds?.critical || 150}</p>
                <p className="text-xs text-gray-500 mt-1">AQI Threshold</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-cyan-500/20">
                <p className="text-xs text-gray-400 mb-1">🚁 Drone</p>
                <p className="text-2xl font-bold text-cyan-400">{automationStatus?.thresholds?.drone || 500}</p>
                <p className="text-xs text-gray-500 mt-1">AQI Threshold</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-red-500/20">
                <p className="text-xs text-gray-400 mb-1">🚨 Emergency</p>
                <p className="text-2xl font-bold text-red-400">{automationStatus?.thresholds?.emergency || 1000}</p>
                <p className="text-xs text-gray-500 mt-1">AQI Threshold</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Zone-wise AQI Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative overflow-hidden rounded-2xl p-6 border border-cyan-500/20 backdrop-blur"
        style={{ background: 'linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))' }}
      >
        <h3 className="text-lg font-semibold text-white mb-4 uppercase tracking-widest">Zone-Wise AQI Distribution</h3>
        {zoneWiseAQI.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={zoneWiseAQI}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="zone" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(20,20,20,0.95)', border: '1px solid rgba(6,182,212,0.5)', borderRadius: '8px' }}
                formatter={(value) => `${value.toFixed(0)} AQI`}
              />
              <Bar dataKey="aqi" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">No zone data available</div>
        )}
      </motion.div>

      {/* Device Location Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative overflow-hidden rounded-2xl p-6 border border-cyan-500/20 backdrop-blur"
        style={{ background: 'linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))' }}
      >
        <h3 className="text-lg font-semibold text-white mb-4 uppercase tracking-widest">Device Location Map</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/20">
                <th className="text-left py-3 px-4 text-cyan-300 font-semibold">Device ID</th>
                <th className="text-left py-3 px-4 text-cyan-300 font-semibold">Location</th>
                <th className="text-left py-3 px-4 text-cyan-300 font-semibold">Zone</th>
                <th className="text-left py-3 px-4 text-cyan-300 font-semibold">AQI</th>
                <th className="text-left py-3 px-4 text-cyan-300 font-semibold">Status</th>
                <th className="text-left py-3 px-4 text-cyan-300 font-semibold">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {devices.slice(0, 10).map((device, idx) => (
                <motion.tr 
                  key={idx} 
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <td className="py-3 px-4 text-gray-300 font-mono">{device.deviceId}</td>
                  <td className="py-3 px-4 text-gray-400">{device.location}</td>
                  <td className="py-3 px-4 text-gray-400">{device.zone}</td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${
                      device.aqi >= 300 ? 'text-red-400' :
                      device.aqi >= 200 ? 'text-orange-400' :
                      device.aqi >= 100 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {device.aqi}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center gap-2 font-semibold ${
                      device.status === 'ONLINE' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {device.status === 'ONLINE' ? <Wifi size={16} /> : <WifiOff size={16} />}
                      {device.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{device.lastUpdated}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function SummaryMetricCard({ title, value, icon, bgGradient, borderColor, subtext, badge }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 border ${borderColor} backdrop-blur transition-all hover:border-opacity-100 group`}
      style={{ background: `linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))` }}>
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${bgGradient} rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity`}></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">{title}</p>
          <span className="text-2xl">{icon}</span>
        </div>
        <p className="text-4xl font-bold text-white">{value}</p>
        {subtext && <p className="text-xs text-gray-500 mt-2">{subtext}</p>}
        {badge && <span className="inline-block mt-2 text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded font-semibold">{badge}</span>}
      </div>
    </div>
  );
}

function getMockAdminData() {
  return {
    totalSensors: 24,
    activeAlerts: 3,
    systemHealth: 97,
    activeUsers: 8,
    alerts: [
      {
        id: '1',
        title: 'High AQI Alert',
        message: 'Building C: AQI reached 185 (Poor quality)',
        severity: 'critical',
        timestamp: '2 minutes ago'
      },
      {
        id: '2',
        title: 'System Alert',
        message: 'Sensor SD-12 offline for 45 minutes',
        severity: 'warning',
        timestamp: '15 minutes ago'
      },
      {
        id: '3',
        title: 'Threshold Breach',
        message: 'Floor 3: Humidity 75% (High)',
        severity: 'warning',
        timestamp: '1 hour ago'
      }
    ],
    automationLogs: [
      { action: 'Ventilation activated', device: 'Building A', timestamp: '3 min ago', status: 'success' },
      { action: 'Sprinkler system ON', device: 'Floor 2', timestamp: '15 min ago', status: 'success' },
      { action: 'Alert notification sent', device: 'All users', timestamp: '45 min ago', status: 'success' },
      { action: 'Automation retry', device: 'Building C', timestamp: '2 hours ago', status: 'failed' }
    ],
    sensors: [
      {
        deviceId: 'SENSOR-01',
        location: 'Building A - Room 101',
        aqi: 45,
        temperature: 22.5,
        humidity: 55,
        mq: 320,
        status: 'GOOD',
        lastUpdated: '1 min ago'
      },
      {
        deviceId: 'SENSOR-02',
        location: 'Building B - Lobby',
        aqi: 125,
        temperature: 24.2,
        humidity: 62,
        mq: 650,
        status: 'MODERATE',
        lastUpdated: '2 min ago'
      },
      {
        deviceId: 'SENSOR-03',
        location: 'Building C - Floor 3',
        aqi: 185,
        temperature: 26.8,
        humidity: 72,
        mq: 820,
        status: 'POOR',
        lastUpdated: '1 min ago'
      },
      {
        deviceId: 'SENSOR-04',
        location: 'Outdoor - Parking',
        aqi: 78,
        temperature: 20.1,
        humidity: 48,
        mq: 420,
        status: 'GOOD',
        lastUpdated: '3 min ago'
      }
    ],
    aqiTrend: [
      { time: '00:00', aqi: 65 },
      { time: '04:00', aqi: 58 },
      { time: '08:00', aqi: 82 },
      { time: '12:00', aqi: 125 },
      { time: '16:00', aqi: 145 },
      { time: '20:00', aqi: 98 },
      { time: '24:00', aqi: 72 }
    ]
  };
}

function LiveMetric({ label, value, suffix, color }) {
  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/10 min-w-[140px]">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}{suffix}</p>
      <p className="text-[10px] uppercase tracking-wide text-gray-500 mt-1">Real-time</p>
    </div>
  );
}

function getMockDevices(latestSensor = null) {
  const devices = [
    // Zone-1 devices
    { 
      deviceId: 'ESP_NodeMCU', 
      location: 'Zone-1 Main Sensor', 
      zone: 'Zone-1', 
      aqi: latestSensor?.aqi || 125, 
      mq: latestSensor?.mq || 450, 
      temperature: latestSensor?.temperature || 28.5, 
      humidity: latestSensor?.humidity || 55.2, 
      status: 'ONLINE', 
      lastUpdated: latestSensor ? 'now' : '2 min ago' 
    },
    { deviceId: 'classroom-03', location: 'Zone-1 Building C', zone: 'Zone-1', aqi: 185, mq: 680, temperature: 19.0, humidity: 74, status: 'ONLINE', lastUpdated: '3 min ago' },
    { deviceId: 'classroom-05', location: 'Zone-1 Building A', zone: 'Zone-1', aqi: 95, mq: 420, temperature: 23.0, humidity: 60, status: 'ONLINE', lastUpdated: '5 min ago' },
    
    // Zone-2 devices
    { deviceId: 'classroom-02', location: 'Zone-2 Building B', zone: 'Zone-2', aqi: 145, mq: 550, temperature: 24.2, humidity: 62, status: 'ONLINE', lastUpdated: '1 min ago' },
    { deviceId: 'classroom-06', location: 'Zone-2 Building E', zone: 'Zone-2', aqi: 88, mq: 380, temperature: 25.0, humidity: 65, status: 'ONLINE', lastUpdated: '2 min ago' },
    { deviceId: 'classroom-08', location: 'Zone-2 Rooftop', zone: 'Zone-2', aqi: 65, mq: 340, temperature: 18.5, humidity: 45, status: 'ONLINE', lastUpdated: '4 min ago' },
    
    // Zone-3 devices
    { deviceId: 'classroom-04', location: 'Zone-3 Building D', zone: 'Zone-3', aqi: 112, mq: 470, temperature: 21.5, humidity: 48, status: 'ONLINE', lastUpdated: '3 min ago' },
    { deviceId: 'classroom-07', location: 'Zone-3 Basement', zone: 'Zone-3', aqi: 158, mq: 590, temperature: 20.0, humidity: 50, status: 'ONLINE', lastUpdated: '5 min ago' },
    
    // Zone-4 devices
    { deviceId: 'classroom-09', location: 'Zone-4 North Wing', zone: 'Zone-4', aqi: 78, mq: 360, temperature: 22.0, humidity: 52, status: 'ONLINE', lastUpdated: '2 min ago' },
    { deviceId: 'classroom-10', location: 'Zone-4 Laboratory', zone: 'Zone-4', aqi: 132, mq: 520, temperature: 26.5, humidity: 58, status: 'ONLINE', lastUpdated: '6 min ago' },
    
    // Zone-5 devices
    { deviceId: 'classroom-11', location: 'Zone-5 East Block', zone: 'Zone-5', aqi: 105, mq: 440, temperature: 21.8, humidity: 54, status: 'ONLINE', lastUpdated: '4 min ago' },
    { deviceId: 'classroom-12', location: 'Zone-5 Cafeteria', zone: 'Zone-5', aqi: 92, mq: 410, temperature: 24.5, humidity: 61, status: 'ONLINE', lastUpdated: '3 min ago' },
  ];
  return devices;
}

function getMockAlerts() {
  return [
    { id: 'A001', type: 'CRITICAL', severity: 'CRITICAL', message: 'AQI 410 (SEVERE)', zone: 'Zone-1', deviceId: 'classroom-03', timestamp: '2 min ago', actionTaken: 'Notification sent' },
    { id: 'A002', type: 'WARNING', severity: 'WARNING', message: 'AQI 290 (POOR)', zone: 'Zone-1', deviceId: 'classroom-05', timestamp: '5 min ago', actionTaken: 'Pending' },
    { id: 'A003', type: 'CRITICAL', severity: 'CRITICAL', message: 'Device offline', zone: 'Zone-3', deviceId: 'classroom-04', timestamp: '15 min ago', actionTaken: 'Alert sent' },
  ];
}

export default AdminDashboard;
