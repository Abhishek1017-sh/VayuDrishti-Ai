import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings, Download, AlertCircle, CheckCircle2, Clock, Zap, Smartphone, MapPin, Activity, BarChart3, AlertTriangle, CheckCircle, XCircle, Siren, Search } from 'lucide-react';
import AlertCard from '../../components/Alerts/AlertCard';
import AlertFilter from '../../components/Alerts/AlertFilter';
import AlertTable from '../../components/Alerts/AlertTable';
import AlertDetailsModal from '../../components/Alerts/AlertDetailsModal';
import DeviceStatusBadge from '../../components/Alerts/DeviceStatusBadge';
import RulesModal from '../../components/Alerts/RulesModal';
import { alertAPI } from '../../services/api';

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filters, setFilters] = useState({
    severity: [],
    status: [],
    dateRange: 'all',
    device: ''
  });
  const [selectedAlerts, setSelectedAlerts] = useState(new Set());
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [loading, setLoading] = useState(true);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [stats, setStats] = useState({
    critical: 0,
    warning: 0,
    info: 0,
    acknowledged: 0,
    total: 0
  });

  // Mock alerts data
  const mockAlerts = [
    {
      id: 'alert_001',
      type: 'High Smoke Level',
      severity: 'critical',
      status: 'active',
      deviceId: 'ESP32_001',
      timestamp: new Date(Date.now() - 5 * 60000),
      readings: {
        smoke: 450,
        temperature: 28.5,
        humidity: 62.3
      },
      automationActions: ['LED_ALERT_ON', 'FAN_ON'],
      message: 'Smoke level exceeds safe threshold. Exhaust fan activated.',
      facilityId: 'FACILITY_001'
    },
    {
      id: 'alert_002',
      type: 'High Temperature',
      severity: 'warning',
      status: 'active',
      deviceId: 'ESP32_002',
      timestamp: new Date(Date.now() - 30 * 60000),
      readings: {
        smoke: 280,
        temperature: 32.1,
        humidity: 58.0
      },
      automationActions: ['FAN_ON'],
      message: 'Temperature increased to unsafe levels.',
      facilityId: 'FACILITY_001'
    },
    {
      id: 'alert_003',
      type: 'Device Offline',
      severity: 'critical',
      status: 'active',
      deviceId: 'ESP32_003',
      timestamp: new Date(Date.now() - 2 * 3600000),
      readings: {
        smoke: 0,
        temperature: 0,
        humidity: 0
      },
      automationActions: [],
      message: 'Device ESP32_003 is offline. Last seen 2 hours ago.',
      facilityId: 'FACILITY_002'
    },
    {
      id: 'alert_004',
      type: 'Low Humidity',
      severity: 'info',
      status: 'acknowledged',
      deviceId: 'ESP32_001',
      timestamp: new Date(Date.now() - 4 * 3600000),
      readings: {
        smoke: 120,
        temperature: 25.0,
        humidity: 28.5
      },
      automationActions: [],
      message: 'Humidity levels below recommended range.',
      facilityId: 'FACILITY_001'
    },
    {
      id: 'alert_005',
      type: 'High Smoke Level',
      severity: 'warning',
      status: 'resolved',
      deviceId: 'ESP32_002',
      timestamp: new Date(Date.now() - 8 * 3600000),
      readings: {
        smoke: 320,
        temperature: 26.5,
        humidity: 55.0
      },
      automationActions: ['LED_ALERT_ON', 'FAN_ON'],
      message: 'Previous smoke alert has been resolved.',
      facilityId: 'FACILITY_001'
    }
  ];

  const mockDevices = [
    {
      id: 'ESP32_001',
      name: 'Living Room Sensor',
      location: 'Facility 1 - Zone A',
      status: 'online',
      lastSeen: new Date(),
      relayState: {
        led: true,
        fan: true,
        pump: false
      },
      facilityId: 'FACILITY_001'
    },
    {
      id: 'ESP32_002',
      name: 'Kitchen Sensor',
      location: 'Facility 1 - Zone B',
      status: 'online',
      lastSeen: new Date(),
      relayState: {
        led: false,
        fan: true,
        pump: false
      },
      facilityId: 'FACILITY_001'
    },
    {
      id: 'ESP32_003',
      name: 'Outdoor Sensor',
      location: 'Facility 2 - Perimeter',
      status: 'offline',
      lastSeen: new Date(Date.now() - 2 * 3600000),
      relayState: {
        led: false,
        fan: false,
        pump: false
      },
      facilityId: 'FACILITY_002'
    }
  ];

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAlerts(mockAlerts);
      setDevices(mockDevices);
      updateStats(mockAlerts);
      setLoading(false);
    }, 500);
  }, []);

  const updateStats = (alertList) => {
    const newStats = {
      critical: alertList.filter(a => a.severity === 'critical').length,
      warning: alertList.filter(a => a.severity === 'warning').length,
      info: alertList.filter(a => a.severity === 'info').length,
      acknowledged: alertList.filter(a => a.status === 'acknowledged').length,
      total: alertList.length
    };
    setStats(newStats);
  };

  const filterAlerts = () => {
    return alerts.filter(alert => {
      if (filters.severity.length > 0 && !filters.severity.includes(alert.severity)) {
        return false;
      }
      if (filters.status.length > 0 && !filters.status.includes(alert.status)) {
        return false;
      }
      if (filters.device && !alert.deviceId.toLowerCase().includes(filters.device.toLowerCase())) {
        return false;
      }
      // Date range filtering logic
      const alertTime = alert.timestamp.getTime();
      const now = Date.now();
      switch (filters.dateRange) {
        case '24h':
          return now - alertTime < 24 * 3600000;
        case '7d':
          return now - alertTime < 7 * 24 * 3600000;
        case '30d':
          return now - alertTime < 30 * 24 * 3600000;
        default:
          return true;
      }
    });
  };

  const handleAlertSelect = (alertId) => {
    setSelectedAlerts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(alertId)) {
        newSet.delete(alertId);
      } else {
        newSet.add(alertId);
      }
      return newSet;
    });
  };

  const handleBulkAction = async (action) => {
    if (selectedAlerts.size === 0) return;

    const selectedIds = Array.from(selectedAlerts);
    try {
      switch (action) {
        case 'acknowledge':
          setAlerts(prev =>
            prev.map(a =>
              selectedIds.includes(a.id) ? { ...a, status: 'acknowledged' } : a
            )
          );
          break;
        case 'resolve':
          setAlerts(prev =>
            prev.map(a =>
              selectedIds.includes(a.id) ? { ...a, status: 'resolved' } : a
            )
          );
          break;
        case 'delete':
          setAlerts(prev => prev.filter(a => !selectedIds.includes(a.id)));
          break;
      }
      setSelectedAlerts(new Set());
      updateStats(alerts);
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Type', 'Severity', 'Status', 'Device ID', 'Timestamp', 'Smoke (PPM)', 'Temp (°C)', 'Humidity (%)'].join(','),
      ...filterAlerts().map(a =>
        [
          a.type,
          a.severity,
          a.status,
          a.deviceId,
          a.timestamp.toISOString(),
          a.readings.smoke,
          a.readings.temperature,
          a.readings.humidity
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredAlerts = filterAlerts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Alert Management</h1>
            <p className="text-gray-400">System-wide alert monitoring and device control</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download size={20} />
              Export CSV
            </button>
            <button 
              onClick={() => setShowRulesModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <Settings size={20} />
              Rules
            </button>
          </div>
        </div>

        {/* Alert Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-500/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm">Critical</p>
                <p className="text-3xl font-bold text-red-400">{stats.critical}</p>
              </div>
              <AlertCircle size={32} className="text-red-400/40" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border border-yellow-500/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm">Warning</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.warning}</p>
              </div>
              <AlertCircle size={32} className="text-yellow-400/40" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">Info</p>
                <p className="text-3xl font-bold text-blue-400">{stats.info}</p>
              </div>
              <AlertCircle size={32} className="text-blue-400/40" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-500/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">Acknowledged</p>
                <p className="text-3xl font-bold text-green-400">{stats.acknowledged}</p>
              </div>
              <CheckCircle2 size={32} className="text-green-400/40" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Total</p>
                <p className="text-3xl font-bold text-purple-400">{stats.total}</p>
              </div>
              <Zap size={32} className="text-purple-400/40" />
            </div>
          </motion.div>
        </div>

        {/* Device Status Section */}
        <div className="bg-gray-900/40 border border-gray-700/50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Device Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {devices.map(device => (
              <div
                key={device.id}
                className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{device.name}</h3>
                    <p className="text-gray-400 text-sm">{device.location}</p>
                  </div>
                  <DeviceStatusBadge
                    status={device.status}
                    lastSeen={device.lastSeen}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${device.relayState.led ? 'bg-red-500/30 text-red-300' : 'bg-gray-700/30 text-gray-400'}`}>
                      💡 LED {device.relayState.led ? 'ON' : 'OFF'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${device.relayState.fan ? 'bg-blue-500/30 text-blue-300' : 'bg-gray-700/30 text-gray-400'}`}>
                      🌀 Fan {device.relayState.fan ? 'ON' : 'OFF'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${device.relayState.pump ? 'bg-cyan-500/30 text-cyan-300' : 'bg-gray-700/30 text-gray-400'}`}>
                      💦 Pump {device.relayState.pump ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">
              Alerts ({filteredAlerts.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded text-sm transition-colors ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded text-sm transition-colors ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                Table
              </button>
            </div>
          </div>

          {/* Filters */}
          <AlertFilter
            filters={filters}
            onFilterChange={setFilters}
            onReset={() => setFilters({ severity: [], status: [], dateRange: 'all', device: '' })}
          />

          {/* Bulk Actions */}
          {selectedAlerts.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-4 flex justify-between items-center"
            >
              <p className="text-blue-300">{selectedAlerts.size} alert(s) selected</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('acknowledge')}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                >
                  Acknowledge
                </button>
                <button
                  onClick={() => handleBulkAction('resolve')}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                >
                  Resolve
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          )}

          {/* Alerts List */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                  onClick={() => {
                    handleAlertSelect(alert.id);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedAlerts.has(alert.id)}
                    onChange={() => handleAlertSelect(alert.id)}
                    className="absolute top-4 right-4 w-4 h-4 rounded z-10"
                  />
                  <div onClick={() => setSelectedAlert(alert)}>
                    <AlertCard alert={alert} />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <AlertTable
              alerts={filteredAlerts}
              selectedAlerts={selectedAlerts}
              onSelectAlert={handleAlertSelect}
              onAlertClick={setSelectedAlert}
            />
          )}
        </div>
      </motion.div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <AlertDetailsModal
          alert={selectedAlert}
          isOpen={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          isAdmin={true}
          onRelayControl={(deviceId, relay, state) => {
            console.log(`Device ${deviceId}: ${relay} ${state ? 'ON' : 'OFF'}`);
            // TODO: Call backend API for relay control
          }}
        />
      )}

      {/* Rules Modal */}
      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />
    </div>
  );
};

export default AdminAlerts;
