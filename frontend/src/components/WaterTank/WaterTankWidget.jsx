import { motion } from 'framer-motion';
import { Droplets, AlertTriangle, CheckCircle, XCircle, Waves, MapPin, Phone, Mail } from 'lucide-react';

function WaterTankWidget({ tank, compact = false }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'NORMAL':
        return 'from-green-500/20 to-green-700/10 border-green-400/30';
      case 'LOW':
        return 'from-yellow-500/20 to-yellow-700/10 border-yellow-400/30';
      case 'CRITICAL':
        return 'from-orange-500/20 to-orange-700/10 border-orange-400/30';
      case 'EMPTY':
        return 'from-red-500/20 to-red-700/10 border-red-400/30';
      default:
        return 'from-gray-500/20 to-gray-700/10 border-gray-400/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'NORMAL':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'LOW':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'CRITICAL':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'EMPTY':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Droplets className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'NORMAL':
        return 'bg-green-500/30 text-green-300';
      case 'LOW':
        return 'bg-yellow-500/30 text-yellow-300';
      case 'CRITICAL':
        return 'bg-orange-500/30 text-orange-300';
      case 'EMPTY':
        return 'bg-red-500/30 text-red-300';
      default:
        return 'bg-gray-500/30 text-gray-300';
    }
  };

  const getLevelBarColor = (level) => {
    if (level > 40) return 'bg-green-500';
    if (level > 20) return 'bg-yellow-500';
    if (level > 5) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative overflow-hidden rounded-xl p-3 border backdrop-blur bg-gradient-to-br ${getStatusColor(
          tank.status
        )}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(tank.status)}
            <div>
              <p className="text-sm font-semibold text-white">{tank.tankId}</p>
              <p className="text-xs text-gray-400">{tank.zone}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-white">{tank.currentLevel}%</p>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusBadgeColor(tank.status)}`}>
              {tank.status}
            </span>
          </div>
        </div>

        {/* Level Bar */}
        <div className="relative w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mt-3">
          <div
            className={`absolute left-0 top-0 h-full transition-all duration-500 ${getLevelBarColor(
              tank.currentLevel
            )}`}
            style={{ width: `${tank.currentLevel}%` }}
          />
        </div>

        {/* Sprinkler Status */}
        {tank.sprinklersDisabled && (
          <div className="flex items-center space-x-1 mt-2 text-xs text-orange-300">
            <Waves className="w-3 h-3" />
            <span>Sprinklers Disabled</span>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl p-5 border backdrop-blur bg-gradient-to-br ${getStatusColor(
        tank.status
      )}`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {getStatusIcon(tank.status)}
            <div>
              <p className="text-lg font-bold text-white">{tank.tankId}</p>
              <p className="text-sm text-gray-400">{tank.zone}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getStatusBadgeColor(tank.status)}`}>
            {tank.status}
          </span>
        </div>

        {/* Water Level Gauge */}
        <div className="bg-black/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-300">Water Level</span>
            <span className="text-2xl font-bold text-white">{tank.currentLevel}%</span>
          </div>

          {/* Level Bar */}
          <div className="relative w-full h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full transition-all duration-500 ${getLevelBarColor(
                tank.currentLevel
              )}`}
              style={{ width: `${tank.currentLevel}%` }}
            />
          </div>

          {/* Capacity Info */}
          <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
            <div>
              <p className="text-gray-400">Capacity</p>
              <p className="text-white font-semibold">{tank.capacity.toLocaleString()} L</p>
            </div>
            <div>
              <p className="text-gray-400">Current Volume</p>
              <p className="text-white font-semibold">
                {Math.round((tank.currentLevel / 100) * tank.capacity).toLocaleString()} L
              </p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start space-x-2 text-sm">
          <MapPin className="w-4 h-4 text-cyan-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-gray-300">{tank.location.address}</p>
            <p className="text-xs text-gray-400 mt-1">
              {tank.location.lat.toFixed(4)}°N, {tank.location.lng.toFixed(4)}°E
            </p>
          </div>
        </div>

        {/* Sprinkler Status */}
        <div className={`p-3 rounded-lg ${
          tank.sprinklersDisabled 
            ? 'bg-orange-500/10 border border-orange-500/30' 
            : 'bg-green-500/10 border border-green-500/30'
        }`}>
          <div className="flex items-center space-x-2">
            <Waves className={`w-4 h-4 ${tank.sprinklersDisabled ? 'text-orange-400' : 'text-green-400'}`} />
            <span className={`text-sm font-semibold ${
              tank.sprinklersDisabled ? 'text-orange-300' : 'text-green-300'
            }`}>
              Sprinklers {tank.sprinklersDisabled ? 'Disabled' : 'Available'}
            </span>
          </div>
          {tank.sprinklersDisabled && (
            <p className="text-xs text-gray-400 mt-1">
              {tank.affectedDevices} devices affected in {tank.zone}
            </p>
          )}
        </div>

        {/* Municipality Contact */}
        <div className="bg-black/20 rounded-xl p-3 space-y-2">
          <p className="text-xs font-semibold text-gray-400">Municipality Contact</p>
          <p className="text-sm text-white font-semibold">{tank.municipality.name}</p>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs text-gray-300">
              <Phone className="w-3 h-3 text-cyan-400" />
              <span>{tank.municipality.contact.phone}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-300">
              <Mail className="w-3 h-3 text-cyan-400" />
              <span>{tank.municipality.contact.email}</span>
            </div>
          </div>

          {tank.municipality.lastNotified && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-gray-400">
                Last Notified: {new Date(tank.municipality.lastNotified).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}
        </div>

        {/* Sensor Info */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/10">
          <span>Sensor: {tank.sensorDeviceId}</span>
          <span>
            Updated: {new Date(tank.lastUpdateTime).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default WaterTankWidget;
