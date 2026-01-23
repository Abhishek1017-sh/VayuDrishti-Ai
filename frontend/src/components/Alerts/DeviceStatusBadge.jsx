import { Wifi, AlertCircle } from 'lucide-react';

function DeviceStatusBadge({ deviceId, status = 'online', lastSeen = null }) {
  const isOnline = status === 'online';

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold ${
      isOnline
        ? 'bg-green-500/20 text-green-300 border border-green-400/30'
        : 'bg-red-500/20 text-red-300 border border-red-400/30'
    }`}>
      {isOnline ? (
        <>
          <Wifi className="w-3 h-3" />
          <span>Connected</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-3 h-3" />
          <span>Offline</span>
        </>
      )}
      {lastSeen && <span className="text-[10px] opacity-75">({lastSeen instanceof Date ? lastSeen.toLocaleString() : lastSeen})</span>}
    </div>
  );
}

export default DeviceStatusBadge;
