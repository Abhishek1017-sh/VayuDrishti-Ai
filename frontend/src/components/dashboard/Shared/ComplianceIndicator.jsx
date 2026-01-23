import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

function ComplianceIndicator({ status = 'COMPLIANT', percentage = 95, lastCheck = null }) {
  const isCompliant = status === 'COMPLIANT';
  const bgColor = isCompliant ? 'from-emerald-500/20 to-emerald-700/10' : 'from-red-500/20 to-red-700/10';
  const borderColor = isCompliant ? 'border-emerald-400/30' : 'border-red-400/30';
  const textColor = isCompliant ? 'text-emerald-100' : 'text-red-100';
  const StatusIcon = isCompliant ? CheckCircle : XCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl p-6 border ${borderColor} backdrop-blur`}
      style={{
        background: `linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))`
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${bgColor} opacity-70`} />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <StatusIcon className={`w-6 h-6 ${textColor}`} />
          <div>
            <h3 className="text-lg font-semibold text-white">Regulatory Compliance</h3>
            <p className="text-sm text-gray-300">NAAQS Standards</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold ${textColor}`} style={{
          backgroundColor: isCompliant ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
        }}>
          <span className={`h-2 w-2 rounded-full ${isCompliant ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
          <span>{status}</span>
        </div>

        {/* Percentage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Compliance Score</span>
            <span className={`text-2xl font-bold ${isCompliant ? 'text-emerald-400' : 'text-red-400'}`}>
              {percentage}%
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${isCompliant ? 'bg-emerald-500' : 'bg-red-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Last Check */}
        {lastCheck && (
          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-gray-400">Last checked: {lastCheck}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ComplianceIndicator;
