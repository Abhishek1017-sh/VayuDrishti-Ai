import { motion } from 'framer-motion';
import { Activity, Droplets, Thermometer, Wind, CheckCircle, AlertCircle, Wifi, Timer, Gauge } from 'lucide-react';

function SensorPanel({ data }) {
  if (!data) {
    return (
      <div className="card p-6 h-full">
        <div className="text-center text-gray-500">No sensor data available</div>
      </div>
    );
  }

  const { mq, temperature, humidity, aqi, status, timestamp } = data;

  const isHealthy = timestamp && (Date.now() - new Date(timestamp).getTime()) < 5 * 60 * 1000;

  const tiles = [
    {
      label: 'MQ Index',
      value: mq?.toFixed(0) || 0,
      unit: 'raw',
      icon: Wind,
      accent: 'from-cyan-500/20 to-cyan-700/10'
    },
    {
      label: 'Temperature',
      value: temperature?.toFixed(1) || 0,
      unit: '°C',
      icon: Thermometer,
      accent: 'from-amber-400/20 to-orange-500/10'
    },
    {
      label: 'Humidity',
      value: humidity?.toFixed(1) || 0,
      unit: '%',
      icon: Droplets,
      accent: 'from-sky-400/20 to-blue-500/10'
    },
    {
      label: 'AQI',
      value: aqi || 0,
      unit: 'scale',
      icon: Activity,
      accent: 'from-fuchsia-400/20 to-purple-600/10',
      status: status || 'Unknown'
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 text-white" style={{ background: 'linear-gradient(160deg, #0b1224 0%, #111a2f 45%, #0e1c3a 100%)' }}>
      <div className="absolute -right-10 -top-20 h-40 w-40 bg-cyan-500/15 blur-3xl" />
      <div className="absolute -left-16 bottom-0 h-40 w-40 bg-purple-500/10 blur-3xl" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Edge Telemetry</p>
          <h3 className="text-xl font-semibold">Sensor Pulse</h3>
          <p className="text-sm text-gray-300">Real-time device vitals</p>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs ${isHealthy ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-100' : 'bg-red-500/20 border border-red-400/30 text-red-100'}`}>
          {isHealthy ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{isHealthy ? 'Synchronized' : 'Offline'}</span>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {tiles.map((tile, index) => {
          const Icon = tile.icon;
          const statusColor = aqi <= 50 ? '#22c55e' : aqi <= 100 ? '#facc15' : aqi <= 200 ? '#f97316' : '#ef4444';

          return (
            <motion.div
              key={tile.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="relative overflow-hidden rounded-2xl p-4 border border-white/5 backdrop-blur"
              style={{ background: `linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${tile.accent} opacity-70`} />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-200">
                    <Icon className="w-4 h-4 text-cyan-100" />
                    <span>{tile.label}</span>
                  </div>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-3xl font-bold">{tile.value}</span>
                    <span className="text-sm text-gray-300">{tile.unit}</span>
                  </div>
                  {tile.status && (
                    <p className="text-xs mt-1 font-semibold" style={{ color: statusColor }}>
                      {tile.status}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-1 text-[10px] text-gray-300">
                  <div className="flex items-center space-x-1">
                    <Wifi className="w-3 h-3" />
                    <span>Mesh lock</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Timer className="w-3 h-3" />
                    <span>{timestamp ? new Date(timestamp).toLocaleTimeString() : 'Pending'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="relative z-10 mt-6 p-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur">
        <div className="flex items-center justify-between text-xs text-gray-200">
          <div className="flex items-center space-x-2">
            <Gauge className="w-4 h-4" />
            <span>Last reading</span>
          </div>
          <span>{timestamp ? new Date(timestamp).toLocaleString() : 'No reading yet'}</span>
        </div>
      </div>
    </div>
  );
}

export default SensorPanel;
