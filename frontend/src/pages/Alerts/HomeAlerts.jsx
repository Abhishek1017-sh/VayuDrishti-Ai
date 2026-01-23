import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Bell } from 'lucide-react';
import { alertAPI } from '../../services/api';

const HomeAlerts = ({ deviceId = 'ESP32_001' }) => {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Emoji mapping for smoke levels
  const getEmojiForSmoke = (smokePPM) => {
    if (smokePPM < 100) return { emoji: '😊', mood: 'Great', color: 'green' };
    if (smokePPM < 200) return { emoji: '😐', mood: 'Fair', color: 'yellow' };
    if (smokePPM < 350) return { emoji: '😟', mood: 'Poor', color: 'orange' };
    return { emoji: '😱', mood: 'Unsafe', color: 'red' };
  };

  // Mock alerts data (simplified for home user)
  const mockAlerts = [
    {
      id: 'alert_001',
      type: 'High Smoke Level',
      smokePPM: 450,
      temperature: 28.5,
      humidity: 62.3,
      message: 'Air quality is unsafe',
      automationActions: ['LED_ALERT_ON', 'FAN_ON'],
      timestamp: new Date(Date.now() - 5 * 60000),
      dismissed: false,
      canAutoDismiss: Date.now() + 24 * 3600000 // 24 hours
    },
    {
      id: 'alert_002',
      type: 'High Temperature',
      smokePPM: 280,
      temperature: 32.1,
      humidity: 58.0,
      message: 'Temperature is high',
      automationActions: ['FAN_ON'],
      timestamp: new Date(Date.now() - 30 * 60000),
      dismissed: false,
      canAutoDismiss: Date.now() + 24 * 3600000
    }
  ];

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const active = mockAlerts.filter(a => !a.dismissed);
      setActiveAlerts(active);
      setLoading(false);
    }, 500);
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // In production, fetch fresh data here
      console.log('Refreshing alerts...');
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleDismiss = (alertId) => {
    const dismissed = activeAlerts.find(a => a.id === alertId);
    setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
    setDismissedAlerts(prev => [...prev, dismissed]);
  };

  const getAutomationStatusEmoji = (actions) => {
    const emojis = [];
    if (actions.includes('LED_ALERT_ON')) emojis.push('💡');
    if (actions.includes('FAN_ON')) emojis.push('🌀');
    if (actions.includes('PUMP_ON')) emojis.push('💦');
    return emojis.length > 0 ? emojis.join(' ') : '⏸️';
  };

  const formatTime = (date) => {
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">😴</div>
          <p className="text-gray-400">Loading your home status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Your Home Status
        </h1>
        <p className="text-gray-400">Air quality monitoring & automatic controls</p>
      </motion.div>

      {/* Current Status - Large Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-2xl p-8 mb-8 text-center"
      >
        {activeAlerts.length > 0 && (
          <>
            <div className="text-8xl mb-4 animate-pulse">
              {getEmojiForSmoke(activeAlerts[0].smokePPM).emoji}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {getEmojiForSmoke(activeAlerts[0].smokePPM).mood} Air Quality
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              {activeAlerts[0].message}
            </p>

            {/* Current Readings */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Smoke</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {activeAlerts[0].smokePPM}
                </p>
                <p className="text-xs text-gray-500">PPM</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Temperature</p>
                <p className="text-3xl font-bold text-red-400">
                  {activeAlerts[0].temperature.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">°C</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Humidity</p>
                <p className="text-3xl font-bold text-blue-400">
                  {activeAlerts[0].humidity.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">%</p>
              </div>
            </div>

            {/* Automation Status */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <p className="text-gray-400 text-sm mb-2">Automatic Actions Active</p>
              <div className="text-5xl">
                {getAutomationStatusEmoji(activeAlerts[0].automationActions)}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {activeAlerts[0].automationActions.length > 0
                  ? 'Your home is protecting you'
                  : 'No automatic actions needed'}
              </p>
            </div>

            {/* Quick Suggestions */}
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold">
                📱 Notify Me When Safe
              </button>
              <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                📊 View Details
              </button>
            </div>
          </>
        )}

        {activeAlerts.length === 0 && (
          <>
            <div className="text-8xl mb-4">😊</div>
            <h2 className="text-2xl font-bold text-white mb-2">All Good!</h2>
            <p className="text-lg text-gray-300">
              Your home's air quality is perfect
            </p>
            <div className="mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
              <p className="text-green-300">✓ No alerts</p>
              <p className="text-green-300">✓ Safe conditions</p>
              <p className="text-green-300">✓ All systems normal</p>
            </div>
          </>
        )}
      </motion.div>

      {/* Active Alerts Cards */}
      <AnimatePresence>
        {activeAlerts.map((alert, index) => {
          const smokeInfo = getEmojiForSmoke(alert.smokePPM);
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br from-${smokeInfo.color}-900/30 to-${smokeInfo.color}-800/20 border-2 border-${smokeInfo.color}-500/50 rounded-xl p-6 mb-4`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{smokeInfo.emoji}</div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-white">
                      {alert.message}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {formatTime(alert.timestamp)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDismiss(alert.id)}
                  className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                >
                  <X size={24} className="text-gray-400 hover:text-white" />
                </button>
              </div>

              {/* Automation Status Inline */}
              <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-400 mb-2">Home is taking action:</p>
                <p className="text-2xl">
                  {getAutomationStatusEmoji(alert.automationActions)}
                </p>
              </div>

              {/* Simple Action Button */}
              <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm">
                Got it, let me know when it's safe
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/40 border border-gray-700/50 rounded-lg p-6 mb-8"
      >
        <h3 className="text-lg font-bold text-white mb-4">💡 Quick Tips</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <span className="text-2xl">🌬️</span>
            <div>
              <p className="text-white font-semibold text-sm">Check Window Seals</p>
              <p className="text-gray-400 text-xs">Ensure windows are properly closed to maintain air quality</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">🧹</span>
            <div>
              <p className="text-white font-semibold text-sm">Clean Air Filters</p>
              <p className="text-gray-400 text-xs">Consider replacing air filters if alerts persist</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">🚪</span>
            <div>
              <p className="text-white font-semibold text-sm">Limit Source Activity</p>
              <p className="text-gray-400 text-xs">Avoid cooking or smoking during poor air quality periods</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Settings Footer */}
      <div className="flex justify-center items-center gap-4">
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            autoRefresh
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          <RefreshCw size={16} />
          {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
          <Bell size={16} />
          Notifications
        </button>
      </div>
    </div>
  );
};

export default HomeAlerts;
