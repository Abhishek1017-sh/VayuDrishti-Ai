import { motion } from 'framer-motion';

function AQIGauge({ aqi = 0, size = 'medium', showLabel = true, status = 'GOOD' }) {
  const getGaugeColor = (aqi) => {
    if (aqi <= 50) return '#10b981';   // Green
    if (aqi <= 100) return '#fbbf24';  // Yellow
    if (aqi <= 150) return '#f97316';  // Orange
    if (aqi <= 200) return '#ef4444';  // Red
    return '#a855f7';                  // Purple
  };

  const sizeClasses = {
    small: 'w-20 h-20',
    medium: 'w-32 h-32',
    large: 'w-48 h-48'
  };

  const sizeConfig = {
    small: { r: 36, textSize: 'text-2xl' },
    medium: { r: 60, textSize: 'text-5xl' },
    large: { r: 90, textSize: 'text-7xl' }
  };

  const config = sizeConfig[size] || sizeConfig.medium;
  const circumference = 2 * Math.PI * config.r;
  const strokeDashoffset = circumference - (aqi / 500) * circumference;
  const gaugeColor = getGaugeColor(aqi);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      className="flex flex-col items-center justify-center"
    >
      <div className={`${sizeClasses[size]} relative`}>
        {/* Background circle */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={config.r}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <motion.circle
            cx="100"
            cy="100"
            r={config.r}
            fill="none"
            stroke={gaugeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${config.textSize} font-bold text-white`}>{aqi}</span>
          {showLabel && <span className="text-xs text-gray-300 mt-1 uppercase tracking-wide">{status}</span>}
        </div>
      </div>

      {/* Color legend */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: gaugeColor }}>
          <span>{status}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default AQIGauge;
