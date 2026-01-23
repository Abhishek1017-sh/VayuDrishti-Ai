import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

function SimpleTrendChart({ data = [], title = '24hr Trend', dataKey = 'aqi', color = '#10b981' }) {
  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 border border-white/5 backdrop-blur h-64 flex items-center justify-center"
        style={{
          background: `linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))`
        }}
      >
        <div className="text-center text-gray-400">
          <p>No data available</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-6 border border-white/5 backdrop-blur"
      style={{
        background: `linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))`
      }}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-400">Last 24 hours</p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            stroke="rgba(255,255,255,0.1)"
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            stroke="rgba(255,255,255,0.1)"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(value) => [value.toFixed(1), dataKey.toUpperCase()]}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            dot={false}
            strokeWidth={2}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export default SimpleTrendChart;
