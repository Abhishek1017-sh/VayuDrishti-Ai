import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';

function AlertTable({ alerts, onAcknowledge, onResolve, onDelete }) {
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });

  const getSortedAlerts = () => {
    const sorted = [...alerts].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (sortConfig.key === 'timestamp') {
        return sortConfig.direction === 'desc'
          ? new Date(bValue) - new Date(aValue)
          : new Date(aValue) - new Date(bValue);
      }

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'desc'
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      }

      return sortConfig.direction === 'desc' ? bValue - aValue : aValue - bValue;
    });

    return sorted;
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const SortHeader = ({ label, sortKey }) => (
    <button
      onClick={() => handleSort(sortKey)}
      className="flex items-center space-x-1 hover:text-cyan-300 transition-colors"
    >
      <span>{label}</span>
      {sortConfig.key === sortKey && (
        sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
      )}
    </button>
  );

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-300';
      case 'warning':
        return 'bg-orange-500/20 text-orange-300';
      case 'info':
        return 'bg-blue-500/20 text-blue-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'resolved' ? (
      <CheckCircle className="w-4 h-4 text-green-400" />
    ) : (
      <AlertCircle className="w-4 h-4 text-yellow-400" />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl overflow-hidden border border-slate-700/50 backdrop-blur bg-slate-900/20"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-slate-900/40 to-slate-800/40 border-b border-slate-700/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-400">
                <SortHeader label="Type" sortKey="type" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-400">
                <SortHeader label="Severity" sortKey="severity" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-400">
                <SortHeader label="Status" sortKey="status" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-400">
                <SortHeader label="Device" sortKey="deviceId" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-400">
                <SortHeader label="Time" sortKey="timestamp" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-400">Readings</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-cyan-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {getSortedAlerts().map((alert, idx) => (
              <motion.tr
                key={alert.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="text-gray-300">{alert.type}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(alert.status)}
                    <span className="text-gray-300">{alert.status}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-400 font-mono text-xs">{alert.deviceId}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-400 text-xs">{alert.timestamp}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-400 text-xs">
                    {alert.smokePPM}PPM / {alert.temperature}°C / {alert.humidity}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center space-x-2">
                    {alert.status !== 'acknowledged' && onAcknowledge && (
                      <button
                        onClick={() => onAcknowledge(alert.id)}
                        className="px-2 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded text-xs font-semibold transition-colors"
                      >
                        ACK
                      </button>
                    )}
                    {alert.status !== 'resolved' && onResolve && (
                      <button
                        onClick={() => onResolve(alert.id)}
                        className="px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded text-xs font-semibold transition-colors"
                      >
                        Fix
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(alert.id)}
                        className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs font-semibold transition-colors"
                      >
                        Del
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {alerts.length === 0 && (
        <div className="px-4 py-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-500/40 mx-auto mb-3" />
          <p className="text-gray-400">No alerts found</p>
        </div>
      )}
    </motion.div>
  );
}

export default AlertTable;
