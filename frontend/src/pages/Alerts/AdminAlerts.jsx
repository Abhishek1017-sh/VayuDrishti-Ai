import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings, Download, AlertCircle, CheckCircle2, Clock, Zap, Smartphone, MapPin, Activity, BarChart3, AlertTriangle, CheckCircle, XCircle, Siren, Search, Droplets, RefreshCw } from 'lucide-react';
import AlertCard from '../../components/Alerts/AlertCard';
import AlertFilter from '../../components/Alerts/AlertFilter';
import AlertTable from '../../components/Alerts/AlertTable';
import AlertDetailsModal from '../../components/Alerts/AlertDetailsModal';
import DeviceStatusBadge from '../../components/Alerts/DeviceStatusBadge';
import RulesModal from '../../components/Alerts/RulesModal';
import WaterTankWidget from '../../components/WaterTank/WaterTankWidget';
import { alertAPI, waterTankAPI } from '../../services/api';

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [waterTanks, setWaterTanks] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filters, setFilters] = useState({
    severity: [],
    status: [],
    dateRange: 'all',
    device: '',
    category: ''
  });
  const [selectedAlerts, setSelectedAlerts] = useState(new Set());
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [loading, setLoading] = useState(true);
  const [waterTanksLoading, setWaterTanksLoading] = useState(false);
  const [error, setError] = useState(null);
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
    },
    {
      id: 'alert_006',
      type: 'Water Critical',
      severity: 'critical',
      status: 'active',
      category: 'WATER_RESOURCE',
      subcategory: 'WATER_CRITICAL',
      deviceId: 'ESP32_TANK_02',
      timestamp: new Date(Date.now() - 30 * 60000),
      message: 'Water tank TANK_002 has dropped to critical level (18%). Municipality notified and sprinklers disabled.',
      resourceData: {
        tankId: 'TANK_002',
        waterLevel: 18,
        previousLevel: 25,
        municipalityStatus: {
          notified: true,
          notifiedAt: new Date(Date.now() - 30 * 60000),
          acknowledgedBy: null
        },
        sprinklerStatus: {
          wasDisabled: true,
          disabledAt: new Date(Date.now() - 30 * 60000),
          affectedDeviceCount: 5,
          wasReenabled: false
        }
      },
      facilityId: 'FACILITY_001'
    },
    {
      id: 'alert_007',
      type: 'Water Low',
      severity: 'warning',
      status: 'active',
      category: 'WATER_RESOURCE',
      subcategory: 'WATER_LOW',
      deviceId: 'ESP32_TANK_03',
      timestamp: new Date(Date.now() - 2 * 3600000),
      message: 'Water tank TANK_003 level decreased to 35%. Monitor for further depletion.',
      resourceData: {
        tankId: 'TANK_003',
        waterLevel: 35,
        previousLevel: 45,
        municipalityStatus: {
          notified: false
        },
        sprinklerStatus: {
          wasDisabled: false
        }
      },
      facilityId: 'FACILITY_002'
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

  // Mock water tanks data
  const mockWaterTanks = [
    {
      tankId: 'TANK_001',
      zone: 'Zone A',
      currentLevel: 85,
      status: 'NORMAL',
      capacity: 50000,
      location: {
        address: 'Sector 12, Delhi',
        lat: 28.6139,
        lng: 77.209
      },
      municipality: {
        name: 'Delhi Municipal Corporation - Zone A',
        contact: {
          phone: '+91-11-2652-3456',
          email: 'water.zonea@dmc.gov.in'
        },
        lastNotified: null
      },
      sprinklersDisabled: false,
      sensorDeviceId: 'ESP32_TANK_01',
      lastUpdateTime: new Date(Date.now() - 10 * 60000)
    },
    {
      tankId: 'TANK_002',
      zone: 'Zone B',
      currentLevel: 18,
      status: 'CRITICAL',
      capacity: 75000,
      location: {
        address: 'Sector 18, Delhi',
        lat: 28.6292,
        lng: 77.2337
      },
      municipality: {
        name: 'Delhi Municipal Corporation - Zone B',
        contact: {
          phone: '+91-11-2652-7890',
          email: 'water.zoneb@dmc.gov.in'
        },
        lastNotified: new Date(Date.now() - 30 * 60000)
      },
      sprinklersDisabled: true,
      affectedDevices: 5,
      sensorDeviceId: 'ESP32_TANK_02',
      lastUpdateTime: new Date(Date.now() - 5 * 60000)
    },
    {
      tankId: 'TANK_003',
      zone: 'Industrial Zone',
      currentLevel: 45,
      status: 'NORMAL',
      capacity: 100000,
      location: {
        address: 'Industrial Area Phase 2',
        lat: 28.4595,
        lng: 77.0266
      },
      municipality: {
        name: 'Industrial Development Authority',
        contact: {
          phone: '+91-124-2345-678',
          email: 'water.industrial@ida.gov.in'
        },
        lastNotified: null
      },
      sprinklersDisabled: false,
      sensorDeviceId: 'ESP32_TANK_03',
      lastUpdateTime: new Date(Date.now() - 2 * 60000)
    }
  ];

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch alerts, devices, and water tanks in parallel
      const [alertsRes, waterTanksRes] = await Promise.all([
        alertAPI.getAll().catch(err => {
          console.warn('Failed to fetch alerts from API, using mock data:', err);
          return { data: { success: true, data: mockAlerts } };
        }),
        waterTankAPI.getAll().catch(err => {
          console.warn('Failed to fetch water tanks from API, using mock data:', err);
          return { data: { success: true, data: mockWaterTanks } };
        })
      ]);

      // Process alerts - transform MongoDB _id to id for React keys
      const alertsData = alertsRes.data?.data || alertsRes.data || mockAlerts;
      const processedAlerts = (Array.isArray(alertsData) ? alertsData : mockAlerts).map(alert => ({
        ...alert,
        id: alert.id || alert._id // Use existing id or MongoDB _id
      }));
      setAlerts(processedAlerts);
      
      // Process water tanks - ensure tankId is present for React keys
      const tanksData = waterTanksRes.data?.data || waterTanksRes.data || mockWaterTanks;
      setWaterTanks(Array.isArray(tanksData) ? tanksData : mockWaterTanks);
      
      // Use mock devices (no device API yet)
      setDevices(mockDevices);
      
      // Update stats with processed alerts
      updateStats(processedAlerts);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Using offline mode.');
      
      // Fallback to mock data
      setAlerts(mockAlerts);
      setDevices(mockDevices);
      setWaterTanks(mockWaterTanks);
      updateStats(mockAlerts);
    } finally {
      setLoading(false);
    }
  };

  // Fetch water tanks separately for refresh
  const fetchWaterTanks = async () => {
    setWaterTanksLoading(true);
    try {
      const response = await waterTankAPI.getAll();
      const tanksData = response.data?.data || response.data || mockWaterTanks;
      setWaterTanks(Array.isArray(tanksData) ? tanksData : mockWaterTanks);
    } catch (err) {
      console.error('Error fetching water tanks:', err);
      // Keep existing data on error
    } finally {
      setWaterTanksLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh for water tanks every 30 seconds
    const intervalId = setInterval(() => {
      fetchWaterTanks();
    }, 30000);
    
    return () => clearInterval(intervalId);
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
      if (filters.category && alert.category !== filters.category) {
        return false;
      }
      if (filters.device && !alert.deviceId.toLowerCase().includes(filters.device.toLowerCase())) {
        return false;
      }
      // Date range filtering logic
      const alertTime = alert.timestamp instanceof Date 
        ? alert.timestamp.getTime() 
        : new Date(alert.timestamp).getTime();
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
    // Get date range for report (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Filter alerts from last 7 days
    const weeklyAlerts = alerts.filter(alert => {
      const alertDate = alert.timestamp instanceof Date 
        ? alert.timestamp 
        : new Date(alert.timestamp);
      return alertDate >= startDate && alertDate <= endDate;
    });

    // === SECTION 1: Alert Details ===
    const alertHeaders = [
      'Alert ID',
      'Timestamp',
      'Category',
      'Subcategory',
      'Severity',
      'Status',
      'Device/Tank ID',
      'Zone',
      'Description',
      'Smoke PPM',
      'Temperature (°C)',
      'Humidity (%)',
      'Water Level (%)',
      'AQI',
      'Automation Actions',
      'Municipality Notified',
      'Acknowledged By',
      'Acknowledged At',
      'Resolved At',
      'Duration (hours)',
    ].join(',');

    const alertRows = weeklyAlerts.map(alert => {
      const timestamp = alert.timestamp instanceof Date 
        ? alert.timestamp.toLocaleString() 
        : new Date(alert.timestamp).toLocaleString();
      
      const acknowledgedAt = alert.acknowledgedAt 
        ? new Date(alert.acknowledgedAt).toLocaleString() 
        : 'N/A';
      
      const resolvedAt = alert.status === 'resolved' && alert.resolvedAt
        ? new Date(alert.resolvedAt).toLocaleString() 
        : 'N/A';
      
      // Calculate duration if resolved
      let duration = 'N/A';
      if (alert.status === 'resolved' && alert.acknowledgedAt && alert.resolvedAt) {
        const diff = new Date(alert.resolvedAt) - new Date(alert.acknowledgedAt);
        duration = (diff / (1000 * 60 * 60)).toFixed(2);
      }

      // Get automation actions
      const actions = alert.automationActions?.join('; ') || alert.actions?.join('; ') || 'None';
      
      // Get municipality status
      const municipalityNotified = alert.resourceData?.municipalityStatus?.notified ? 'Yes' : 'No';

      // Safely escape message
      const message = (alert.message || '').replace(/"/g, '""');

      return [
        alert.id || 'N/A',
        timestamp,
        alert.category || 'N/A',
        alert.subcategory || alert.type || 'N/A',
        alert.severity || 'N/A',
        alert.status || 'N/A',
        alert.deviceId || alert.resourceData?.tankId || 'N/A',
        alert.resourceData?.zone || 'N/A',
        `"${message}"`,
        alert.readings?.smoke || 'N/A',
        alert.readings?.temperature || 'N/A',
        alert.readings?.humidity || 'N/A',
        alert.resourceData?.waterLevel || 'N/A',
        alert.readings?.aqi || 'N/A',
        `"${actions}"`,
        municipalityNotified,
        alert.acknowledgedBy || 'N/A',
        acknowledgedAt,
        resolvedAt,
        duration,
      ].join(',');
    }).join('\n');

    // === SECTION 2: Weekly Summary ===
    const summaryData = {
      totalAlerts: weeklyAlerts.length,
      bySeverity: {
        critical: weeklyAlerts.filter(a => a.severity === 'critical').length,
        warning: weeklyAlerts.filter(a => a.severity === 'warning').length,
        info: weeklyAlerts.filter(a => a.severity === 'info').length,
      },
      byCategory: {
        airQuality: weeklyAlerts.filter(a => a.category === 'AIR_QUALITY').length,
        waterResource: weeklyAlerts.filter(a => a.category === 'WATER_RESOURCE').length,
        device: weeklyAlerts.filter(a => a.category === 'DEVICE').length,
        municipality: weeklyAlerts.filter(a => a.category === 'MUNICIPALITY').length,
      },
      byStatus: {
        active: weeklyAlerts.filter(a => a.status === 'active').length,
        acknowledged: weeklyAlerts.filter(a => a.status === 'acknowledged').length,
        resolved: weeklyAlerts.filter(a => a.status === 'resolved').length,
      },
    };

    const summaryHeaders = 'Metric,Value';
    const summaryRows = [
      `Report Period,${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      `Generated On,${new Date().toLocaleString()}`,
      `Total Alerts (Last 7 Days),${summaryData.totalAlerts}`,
      '',
      'ALERTS BY SEVERITY',
      `Critical,${summaryData.bySeverity.critical}`,
      `Warning,${summaryData.bySeverity.warning}`,
      `Info,${summaryData.bySeverity.info}`,
      '',
      'ALERTS BY CATEGORY',
      `Air Quality,${summaryData.byCategory.airQuality}`,
      `Water Resource,${summaryData.byCategory.waterResource}`,
      `Device,${summaryData.byCategory.device}`,
      `Municipality,${summaryData.byCategory.municipality}`,
      '',
      'ALERTS BY STATUS',
      `Active,${summaryData.byStatus.active}`,
      `Acknowledged,${summaryData.byStatus.acknowledged}`,
      `Resolved,${summaryData.byStatus.resolved}`,
    ].join('\n');

    // === SECTION 3: Water Tank Summary ===
    const tankHeaders = [
      'Tank ID',
      'Zone',
      'Current Level (%)',
      'Status',
      'Capacity (L)',
      'Sprinklers Available',
      'Municipality Alerts (7 days)',
      'Last Updated',
    ].join(',');

    const tankRows = waterTanks.map(tank => {
      const municipalityAlerts = weeklyAlerts.filter(
        a => a.category === 'MUNICIPALITY' && a.resourceData?.tankId === tank.tankId
      ).length;

      const lastUpdate = tank.lastUpdateTime || tank.lastUpdate;
      const lastUpdateStr = lastUpdate 
        ? (lastUpdate instanceof Date ? lastUpdate : new Date(lastUpdate)).toLocaleString()
        : 'N/A';

      return [
        tank.tankId || 'N/A',
        tank.zone || 'N/A',
        tank.currentLevel || 'N/A',
        tank.status || 'N/A',
        tank.capacity || 'N/A',
        tank.sprinklersDisabled ? 'No' : 'Yes',
        municipalityAlerts,
        lastUpdateStr,
      ].join(',');
    }).join('\n');

    // === SECTION 4: Device Performance (if needed) ===
    const deviceSummary = weeklyAlerts.reduce((acc, alert) => {
      const deviceId = alert.deviceId || 'Unknown';
      if (!acc[deviceId]) {
        acc[deviceId] = {
          deviceId,
          totalAlerts: 0,
          critical: 0,
          warning: 0,
          info: 0,
        };
      }
      acc[deviceId].totalAlerts++;
      if (alert.severity === 'critical') acc[deviceId].critical++;
      if (alert.severity === 'warning') acc[deviceId].warning++;
      if (alert.severity === 'info') acc[deviceId].info++;
      return acc;
    }, {});

    const deviceHeaders = 'Device ID,Total Alerts,Critical,Warning,Info';
    const deviceRows = Object.values(deviceSummary)
      .sort((a, b) => b.totalAlerts - a.totalAlerts)
      .map(d => [d.deviceId, d.totalAlerts, d.critical, d.warning, d.info].join(','))
      .join('\n');

    // === Combine all sections into one CSV ===
    const csvContent = [
      '=== VAYUDRISHTI ALERT MANAGEMENT REPORT ===',
      '',
      '',
      '=== WEEKLY SUMMARY ===',
      summaryHeaders,
      summaryRows,
      '',
      '',
      '=== ALERT DETAILS ===',
      alertHeaders,
      alertRows,
      '',
      '',
      '=== WATER TANK STATUS ===',
      tankHeaders,
      tankRows,
      '',
      '',
      '=== DEVICE PERFORMANCE ===',
      deviceHeaders,
      deviceRows,
      '',
      '',
      '--- End of Report ---',
    ].join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const filename = `VayuDrishti_Alert_Report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`Exported ${weeklyAlerts.length} alerts from the last 7 days`);
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
        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300">{error}</span>
            </div>
            <button
              onClick={fetchData}
              className="text-sm text-yellow-400 hover:text-yellow-300 underline"
            >
              Retry
            </button>
          </div>
        )}

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

        {/* Water Tanks Overview Section */}
        <div className="bg-gray-900/40 border border-gray-700/50 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Droplets className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Water Tanks Overview</h2>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400">{waterTanks.length} tanks monitored</span>
              <button
                onClick={fetchWaterTanks}
                disabled={waterTanksLoading}
                className="flex items-center space-x-1 px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh water tanks"
              >
                <RefreshCw className={`w-4 h-4 ${waterTanksLoading ? 'animate-spin' : ''}`} />
                <span className="text-xs">Refresh</span>
              </button>
            </div>
          </div>
          {waterTanksLoading && waterTanks.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-2"></div>
                <p className="text-gray-400 text-sm">Loading water tanks...</p>
              </div>
            </div>
          ) : waterTanks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Droplets className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No water tanks found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {waterTanks.map(tank => (
                <WaterTankWidget key={tank.tankId} tank={tank} compact={true} />
              ))}
            </div>
          )}
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
