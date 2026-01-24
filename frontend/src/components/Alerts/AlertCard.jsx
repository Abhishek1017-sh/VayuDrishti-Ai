import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Zap, Thermometer, Droplets, Wifi, Trash2 } from 'lucide-react';

function AlertCard({ alert, onAcknowledge, onResolve, onDelete }) {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'from-red-500/20 to-red-700/10 border-red-400/30';
      case 'warning':
        return 'from-orange-500/20 to-orange-700/10 border-orange-400/30';
      case 'info':
        return 'from-blue-500/20 to-blue-700/10 border-blue-400/30';
      default:
        return 'from-gray-500/20 to-gray-700/10 border-gray-400/30';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-400" />;
      case 'info':
        return <Zap className="w-5 h-5 text-blue-400" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-red-500/30 text-red-300';
      case 'acknowledged':
        return 'bg-yellow-500/30 text-yellow-300';
      case 'resolved':
        return 'bg-green-500/30 text-green-300';
      default:
        return 'bg-gray-500/30 text-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl p-4 border backdrop-blur bg-gradient-to-br ${getSeverityColor(
        alert.severity
      )}`}
    >
      <div className="relative space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3 flex-1">
            {getSeverityIcon(alert.severity)}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">{alert.type}</p>
              <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
            </div>
          </div>

          <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${getStatusColor(alert.status)}`}>
            {alert.status.toUpperCase()}
          </span>
        </div>

        {/* Sensor Readings */}
        <div className="grid grid-cols-3 gap-2 p-2 bg-black/20 rounded-lg text-xs">
          <div className="flex items-center space-x-1 text-gray-300">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span>{alert.readings?.smoke || alert.smokePPM || 'N/A'} PPM</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-300">
            <Thermometer className="w-3 h-3 text-red-400" />
            <span>{(alert.readings?.temperature || alert.temperature || 0).toFixed(1)}°C</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-300">
            <Droplets className="w-3 h-3 text-blue-400" />
            <span>{(alert.readings?.humidity || alert.humidity || 0).toFixed(1)}%</span>
          </div>
        </div>

        {/* Automation Actions */}
        {alert.automationActions && alert.automationActions.length > 0 && (
          <div className="p-2 bg-black/20 rounded-lg space-y-1">
            <p className="text-xs text-gray-400 font-semibold">Automation Actions:</p>
            {alert.automationActions.map((action, idx) => (
              <div key={idx} className="text-xs text-gray-300 flex items-center space-x-2">
                <span>•</span>
                <span>{action}</span>
              </div>
            ))}
          </div>
        )}

        {/* Device & Timestamp */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-gray-400">
          <span>{alert.deviceId}</span>
          <span>
            {alert.timestamp instanceof Date 
              ? alert.timestamp.toLocaleString('en-US', { 
                  month: '2-digit', 
                  day: '2-digit', 
                  year: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false 
                })
              : new Date(alert.timestamp).toLocaleString('en-US', { 
                  month: '2-digit', 
                  day: '2-digit', 
                  year: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false 
                })
            }
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {alert.status !== 'acknowledged' && onAcknowledge && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="flex-1 px-2 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded text-xs font-semibold transition-colors"
            >
              Acknowledge
            </button>
          )}
          {alert.status !== 'resolved' && onResolve && (
            <button
              onClick={() => onResolve(alert.id)}
              className="flex-1 px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded text-xs font-semibold transition-colors"
            >
              Resolve
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(alert.id)}
              className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-colors"
              title="Delete alert"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default AlertCard;
