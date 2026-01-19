import { motion } from 'framer-motion';
import { Wind, MapPin, Clock, Info } from 'lucide-react';

function AQICard({ data, location }) {
  if (!data) {
    return (
      <div className="card p-6">
        <div className="text-center text-gray-500">No AQI data available</div>
      </div>
    );
  }

  const { value, category, color, healthImplications, timestamp, estimated } = data;

  return (
    <motion.div
      className="card p-6 relative overflow-hidden"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Background gradient effect */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at top right, ${color}, transparent)`
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              Air Quality Index
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{location || 'Unknown Location'}</span>
            </div>
          </div>
          
          <Wind className="w-8 h-8 text-gray-400" />
        </div>

        {/* AQI Value - Large Display */}
        <div className="flex items-end space-x-4 mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="flex-shrink-0"
          >
            <div 
              className="w-32 h-32 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: color }}
            >
              <span className="text-5xl font-bold text-white">
                {value}
              </span>
            </div>
          </motion.div>

          <div className="flex-grow">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div 
                className="inline-block px-4 py-2 rounded-lg font-semibold text-white mb-2"
                style={{ backgroundColor: color }}
              >
                {category}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {healthImplications}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-border">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>
              {timestamp ? new Date(timestamp).toLocaleTimeString() : 'N/A'}
            </span>
          </div>

          {estimated && (
            <div className="flex items-center space-x-1 text-xs text-amber-600 dark:text-amber-400">
              <Info className="w-4 h-4" />
              <span>AQI is estimated</span>
            </div>
          )}
        </div>

        {/* AQI Scale Reference */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-border">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">AQI Scale</p>
          <div className="flex space-x-1 h-2 rounded-full overflow-hidden">
            <div className="flex-1 bg-[#00E400]" title="Good (0-50)" />
            <div className="flex-1 bg-[#FFFF00]" title="Moderate (51-100)" />
            <div className="flex-1 bg-[#FF7E00]" title="Poor (101-150)" />
            <div className="flex-1 bg-[#FF0000]" title="Very Poor (151-200)" />
            <div className="flex-1 bg-[#8F3F97]" title="Severe (201-300)" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AQICard;
