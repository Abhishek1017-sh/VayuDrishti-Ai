import { motion } from 'framer-motion';

function StatCard({ title, value, unit, icon: Icon, color = 'from-blue-500/20 to-blue-700/10', trend = null, onClick = null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-4 border border-white/5 backdrop-blur cursor-pointer transition-all ${
        onClick ? 'hover:border-white/10' : ''
      }`}
      style={{
        background: `linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))`
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-70`} />
      
      <div className="relative space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">{title}</span>
          {Icon && <Icon className="w-4 h-4 text-cyan-100" />}
        </div>
        
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-white">{value}</span>
          {unit && <span className="text-sm text-gray-300">{unit}</span>}
        </div>

        {trend && (
          <div className={`flex items-center space-x-1 text-xs font-semibold ${
            trend.type === 'up' ? 'text-red-400' : 'text-green-400'
          }`}>
            <span>{trend.type === 'up' ? '↑' : '↓'}</span>
            <span>{trend.value}% {trend.label}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default StatCard;
