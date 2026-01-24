import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wind, Cloud, Droplets, Bell, Activity, Wifi, Heart, Thermometer } from 'lucide-react';
import AQIGauge from '../../components/Dashboard/Shared/AQIGauge';
import SimpleTrendChart from '../../components/Dashboard/Shared/SimpleTrendChart';
import MetricCard from '../../components/Dashboard/Shared/MetricCard';
import DiseaseInfoModal from '../../components/Home/DiseaseInfoModal';
import ApplianceRecommendations from '../../components/Home/ApplianceRecommendations';
import { homeAPI } from '../../services/api';

function HomeDashboard() {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifyWhenSafe, setNotifyWhenSafe] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const homeId = 'HOME_001'; // Should come from user auth context

  useEffect(() => {
    fetchHomeData();
    const interval = setInterval(fetchHomeData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [homeId]);

  const fetchHomeData = async () => {
    try {
      setError(null);
      const response = await homeAPI.getDashboard(homeId);
      
      if (response?.data?.success) {
        setHomeData(response.data);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error fetching home data:', err);
      setError('Failed to load home data. Using fallback data.');
      setHomeData(getMockHomeData());
    } finally {
      setLoading(false);
    }
  };

  const getHealthRecommendation = (aqi) => {
    if (aqi <= 50) {
      return {
        title: '✨ Air quality excellent!',
        message: 'Safe for outdoor activities',
        color: 'text-green-400',
        bg: 'from-green-500/20 to-green-700/10',
        icon: '🌞'
      };
    } else if (aqi <= 100) {
      return {
        title: '👍 Good air quality',
        message: 'Sensitive individuals take caution',
        color: 'text-yellow-400',
        bg: 'from-yellow-500/20 to-yellow-700/10',
        icon: '☀️'
      };
    } else if (aqi <= 150) {
      return {
        title: '⚠️ Reduce outdoor activities',
        message: 'Keep windows closed to reduce indoor pollution',
        color: 'text-orange-400',
        bg: 'from-orange-500/20 to-orange-700/10',
        icon: '🪟'
      };
    } else {
      return {
        title: '🚨 Stay indoors!',
        message: 'Use N95 mask if going out. Avoid strenuous activities',
        color: 'text-red-400',
        bg: 'from-red-500/20 to-red-700/10',
        icon: '😷'
      };
    }
  };

  if (loading && !homeData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-2" />
          <p className="text-gray-400">Loading air quality data...</p>
        </div>
      </div>
    );
  }

  // Transform API data to match component expectations
  const data = homeData && homeData.summary ? {
    currentAQI: homeData.summary.averageAQI || 0,
    aqiStatus: homeData.summary.overallStatus,
    temperature: homeData.rooms[0]?.temperature || 25,
    humidity: homeData.rooms[0]?.humidity || 60,
    location: `Home ${homeId}`,
    rooms: homeData.rooms || [],
    waterLevel: homeData.waterTank?.currentLevel || 0,
    waterStatus: homeData.waterTank?.status || 'UNKNOWN',
    totalRooms: homeData.summary.totalRooms || 0,
    goodRooms: homeData.summary.goodRooms || 0,
    alerts: homeData.recentAlerts || [],
  } : getMockHomeData();
  
  const recommendation = getHealthRecommendation(data.currentAQI);

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-400 text-sm">{error}</p>
        </div>
      )}

      {/* Simplified Header */}
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Home Air Quality Monitor</p>
        <h1 className="text-4xl font-bold text-white mt-2">Your Air Quality</h1>
        <p className="text-gray-400 mt-2">Real-time monitoring for your home - {data.totalRooms} rooms</p>
      </div>

      {/* Large AQI Gauge */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260 }}
        className="flex justify-center"
      >
        <AQIGauge aqi={data.currentAQI} size="large" status={data.aqiStatus} />
      </motion.div>

      {/* Health Recommendation Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`relative overflow-hidden rounded-3xl p-8 text-white text-center border border-white/5 backdrop-blur`}
        style={{
          background: `linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))`
        }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${recommendation.bg} opacity-70`} />

        <div className="relative space-y-4">
          <div className="text-5xl">{recommendation.icon}</div>
          <h2 className={`text-3xl font-bold ${recommendation.color}`}>
            {recommendation.title}
          </h2>
          <p className="text-lg text-gray-200 max-w-md mx-auto">
            {recommendation.message}
          </p>
        </div>
      </motion.div>

      {/* Simple Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl p-6 border border-white/5 backdrop-blur"
          style={{
            background: `linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-700/10 opacity-70" />
          <div className="relative space-y-2">
            <div className="flex items-center space-x-2 text-gray-300">
              <Cloud className="w-5 h-5 text-red-400" />
              <span className="text-sm">Temperature</span>
            </div>
            <p className="text-4xl font-bold text-white">{data.temperature}°C</p>
            <p className="text-xs text-gray-400">Comfortable for activities</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-2xl p-6 border border-white/5 backdrop-blur"
          style={{
            background: `linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-700/10 opacity-70" />
          <div className="relative space-y-2">
            <div className="flex items-center space-x-2 text-gray-300">
              <Droplets className="w-5 h-5 text-blue-400" />
              <span className="text-sm">Humidity</span>
            </div>
            <p className="text-4xl font-bold text-white">{data.humidity}%</p>
            <p className="text-xs text-gray-400">Healthy indoor level</p>
          </div>
        </motion.div>
      </div>

      {/* Health Recommendations Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-400" />
          Health Recommendations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Asthma */}
          <button
            onClick={() => setSelectedDisease('asthma')}
            className="bg-slate-700/50 hover:bg-slate-700 p-4 rounded-xl border border-slate-600 hover:border-blue-500 transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Wind className="w-6 h-6 text-blue-400" />
              <span className="font-semibold text-white">Asthma</span>
            </div>
            <p className="text-sm text-slate-400 group-hover:text-slate-300">
              Risk may be {data.currentAQI > 100 ? 'high' : 'moderate'} when AQI is {data.currentAQI}
            </p>
            <div className="mt-2 text-xs text-blue-400 flex items-center gap-1">
              <span>Click for guidance</span>
              <span>→</span>
            </div>
          </button>

          {/* Heart Issues */}
          <button
            onClick={() => setSelectedDisease('heartIssues')}
            className="bg-slate-700/50 hover:bg-slate-700 p-4 rounded-xl border border-slate-600 hover:border-red-500 transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-6 h-6 text-red-400" />
              <span className="font-semibold text-white">Heart Issues</span>
            </div>
            <p className="text-sm text-slate-400 group-hover:text-slate-300">
              Cardiovascular risk {data.currentAQI > 100 ? 'elevated' : 'normal'}
            </p>
            <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
              <span>Click for guidance</span>
              <span>→</span>
            </div>
          </button>

          {/* Allergies */}
          <button
            onClick={() => setSelectedDisease('allergies')}
            className="bg-slate-700/50 hover:bg-slate-700 p-4 rounded-xl border border-slate-600 hover:border-green-500 transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-6 h-6 text-green-400" />
              <span className="font-semibold text-white">Allergies</span>
            </div>
            <p className="text-sm text-slate-400 group-hover:text-slate-300">
              Allergy triggers {data.currentAQI > 100 ? 'likely' : 'possible'}
            </p>
            <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
              <span>Click for guidance</span>
              <span>→</span>
            </div>
          </button>

          {/* COPD */}
          <button
            onClick={() => setSelectedDisease('copd')}
            className="bg-slate-700/50 hover:bg-slate-700 p-4 rounded-xl border border-slate-600 hover:border-orange-500 transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Thermometer className="w-6 h-6 text-orange-400" />
              <span className="font-semibold text-white">Chronic COPD</span>
            </div>
            <p className="text-sm text-slate-400 group-hover:text-slate-300">
              COPD symptoms {data.currentAQI > 100 ? 'may worsen' : 'manageable'}
            </p>
            <div className="mt-2 text-xs text-orange-400 flex items-center gap-1">
              <span>Click for guidance</span>
              <span>→</span>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Quick Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <button className="relative overflow-hidden rounded-2xl p-4 border border-cyan-400/30 backdrop-blur text-white font-semibold transition-all hover:border-cyan-400/60 hover:scale-105"
          style={{
            background: `linear-gradient(140deg, rgba(34,211,238,0.1), rgba(34,211,238,0.05))`
          }}>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-cyan-700/10 opacity-70" />
          <div className="relative flex items-center justify-center space-x-2">
            <Wind className="w-5 h-5" />
            <span>Turn On Purifier</span>
          </div>
        </button>

        <button
          onClick={() => setNotifyWhenSafe(!notifyWhenSafe)}
          className={`relative overflow-hidden rounded-2xl p-4 border backdrop-blur text-white font-semibold transition-all hover:scale-105 ${
            notifyWhenSafe
              ? 'border-green-400/60 bg-gradient-to-br from-green-500/20 to-green-700/10'
              : 'border-gray-500/30 bg-gradient-to-br from-gray-500/10 to-gray-700/5'
          }`}
        >
          <div className={`absolute inset-0 opacity-70 ${
            notifyWhenSafe
              ? 'bg-gradient-to-br from-green-500/20 to-green-700/10'
              : 'bg-gradient-to-br from-gray-500/10 to-gray-700/5'
          }`} />
          <div className="relative flex items-center justify-center space-x-2">
            <Bell className={`w-5 h-5 ${notifyWhenSafe ? 'text-green-400' : 'text-gray-400'}`} />
            <span>{notifyWhenSafe ? 'Notifications ON' : 'Notify When Safe'}</span>
          </div>
        </button>
      </motion.div>

      {/* 24-Hour Trend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <SimpleTrendChart
          data={data.hourlyTrend || []}
          title="Air Quality Trend (24 hours)"
          dataKey="aqi"
          color="#10b981"
        />
      </motion.div>

      {/* Smart Appliance Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
      >
        <ApplianceRecommendations 
          currentAQI={data.currentAQI} 
          roomType="LIVING_ROOM"
        />
      </motion.div>

      {/* Device Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="relative overflow-hidden rounded-2xl p-4 border border-white/5 backdrop-blur"
        style={{
          background: `linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))`
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-green-400" />
            <div>
              <p className="text-sm text-gray-300">Device Connected</p>
              <p className="text-xs text-gray-500">Last updated 2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400">Active</span>
          </div>
        </div>
      </motion.div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="relative overflow-hidden rounded-2xl p-6 border border-white/5 backdrop-blur"
        style={{
          background: `linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))`
        }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">💡 Tips to Improve Air Quality</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start space-x-2">
            <span className="text-cyan-400 mt-1">✓</span>
            <span>Open windows during early morning or late evening</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-cyan-400 mt-1">✓</span>
            <span>Use an air purifier with HEPA filter during high pollution</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-cyan-400 mt-1">✓</span>
            <span>Keep indoor plants to naturally filter air</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-cyan-400 mt-1">✓</span>
            <span>Avoid cooking with high heat during poor air quality days</span>
          </li>
        </ul>
      </motion.div>

      {/* Disease Info Modal */}
      {selectedDisease && (
        <DiseaseInfoModal
          disease={selectedDisease}
          currentAQI={data.currentAQI}
          onClose={() => setSelectedDisease(null)}
        />
      )}
    </div>
  );
}

function getMockHomeData() {
  return {
    currentAQI: 78,
    aqiStatus: 'GOOD',
    temperature: 22.5,
    humidity: 55,
    location: 'Mathura',
    hourlyTrend: [
      { time: '00:00', aqi: 65 },
      { time: '03:00', aqi: 58 },
      { time: '06:00', aqi: 52 },
      { time: '09:00', aqi: 68 },
      { time: '12:00', aqi: 82 },
      { time: '15:00', aqi: 78 },
      { time: '18:00', aqi: 72 },
      { time: '21:00', aqi: 68 },
      { time: '24:00', aqi: 62 }
    ],
    lastUpdated: 'Just now'
  };
}

export default HomeDashboard;
