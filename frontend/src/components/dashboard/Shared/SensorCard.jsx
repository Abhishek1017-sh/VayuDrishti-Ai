import { motion } from 'framer-motion';
import { MapPin, AlertCircle, TrendingUp } from 'lucide-react';

function SensorCard({ sensorId, location, aqi, temperature, humidity, mq, status, lastUpdated, onClick = null }) {
  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#fbbf24';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    return '#a855f7';
  };

  const aqiColor = getAQIColor(aqi);
  const isAlert = aqi > 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl p-4 border border-white/5 backdrop-blur cursor-pointer"
      style={{
        background: `linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))`
      }}
    >
      <div className="relative space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-200 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="font-semibold">{sensorId}</span>
            </div>
            <p className="text-xs text-gray-400">{location}</p>
          </div>

          {isAlert && (
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-400 animate-pulse" />
            </div>
          )}
        </div>

        {/* AQI Display */}
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: aqiColor + '20', border: `2px solid ${aqiColor}` }}>
            <span className="text-2xl font-bold" style={{ color: aqiColor }}>
              {aqi}
            </span>
          </div>

          <div className="flex-1">
            <div className="text-sm text-gray-300 mb-2">
              <span className="font-semibold" style={{ color: aqiColor }}>
                {status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
              <div>🌡 {temperature}°C</div>
              <div>💧 {humidity}%</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-gray-500">
          <span>MQ: {mq}</span>
          <span>{lastUpdated}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default SensorCard;
