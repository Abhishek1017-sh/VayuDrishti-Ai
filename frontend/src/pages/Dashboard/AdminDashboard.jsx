import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Zap, AlertTriangle, Activity, DownloadCloud, Settings } from 'lucide-react';
import StatCard from '../../components/Dashboard/Shared/StatCard';
import SensorCard from '../../components/Dashboard/Shared/SensorCard';
import AlertManager from '../../components/Dashboard/Shared/AlertManager';
import SystemControls from '../../components/Dashboard/Shared/SystemControls';
import SimpleTrendChart from '../../components/Dashboard/Shared/SimpleTrendChart';
import { dashboardAPI } from '../../services/api';

function AdminDashboard() {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getAdminData?.();
      if (response?.data) {
        setAdminData(response.data);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load admin data');
      // Mock data for demo
      setAdminData(getMockAdminData());
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">System Administration</p>
        <h1 className="text-3xl font-bold text-white">Admin Control Center</h1>
        <p className="text-gray-400 mt-1">Full system oversight and configuration</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sensors"
          value={data.totalSensors}
          unit="devices"
          icon={Activity}
          color="from-blue-500/20 to-blue-700/10"
          trend={{ type: 'up', value: 12, label: 'this week' }}
        />
        <StatCard
          title="Active Alerts"
          value={data.activeAlerts}
          unit="issues"
          icon={AlertTriangle}
          color="from-red-500/20 to-red-700/10"
          trend={{ type: 'down', value: 8, label: 'resolved' }}
        />
        <StatCard
          title="System Health"
          value={data.systemHealth}
          unit="%"
          icon={Zap}
          color="from-green-500/20 to-green-700/10"
          trend={data.systemHealth > 95 ? { type: 'up', value: 2, label: 'improved' } : null}
        />
        <StatCard
          title="Active Users"
          value={data.activeUsers}
          unit="online"
          icon={Users}
          color="from-purple-500/20 to-purple-700/10"
          trend={{ type: 'up', value: 5, label: 'online now' }}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Controls and Settings */}
        <div className="lg:col-span-1 space-y-6">
          <SystemControls
            onSave={handleSaveSettings}
            defaultSettings={{
              aqiThreshold: 100,
              autoSprayThreshold: 200,
              ventilationMode: 'auto',
              automationEnabled: true,
              notificationEnabled: true
            }}
          />
        </div>

        {/* Right Column - Alerts and Info */}
        <div className="lg:col-span-2 space-y-6">
          <AlertManager
            alerts={data.alerts}
            onDelete={handleDeleteAlert}
            onAcknowledge={handleAcknowledgeAlert}
            maxItems={8}
          />

          {/* Automation Logs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl p-6 border border-white/5 backdrop-blur"
            style={{
              background: `linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))`
            }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Recent Automation Actions</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {data.automationLogs?.slice(0, 5).map((log, idx) => (
                <div key={idx} className="flex items-start justify-between p-2 rounded-lg bg-white/5 text-xs">
                  <div>
                    <p className="text-gray-300 font-medium">{log.action}</p>
                    <p className="text-gray-500 mt-1">{log.device} • {log.timestamp}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                    log.status === 'success' ? 'bg-green-500/30' : 'bg-red-500/30'
                  }`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sensors Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-white mb-4">All Sensor Locations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.sensors?.map((sensor, idx) => (
            <SensorCard
              key={sensor.id || idx}
              sensorId={sensor.deviceId}
              location={sensor.location}
              aqi={sensor.aqi}
              temperature={sensor.temperature}
              humidity={sensor.humidity}
              mq={sensor.mq}
              status={sensor.status}
              lastUpdated={sensor.lastUpdated}
            />
          ))}
        </div>
      </motion.div>

      {/* Analytics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">System Analytics</h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-medium text-sm">
            <DownloadCloud className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>

        <SimpleTrendChart
          data={data.aqiTrend || []}
          title="System-wide AQI Trend"
          dataKey="aqi"
          color="#06b6d4"
        />
      </motion.div>
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

export default AdminDashboard;
