import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, TrendingDown, Clock, AlertTriangle } from 'lucide-react';
import AlertCard from '../../components/Alerts/AlertCard';
import AlertFilter from '../../components/Alerts/AlertFilter';
import AlertDetailsModal from '../../components/Alerts/AlertDetailsModal';
import { alertAPI } from '../../services/api';

const IndustryAlerts = ({ facilityId = 'FACILITY_001' }) => {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filters, setFilters] = useState({
    severity: [],
    status: [],
    dateRange: 'all',
    deviceId: ''
  });
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [complianceImpact, setComplianceImpact] = useState({
    currentScore: 92,
    riskAlerts: 0,
    complianceThreats: []
  });

  // Mock alerts data (facility-scoped)
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
      message: 'Smoke level exceeds safe threshold.',
      facilityId: 'FACILITY_001',
      complianceImpact: 'Potential NOx emissions violation',
      responseTime: null
    },
    {
      id: 'alert_002',
      type: 'High Temperature',
      severity: 'warning',
      status: 'acknowledged',
      deviceId: 'ESP32_002',
      timestamp: new Date(Date.now() - 30 * 60000),
      readings: {
        smoke: 280,
        temperature: 32.1,
        humidity: 58.0
      },
      automationActions: ['FAN_ON'],
      message: 'Temperature increased to unsafe levels.',
      facilityId: 'FACILITY_001',
      complianceImpact: 'Equipment temperature standard',
      responseTime: 45
    },
    {
      id: 'alert_003',
      type: 'Compliance Alert',
      severity: 'warning',
      status: 'active',
      deviceId: 'ESP32_001',
      timestamp: new Date(Date.now() - 2 * 3600000),
      readings: {
        smoke: 320,
        temperature: 27.0,
        humidity: 60.0
      },
      automationActions: [],
      message: 'Smoke levels approaching regulatory limits.',
      facilityId: 'FACILITY_001',
      complianceImpact: 'EPA limit threshold risk',
      responseTime: null
    }
  ];

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const facilityAlerts = mockAlerts.filter(a => a.facilityId === facilityId);
      setAlerts(facilityAlerts);
      
      // Calculate compliance impact
      const criticalAlerts = facilityAlerts.filter(a => a.severity === 'critical').length;
      setComplianceImpact({
        currentScore: 92 - (criticalAlerts * 10),
        riskAlerts: facilityAlerts.filter(a => a.complianceImpact).length,
        complianceThreats: facilityAlerts
          .filter(a => a.complianceImpact)
          .map(a => a.complianceImpact)
      });
      
      setLoading(false);
    }, 500);
  }, [facilityId]);

  const filterAlerts = () => {
    return alerts.filter(alert => {
      if (filters.severity.length > 0 && !filters.severity.includes(alert.severity)) {
        return false;
      }
      if (filters.status.length > 0 && !filters.status.includes(alert.status)) {
        return false;
      }
      if (filters.deviceId && !alert.deviceId.includes(filters.deviceId)) {
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

  const handleAddNote = (alertId, note) => {
    setNotes(prev => ({
      ...prev,
      [alertId]: note
    }));
  };

  const handleAcknowledge = (alertId) => {
    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? {
              ...a,
              status: 'acknowledged',
              responseTime: Math.round((Date.now() - a.timestamp) / 60000)
            }
          : a
      )
    );
  };

  const filteredAlerts = filterAlerts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading facility alerts...</p>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Facility Alert Management</h1>
          <p className="text-gray-400">Compliance-focused alert tracking and documentation</p>
        </div>

        {/* Compliance Status */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg p-6 mb-8"
        >
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-gray-400 text-sm mb-2">Compliance Score</p>
              <div className="flex items-end gap-3">
                <p className="text-4xl font-bold text-blue-400">{complianceImpact.currentScore}%</p>
                <div className="w-40 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${complianceImpact.currentScore}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                </div>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Risk Alerts</p>
              <p className="text-4xl font-bold text-yellow-400">{complianceImpact.riskAlerts}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Compliance Threats</p>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {complianceImpact.complianceThreats.map((threat, idx) => (
                  <p key={idx} className="text-xs text-red-300">{threat}</p>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Automation Timeline */}
        <div className="bg-gray-900/40 border border-gray-700/50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock size={24} />
            Automated Response Timeline
          </h2>
          <div className="space-y-3">
            {alerts
              .filter(a => a.automationActions.length > 0)
              .map((alert, idx) => (
                <div key={alert.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    {idx < alerts.filter(a => a.automationActions.length > 0).length - 1 && (
                      <div className="w-1 h-12 bg-gray-700"></div>
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-white font-semibold">{alert.type}</p>
                    <p className="text-sm text-gray-400">{alert.timestamp.toLocaleString()}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {alert.automationActions.map(action => (
                        <span
                          key={action}
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded"
                        >
                          ✓ {action.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <AlertFilter
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        {/* Alerts List */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">
            Active Alerts ({filteredAlerts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <AlertCard alert={alert} />
                </div>

                {/* Industry-specific overlay */}
                <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent rounded-lg border border-transparent"></div>

                {/* Compliance Impact Badge */}
                {alert.complianceImpact && (
                  <div className="absolute top-4 right-4 max-w-32 z-10">
                    <div className="bg-yellow-900/80 border border-yellow-500/50 rounded px-2 py-1">
                      <p className="text-xs text-yellow-200 font-semibold flex items-center gap-1">
                        <AlertTriangle size={12} />
                        {alert.complianceImpact}
                      </p>
                    </div>
                  </div>
                )}

                {/* Response Time */}
                {alert.responseTime && (
                  <div className="absolute bottom-4 right-4 bg-green-900/80 border border-green-500/50 rounded px-2 py-1">
                    <p className="text-xs text-green-200">
                      Ack: {alert.responseTime}min
                    </p>
                  </div>
                )}

                {/* Notes Section */}
                <div className="mt-3 bg-gray-800/50 rounded p-3 border border-gray-700/50">
                  <label className="block text-xs text-gray-400 mb-2 flex items-center gap-1">
                    <MessageSquare size={14} />
                    Investigation Notes
                  </label>
                  <textarea
                    value={notes[alert.id] || ''}
                    onChange={(e) => handleAddNote(alert.id, e.target.value)}
                    placeholder="Document findings, actions taken, or notes..."
                    className="w-full bg-gray-900/50 text-gray-300 text-xs rounded p-2 border border-gray-700/50 focus:border-blue-500/50 focus:outline-none resize-none h-16"
                  />
                  {alert.status === 'active' && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="mt-2 w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      Acknowledge & Document
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Alert Details Modal - Read-only for industry users */}
      {selectedAlert && (
        <AlertDetailsModal
          alert={selectedAlert}
          isOpen={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          isAdmin={false}
          showRelayControls={false}
        />
      )}
    </div>
  );
};

export default IndustryAlerts;
