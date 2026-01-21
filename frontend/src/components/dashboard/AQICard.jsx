import { motion } from 'framer-motion';
import { Wind, MapPin, Clock, Info, Activity, Droplets, Thermometer, Gauge } from 'lucide-react';

function AQICard({ data, location, sensor }) {
  if (!data) {
    return (
      <div className="card p-6">
        <div className="text-center text-gray-500">No AQI data available</div>
      </div>
    );
  }

  const { value, category, color, healthImplications, timestamp, estimated } = data;
  const sensorTemperature = sensor?.temperature;
  const sensorHumidity = sensor?.humidity;
  const sensorMq = sensor?.mq;

  const chipStyle = {
    background: 'linear-gradient(120deg, rgba(34,211,238,0.16), rgba(59,130,246,0.08))',
    border: '1px solid rgba(34,211,238,0.25)'
  };

  const glassStyle = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
    border: '1px solid rgba(255,255,255,0.08)'
  };

  const statusTone = color || '#22d3ee';

  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl text-white"
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 220 }}
      style={{
        background: 'radial-gradient(circle at 10% 10%, rgba(59,130,246,0.14), transparent 30%), radial-gradient(circle at 80% 0%, rgba(236,72,153,0.18), transparent 28%), linear-gradient(135deg, #0f172a 0%, #1f1433 45%, #2a0f4c 100%)'
      }}
    >
      {/* Ambient glows */}
      <div className="absolute inset-0">
        <div className="absolute -left-10 -top-10 h-40 w-40 bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-56 w-56 bg-purple-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center space-x-2 text-sm text-cyan-100">
              <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" aria-hidden />
              <span>Live AQI Stream</span>
            </div>
            <div className="flex items-center mt-2 space-x-2 text-sm text-gray-200">
              <MapPin className="w-4 h-4" />
              <span>{location || 'Unknown location'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 rounded-full" style={chipStyle}>
            <Wind className="w-4 h-4 text-cyan-200" />
            <span className="text-xs font-semibold uppercase tracking-wide text-cyan-50">Air Matrix</span>
          </div>
        </div>

        {/* AQI main block */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="relative"
            >
              <div className="absolute -inset-3 rounded-2xl bg-white/5 blur-2xl" />
              <div className="relative h-36 w-36 rounded-2xl flex items-center justify-center shadow-2xl" style={{ background: `radial-gradient(circle at 50% 40%, ${statusTone}, #111827)` }}>
                <span className="text-6xl font-extrabold drop-shadow-lg">{value}</span>
              </div>
            </motion.div>

            <div className="flex-1 space-y-3">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: `${statusTone}33`, color: '#e0f2fe', border: `1px solid ${statusTone}66` }}>
                <Activity className="w-4 h-4" />
                <span>{category}</span>
              </div>
              <p className="text-lg font-semibold text-white leading-tight">{healthImplications}</p>
              <p className="text-sm text-gray-300 flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{timestamp ? new Date(timestamp).toLocaleTimeString() : 'Awaiting first packet'}</span>
              </p>
            </div>
          </div>

          {/* Micro-climate tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            {[{
              label: 'Temperature',
              value: sensorTemperature ? `${sensorTemperature.toFixed(1)}°C` : 'N/A',
              icon: Thermometer,
              hint: 'Device micro-climate'
            }, {
              label: 'Humidity',
              value: sensorHumidity ? `${sensorHumidity.toFixed(1)}%` : 'N/A',
              icon: Droplets,
              hint: 'Relative humidity'
            }, {
              label: 'MQ Index',
              value: sensorMq ? sensorMq.toFixed(0) : 'N/A',
              icon: Gauge,
              hint: 'Raw smoke feed'
            }].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl p-4 backdrop-blur" style={glassStyle}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-200">
                      <Icon className="w-4 h-4 text-cyan-200" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-xs text-gray-400">{item.hint}</span>
                  </div>
                  <div className="text-2xl font-semibold">{item.value}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          <div className="lg:col-span-2">
            <p className="text-xs text-gray-300 mb-2">AQI Spectrum</p>
            <div className="flex space-x-1 h-2 rounded-full overflow-hidden">
              <div className="flex-1 bg-[#00E400]" title="Good (0-50)" />
              <div className="flex-1 bg-[#FFFF00]" title="Moderate (51-100)" />
              <div className="flex-1 bg-[#FF7E00]" title="Poor (101-150)" />
              <div className="flex-1 bg-[#FF0000]" title="Very Poor (151-200)" />
              <div className="flex-1 bg-[#8F3F97]" title="Severe (201-300)" />
              <div className="flex-1 bg-[#7E0023]" title="Hazardous (301-500)" />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 text-xs text-gray-200">
            {estimated && (
              <div className="flex items-center space-x-1 px-3 py-2 rounded-full bg-white/5 border border-white/10">
                <Info className="w-4 h-4 text-amber-300" />
                <span>Estimated AQI</span>
              </div>
            )}
            <div className="flex items-center space-x-1 px-3 py-2 rounded-full bg-white/5 border border-white/10">
              <Clock className="w-4 h-4 text-cyan-200" />
              <span>{timestamp ? new Date(timestamp).toLocaleTimeString() : 'Pending'}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AQICard;
