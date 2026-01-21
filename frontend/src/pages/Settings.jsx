import { motion } from 'framer-motion';
import { Bell, Sliders, MapPin, Database } from 'lucide-react';

function Settings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure system preferences and thresholds
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Thresholds */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-lg">
              <Bell className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Alert Thresholds
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Warning Threshold (AQI)
              </label>
              <input
                type="number"
                defaultValue="100"
                className="w-full px-4 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Trigger alerts when AQI exceeds this value
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Critical Threshold (AQI)
              </label>
              <input
                type="number"
                defaultValue="150"
                className="w-full px-4 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Trigger critical actions when AQI exceeds this value
              </p>
            </div>
          </div>
        </motion.div>

        {/* Automation Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
              <Sliders className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Automation Settings
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Water Sprinkling Cooldown (minutes)
              </label>
              <input
                type="number"
                defaultValue="30"
                className="w-full px-4 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ventilation Cooldown (minutes)
              </label>
              <input
                type="number"
                defaultValue="15"
                className="w-full px-4 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Safety Delay (seconds)
              </label>
              <input
                type="number"
                defaultValue="5"
                className="w-full px-4 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </motion.div>

        {/* Location Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Location Settings
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location Name
              </label>
              <input
                type="text"
                defaultValue="Default Location"
                className="w-full px-4 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Coordinates
              </label>
              <input
                type="text"
                placeholder="Latitude, Longitude"
                className="w-full px-4 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
              <Database className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Data Management
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Retention (days)
              </label>
              <input
                type="number"
                defaultValue="7"
                className="w-full px-4 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Automatically delete data older than this period
              </p>
            </div>

            <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
              Clear All Historical Data
            </button>
          </div>
        </motion.div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
          Save Settings
        </button>
      </div>

      {/* Note */}
      <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> Settings changes are currently for demonstration only. 
          In production, these would be persisted to a database.
        </p>
      </div>
    </div>
  );
}

export default Settings;
