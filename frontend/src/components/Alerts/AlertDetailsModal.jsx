import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Power, Zap, Thermometer, Droplets, Clock } from 'lucide-react';

function AlertDetailsModal({ alert, isOpen, onClose, onRelayControl }) {
  const [selectedRelay, setSelectedRelay] = useState(null);
  const [relayDuration, setRelayDuration] = useState(30);

  if (!isOpen || !alert) return null;

  const handleRelayToggle = (relay) => {
    if (onRelayControl) {
      onRelayControl(alert.deviceId, relay, !alert.relayStates?.[relay]?.active);
      setSelectedRelay(null);
    }
  };

  const getRelayStatus = (relay) => {
    // For demo purposes, show OFF status
    return 'OFF';
  };

  const getRelayColor = (relay) => {
    return 'text-red-400';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{alert.type}</h2>
              <p className="text-gray-400">{alert.message}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Status Overview */}
            <div className="grid grid-cols-4 gap-3 p-4 bg-slate-800/50 rounded-xl">
              <div>
                <p className="text-xs text-gray-400 mb-1">Severity</p>
                <p className="text-sm font-semibold text-orange-400 uppercase">{alert.severity}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <p className="text-sm font-semibold text-yellow-400 uppercase">{alert.status}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Device</p>
                <p className="text-sm font-semibold text-cyan-400 font-mono">{alert.deviceId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Time</p>
                <p className="text-sm font-semibold text-gray-300">{alert.timestamp instanceof Date ? alert.timestamp.toLocaleString() : alert.timestamp}</p>
              </div>
            </div>

            {/* Sensor Readings */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Sensor Readings</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-slate-800/50 rounded-xl border border-yellow-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-gray-400">Smoke Level</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">{alert.readings?.smoke || 'N/A'}</p>
                  <p className="text-xs text-gray-500 mt-1">PPM</p>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-xl border border-red-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Thermometer className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-gray-400">Temperature</span>
                  </div>
                  <p className="text-2xl font-bold text-red-400">{alert.readings?.temperature?.toFixed(1) || 'N/A'}</p>
                  <p className="text-xs text-gray-500 mt-1">°C</p>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-xl border border-blue-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-gray-400">Humidity</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{alert.readings?.humidity?.toFixed(1) || 'N/A'}</p>
                  <p className="text-xs text-gray-500 mt-1">%</p>
                </div>
              </div>
            </div>

            {/* Relay Control Panel */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Device Control</h3>
              <div className="grid grid-cols-3 gap-3">
                {['led', 'fan', 'pump'].map((relay) => (
                  <button
                    key={relay}
                    onClick={() => handleRelayToggle(relay)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      getRelayStatus(relay) === 'ON'
                        ? 'bg-green-500/20 border-green-500/50'
                        : 'bg-slate-800/50 border-slate-700/50'
                    } hover:border-opacity-100 group`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-white uppercase">{relay}</span>
                      <Power className={`w-4 h-4 ${getRelayColor(relay)}`} />
                    </div>
                    <p className={`text-lg font-bold ${getRelayColor(relay)}`}>{getRelayStatus(relay)}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Pump Duration Control */}
            {false && (
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <label className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Pump Duration:</span>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="10"
                    value={relayDuration}
                    onChange={(e) => setRelayDuration(Number(e.target.value))}
                    className="flex-1 accent-blue-400"
                  />
                  <span className="text-sm font-semibold text-blue-400 min-w-12">{relayDuration}s</span>
                </label>
              </div>
            )}

            {/* Automation Actions Log */}
            {alert.automationActions && alert.automationActions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Automation Actions</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {alert.automationActions.map((action, idx) => (
                    <div key={idx} className="p-2 bg-slate-800/30 rounded text-xs text-gray-300 flex items-start space-x-2">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AlertDetailsModal;
