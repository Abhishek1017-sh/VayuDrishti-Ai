import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Grid, List, Download, RefreshCw, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';

const AdminDevices = () => {
  const [devices, setDevices] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'online', 'offline'
  const [lastSynced, setLastSynced] = useState(null);

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      // Using mock data for demo
      const mockDevices = [
        {
          deviceId: 'classroom-01',
          location: 'Building A - Classroom 101',
          zone: 'Zone-1',
          aqi: 285,
          smoke: 285,
          temperature: 22.5,
          humidity: 65,
          status: 'ONLINE',
          lastUpdated: new Date(Date.now() - 30000),
          firmware: '2.1.0',
          signal: 85
        },
        {
          deviceId: 'classroom-02',
          location: 'Building A - Classroom 102',
          zone: 'Zone-1',
          aqi: 420,
          smoke: 420,
          temperature: 24.1,
          humidity: 72,
          status: 'ONLINE',
          lastUpdated: new Date(Date.now() - 45000),
          firmware: '2.1.0',
          signal: 78
        },
        {
          deviceId: 'hallway-01',
          location: 'Building A - Hallway',
          zone: 'Zone-2',
          aqi: 150,
          smoke: 150,
          temperature: 21.0,
          humidity: 58,
          status: 'ONLINE',
          lastUpdated: new Date(Date.now() - 15000),
          firmware: '2.0.5',
          signal: 92
        },
        {
          deviceId: 'lab-01',
          location: 'Building B - Science Lab',
          zone: 'Zone-2',
          aqi: 580,
          smoke: 580,
          temperature: 25.3,
          humidity: 68,
          status: 'OFFLINE',
          lastUpdated: new Date(Date.now() - 6 * 60000),
          firmware: '2.1.0',
          signal: 0
        },
        {
          deviceId: 'office-01',
          location: 'Building C - Office',
          zone: 'Zone-3',
          aqi: 95,
          smoke: 95,
          temperature: 20.5,
          humidity: 52,
          status: 'ONLINE',
          lastUpdated: new Date(Date.now() - 20000),
          firmware: '2.0.8',
          signal: 88
        },
        {
          deviceId: 'cafeteria-01',
          location: 'Building A - Cafeteria',
          zone: 'Zone-1',
          aqi: 950,
          smoke: 950,
          temperature: 28.2,
          humidity: 75,
          status: 'ONLINE',
          lastUpdated: new Date(Date.now() - 10000),
          firmware: '2.1.0',
          signal: 81
        }
      ];

      setDevices(mockDevices);
      setLastSynced(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setLoading(false);
    }
  };

  const getFilteredDevices = () => {
    return devices.filter(device => {
      if (filter === 'online') return device.status === 'ONLINE';
      if (filter === 'offline') return device.status === 'OFFLINE';
      return true;
    });
  };

  const getAQIStatus = (aqi) => {
    if (aqi >= 1000) return { label: 'EMERGENCY', color: 'text-red-600', bg: 'bg-red-100' };
    if (aqi >= 500) return { label: 'CRITICAL', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (aqi >= 200) return { label: 'POOR', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (aqi >= 50) return { label: 'MODERATE', color: 'text-blue-600', bg: 'bg-blue-100' };
    return { label: 'GOOD', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const getOfflineWarning = (device) => {
    const minutesOffline = (Date.now() - device.lastUpdated.getTime()) / 60000;
    if (device.status === 'OFFLINE' && minutesOffline >= 5) {
      return `Offline for ${Math.round(minutesOffline)} mins`;
    }
    return null;
  };

  const exportDevices = () => {
    const csv = [
      ['Device ID', 'Location', 'Zone', 'AQI', 'Status', 'Temp (°C)', 'Humidity (%)', 'Signal (%)', 'Last Updated'],
      ...getFilteredDevices().map(d => [
        d.deviceId,
        d.location,
        d.zone,
        d.aqi,
        d.status,
        d.temperature,
        d.humidity,
        d.signal,
        d.lastUpdated.toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devices_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredDevices = getFilteredDevices();
  const onlineCount = devices.filter(d => d.status === 'ONLINE').length;
  const offlineCount = devices.filter(d => d.status === 'OFFLINE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Device Status</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor all installed hardware devices</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {lastSynced && `Synced at ${lastSynced.toLocaleTimeString()}`}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Devices</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{devices.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-800"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">Online</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{onlineCount}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-800"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">Offline</p>
          <p className="text-2xl font-bold text-red-600 mt-2">{offlineCount}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-200 dark:border-orange-800"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">Critical AQI</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">
            {devices.filter(d => d.aqi >= 500).length}
          </p>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('online')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              filter === 'online'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            Online
          </button>
          <button
            onClick={() => setFilter('offline')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              filter === 'offline'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            Offline
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${
              viewMode === 'grid'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded ${
              viewMode === 'table'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <List size={20} />
          </button>
          <button
            onClick={fetchDevices}
            className="p-2 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={exportDevices}
            className="p-2 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Export CSV"
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map((device, index) => (
            <motion.div
              key={device.deviceId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{device.deviceId}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{device.location}</p>
                </div>
                {device.status === 'ONLINE' ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Wifi size={16} />
                    <span className="text-xs font-semibold">ONLINE</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <WifiOff size={16} />
                    <span className="text-xs font-semibold">OFFLINE</span>
                  </div>
                )}
              </div>

              {getOfflineWarning(device) && (
                <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs flex items-center gap-2">
                  <AlertCircle size={14} />
                  {getOfflineWarning(device)}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">AQI Level</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${getAQIStatus(device.aqi).color}`}>{device.aqi}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${getAQIStatus(device.aqi).bg} ${getAQIStatus(device.aqi).color}`}>
                      {getAQIStatus(device.aqi).label}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Temperature</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{device.temperature.toFixed(1)}°C</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Humidity</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{device.humidity}%</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Signal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{device.signal}%</span>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{device.zone}</span>
                    <span>{device.lastUpdated.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Device ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Zone</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">AQI</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">Temp</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">Humidity</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">Signal</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDevices.map((device) => (
                  <tr key={device.deviceId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{device.deviceId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{device.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{device.zone}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-bold ${getAQIStatus(device.aqi).color}`}>{device.aqi}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      {device.temperature.toFixed(1)}°C
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      {device.humidity}%
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      {device.signal}%
                    </td>
                    <td className="px-6 py-4 text-center">
                      {device.status === 'ONLINE' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                          <Wifi size={12} />
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-semibold">
                          <WifiOff size={12} />
                          Offline
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {device.lastUpdated.toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDevices;
