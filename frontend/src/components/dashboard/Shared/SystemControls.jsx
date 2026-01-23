import { motion } from 'framer-motion';
import { Sliders, Save, RotateCcw } from 'lucide-react';
import { useState } from 'react';

function SystemControls({ onSave = null, defaultSettings = {} }) {
  const [settings, setSettings] = useState({
    aqiThreshold: defaultSettings.aqiThreshold || 100,
    autoSprayThreshold: defaultSettings.autoSprayThreshold || 150,
    ventilationMode: defaultSettings.ventilationMode || 'auto',
    notificationEnabled: defaultSettings.notificationEnabled !== false,
    automationEnabled: defaultSettings.automationEnabled !== false
  });

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave?.(settings);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-6 border border-white/5 backdrop-blur space-y-6"
      style={{
        background: `linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))`
      }}
    >
      <div className="flex items-center space-x-2">
        <Sliders className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">System Controls</h3>
      </div>

      {/* Control Items */}
      <div className="space-y-4">
        {/* AQI Threshold */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            AQI Alert Threshold: <span className="text-cyan-400">{settings.aqiThreshold}</span>
          </label>
          <input
            type="range"
            min="50"
            max="300"
            step="10"
            value={settings.aqiThreshold}
            onChange={(e) => handleChange('aqiThreshold', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <p className="text-xs text-gray-500">Alert triggers when AQI exceeds this value</p>
        </div>

        {/* Auto Spray Threshold */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Auto Spray Threshold: <span className="text-cyan-400">{settings.autoSprayThreshold}</span>
          </label>
          <input
            type="range"
            min="100"
            max="400"
            step="10"
            value={settings.autoSprayThreshold}
            onChange={(e) => handleChange('autoSprayThreshold', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <p className="text-xs text-gray-500">Auto activate spray/ventilation above this AQI</p>
        </div>

        {/* Ventilation Mode */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Ventilation Mode
          </label>
          <select
            value={settings.ventilationMode}
            onChange={(e) => handleChange('ventilationMode', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-white/10 focus:border-cyan-500 transition-colors"
          >
            <option value="manual">Manual Control</option>
            <option value="auto">Automatic</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.automationEnabled}
              onChange={(e) => handleChange('automationEnabled', e.target.checked)}
              className="w-4 h-4 rounded bg-gray-700 border-gray-600 cursor-pointer accent-cyan-500"
            />
            <span className="text-sm text-gray-300">Enable Automation</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notificationEnabled}
              onChange={(e) => handleChange('notificationEnabled', e.target.checked)}
              className="w-4 h-4 rounded bg-gray-700 border-gray-600 cursor-pointer accent-cyan-500"
            />
            <span className="text-sm text-gray-300">Enable Notifications</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-white/10">
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-medium"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
        <button
          onClick={handleReset}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>
    </motion.div>
  );
}

export default SystemControls;
