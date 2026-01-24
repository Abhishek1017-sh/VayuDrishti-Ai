import { motion } from 'framer-motion';
import { X, Filter } from 'lucide-react';

function AlertFilter({ filters, onFilterChange, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/30 to-slate-800/20 border border-slate-700/50 rounded-2xl p-6 backdrop-blur"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-white">Filters</h3>
        </div>
        {(filters.severity.length > 0 || filters.status.length > 0 || filters.dateRange !== 'all' || filters.category) && (
          <button
            onClick={onReset}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <X className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">Category</label>
          <select
            value={filters.category || 'all'}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value === 'all' ? '' : e.target.value })}
            className="w-full px-3 py-1 bg-slate-800/50 border border-slate-700 rounded text-xs text-gray-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Categories</option>
            <option value="AIR_QUALITY">Air Quality</option>
            <option value="WATER_RESOURCE">Water Resource</option>
            <option value="MUNICIPALITY">Municipality</option>
            <option value="DEVICE">Device</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">Severity</label>
          <div className="space-y-2">
            {['critical', 'warning', 'info'].map((severity) => (
              <label key={severity} className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.severity.includes(severity)}
                  onChange={(e) => {
                    const newSeverity = e.target.checked
                      ? [...filters.severity, severity]
                      : filters.severity.filter((s) => s !== severity);
                    onFilterChange({ ...filters, severity: newSeverity });
                  }}
                  className="w-3 h-3 rounded accent-cyan-400"
                />
                <span className="text-xs text-gray-300 group-hover:text-gray-200">
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">Status</label>
          <div className="space-y-2">
            {['active', 'acknowledged', 'resolved'].map((status) => (
              <label key={status} className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.status.includes(status)}
                  onChange={(e) => {
                    const newStatus = e.target.checked
                      ? [...filters.status, status]
                      : filters.status.filter((s) => s !== status);
                    onFilterChange({ ...filters, status: newStatus });
                  }}
                  className="w-3 h-3 rounded accent-cyan-400"
                />
                <span className="text-xs text-gray-300 group-hover:text-gray-200">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">Date Range</label>
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange({ ...filters, dateRange: e.target.value })}
            className="w-full px-3 py-1 bg-slate-800/50 border border-slate-700 rounded text-xs text-gray-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Time</option>
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>

        {/* Device Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">Device</label>
          <input
            type="text"
            placeholder="Device ID..."
            value={filters.device}
            onChange={(e) => onFilterChange({ ...filters, device: e.target.value })}
            className="w-full px-3 py-1 bg-slate-800/50 border border-slate-700 rounded text-xs text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>
    </motion.div>
  );
}

export default AlertFilter;
