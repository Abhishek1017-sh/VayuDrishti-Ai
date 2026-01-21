import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { alertAPI } from '../services/api';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Clock } from 'lucide-react';

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all'); // all, active, acknowledged
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await alertAPI.getAll({ status: filter === 'all' ? undefined : filter });
      setAlerts(response.data.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const handleAcknowledge = async (alertId) => {
    try {
      await alertAPI.acknowledge(alertId, 'user');
      fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return AlertTriangle;
      case 'warning':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20';
      default:
        return 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const filteredAlerts = alerts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Alerts Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View and manage system alerts
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg p-1">
        {['all', 'active', 'acknowledged'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No alerts found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            All systems are operating normally
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert, index) => {
            const Icon = getSeverityIcon(alert.severity);
            const colorClass = getSeverityColor(alert.severity);

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`card p-6 ${colorClass}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-grow">
                    <div className={`p-3 rounded-lg ${
                      alert.severity === 'critical' 
                        ? 'bg-red-100 dark:bg-red-900/30' 
                        : alert.severity === 'warning'
                        ? 'bg-amber-100 dark:bg-amber-900/30'
                        : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        alert.severity === 'critical' 
                          ? 'text-red-600' 
                          : alert.severity === 'warning'
                          ? 'text-amber-600'
                          : 'text-blue-600'
                      }`} />
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {alert.message}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          alert.severity === 'critical'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                            : alert.severity === 'warning'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>

                      {alert.aqiValue && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          AQI: <span className="font-semibold">{alert.aqiValue}</span> ({alert.category})
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Actions taken */}
                      {alert.actions && alert.actions.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Actions Taken:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {alert.actions.map((action, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                              >
                                {action.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Acknowledged Info */}
                      {alert.acknowledged && (
                        <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                          <p className="text-xs text-green-700 dark:text-green-300">
                            ✓ Acknowledged by {alert.acknowledgedBy} at{' '}
                            {new Date(alert.acknowledgedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acknowledge Button */}
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Alerts;
