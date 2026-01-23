import { motion } from 'framer-motion';

function MetricCard({ label, value, unit, icon: Icon, color = 'from-blue-500/20 to-blue-700/10', threshold = null, warningLevel = null }) {
  const isWarning = threshold && value > threshold;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-4 border border-white/5 backdrop-blur"
      style={{
        background: `linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))`
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-70`} />
      
      <div className="relative space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">{label}</span>
          {Icon && <Icon className={`w-4 h-4 ${isWarning ? 'text-red-400' : 'text-cyan-100'}`} />}
        </div>

        <div className="flex items-baseline space-x-2">
          <span className={`text-3xl font-bold ${isWarning ? 'text-red-400' : 'text-white'}`}>
            {value}
          </span>
          {unit && <span className="text-sm text-gray-300">{unit}</span>}
        </div>

        {threshold && (
          <div className="text-xs text-gray-400 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span>Threshold: {threshold}{unit}</span>
              <span className={isWarning ? 'text-red-400 font-semibold' : 'text-green-400'}>
                {isWarning ? '⚠️ High' : '✓ Normal'}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default MetricCard;
