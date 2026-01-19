import { motion } from 'framer-motion';
import { Activity, Droplets, Gauge, CheckCircle, AlertCircle } from 'lucide-react';

function SensorPanel({ data }) {
  if (!data) {
    return (
      <div className="card p-6 h-full">
        <div className="text-center text-gray-500">No sensor data available</div>
      </div>
    );
  }

  const { smoke, humidity, pollutionIndex, timestamp } = data.processed || data;

  const sensorMetrics = [
    {
      label: 'Smoke Level',
      value: smoke?.toFixed(1) || 0,
      unit: 'ppm',
      icon: Activity,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'Humidity',
      value: humidity?.toFixed(1) || 0,
      unit: '%',
      icon: Droplets,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Pollution Index',
      value: pollutionIndex || 0,
      unit: '/100',
      icon: Gauge,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  // Simple health check
  const isHealthy = timestamp && (Date.now() - new Date(timestamp).getTime()) < 5 * 60 * 1000;

  return (
    <div className="card p-6 h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sensor Data
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Real-time readings
          </p>
        </div>

        {/* Health Indicator */}
        <div className={`flex items-center space-x-1 text-xs ${
          isHealthy ? 'text-green-600' : 'text-red-600'
        }`}>
          {isHealthy ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Healthy</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4" />
              <span>Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Sensor Metrics */}
      <div className="space-y-4">
        {sensorMetrics.map((metric, index) => {
          const Icon = metric.icon;
          
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`${metric.bgColor} p-2 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {metric.label}
                  </p>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {metric.value}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {metric.unit}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Raw Data Toggle (Optional) */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-border">
        <details className="text-xs text-gray-600 dark:text-gray-400">
          <summary className="cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">
            Raw sensor values
          </summary>
          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded font-mono">
            <div>Smoke: {data.raw?.smoke || data.smoke || 0}</div>
            <div>Humidity: {data.raw?.humidity || data.humidity || 0}</div>
          </div>
        </details>
      </div>
    </div>
  );
}

export default SensorPanel;
