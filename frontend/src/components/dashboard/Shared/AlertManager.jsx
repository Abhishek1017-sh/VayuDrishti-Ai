import { motion } from 'framer-motion';
import { AlertCircle, Trash2, CheckCircle, Clock } from 'lucide-react';

function AlertManager({ alerts = [], onAcknowledge = null, onDelete = null, maxItems = 10 }) {
  const displayAlerts = alerts.slice(0, maxItems);
  const hasMore = alerts.length > maxItems;

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'critical': return 'from-red-500/20 to-red-700/10';
      case 'warning': return 'from-orange-500/20 to-orange-700/10';
      case 'info': return 'from-blue-500/20 to-blue-700/10';
      default: return 'from-gray-500/20 to-gray-700/10';
    }
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'critical' || severity === 'warning') {
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
    return <Clock className="w-5 h-5 text-blue-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-white/5 backdrop-blur"
      style={{
        background: `linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))`
      }}
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
          <p className="text-sm text-gray-400">{alerts.length} total alerts</p>
        </div>

        {/* Alerts List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {displayAlerts.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <p>No active alerts</p>
            </div>
          ) : (
            displayAlerts.map((alert, index) => (
              <motion.div
                key={alert.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative overflow-hidden rounded-lg p-3 border border-white/5 backdrop-blur bg-gradient-to-br ${getAlertColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3 flex-1">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">{alert.title}</p>
                      <p className="text-xs text-gray-300 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{alert.timestamp}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {onAcknowledge && (
                      <button
                        onClick={() => onAcknowledge(alert.id)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Acknowledge"
                      >
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(alert.id)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {hasMore && (
          <div className="pt-3 border-t border-white/10 text-center">
            <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
              View all {alerts.length} alerts →
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default AlertManager;
