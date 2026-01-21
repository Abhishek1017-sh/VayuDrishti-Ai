import { motion } from 'framer-motion';
import { Droplet, Wind, Clock, Zap } from 'lucide-react';

function AutomationPanel({ data }) {
  if (!data) {
    return (
      <div className="card p-6">
        <div className="text-center text-gray-500">No automation data available</div>
      </div>
    );
  }

  const { waterSprinkling, ventilation, safetyDelay, thresholds } = data;

  const systems = [
    {
      name: 'Water Sprinkling',
      icon: Droplet,
      active: waterSprinkling?.active || false,
      lastActivated: waterSprinkling?.lastActivated,
      onCooldown: waterSprinkling?.onCooldown || false,
      cooldownRemaining: waterSprinkling?.cooldownRemaining || 0,
      color: 'blue',
    },
    {
      name: 'Ventilation',
      icon: Wind,
      active: ventilation?.active || false,
      lastActivated: ventilation?.lastActivated,
      onCooldown: ventilation?.onCooldown || false,
      cooldownRemaining: ventilation?.cooldownRemaining || 0,
      color: 'green',
    },
  ];

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Automation Status
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Automatic corrective actions
        </p>
      </div>

      {/* Systems Status */}
      <div className="space-y-4 mb-6">
        {systems.map((system, index) => {
          const Icon = system.icon;
          const statusColor = system.active 
            ? 'bg-green-500' 
            : system.onCooldown 
            ? 'bg-yellow-500' 
            : 'bg-gray-300 dark:bg-gray-600';

          return (
            <motion.div
              key={system.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`bg-${system.color}-100 dark:bg-${system.color}-900/20 p-2 rounded-lg`}>
                    <Icon className={`w-5 h-5 text-${system.color}-600`} />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {system.name}
                  </span>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${statusColor} animate-pulse-slow`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {system.active ? 'ON' : system.onCooldown ? 'COOLDOWN' : 'OFF'}
                  </span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {system.lastActivated && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      Last active: {new Date(system.lastActivated).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                
                {system.onCooldown && system.cooldownRemaining > 0 && (
                  <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400">
                    <Zap className="w-3 h-3" />
                    <span>
                      Cooldown: {system.cooldownRemaining} min remaining
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Safety Delay Indicator */}
      {safetyDelay?.active && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
        >
          <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-300">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">
              Safety delay active ({safetyDelay.remaining}s)
            </span>
          </div>
        </motion.div>
      )}

      {/* Thresholds */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-border">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Activation Thresholds
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
            <div className="text-gray-600 dark:text-gray-400">Alert</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              AQI {thresholds?.alert || 100}
            </div>
          </div>
          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded">
            <div className="text-gray-600 dark:text-gray-400">Critical</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              AQI {thresholds?.critical || 150}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AutomationPanel;
