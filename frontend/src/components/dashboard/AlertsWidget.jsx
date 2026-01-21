import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, AlertCircle, Info, ArrowRight } from 'lucide-react';

function AlertsWidget({ alerts }) {
  const activeAlerts = alerts?.active || [];
  const count = alerts?.count || 0;

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
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      default:
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Active Alerts
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {count} active alert{count !== 1 ? 's' : ''}
          </p>
        </div>

        <Link
          to="/alerts"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Alerts List */}
      {activeAlerts.length === 0 ? (
        <div className="text-center py-8">
          <Info className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400">
            No active alerts
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            All systems operating normally
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activeAlerts.slice(0, 5).map((alert, index) => {
            const Icon = getSeverityIcon(alert.severity);
            const colorClass = getSeverityColor(alert.severity);

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 border rounded-lg ${colorClass}`}
              >
                <div className="flex items-start space-x-3">
                  <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  
                  <div className="flex-grow min-w-0">
                    <p className="font-medium text-sm">
                      {alert.message}
                    </p>
                    
                    {alert.aqiValue && (
                      <p className="text-xs mt-1 opacity-75">
                        AQI: {alert.aqiValue} ({alert.category})
                      </p>
                    )}
                    
                    <p className="text-xs mt-1 opacity-60">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>

                    {/* Actions taken */}
                    {alert.actions && alert.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {alert.actions.map((action, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 bg-white/50 dark:bg-black/20 rounded"
                          >
                            {action.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {activeAlerts.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border text-center">
          <Link
            to="/alerts"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View {activeAlerts.length - 5} more alert{activeAlerts.length - 5 !== 1 ? 's' : ''}
          </Link>
        </div>
      )}
    </div>
  );
}

export default AlertsWidget;
