import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dashboardAPI } from '../services/api';
import AQICard from '../components/dashboard/AQICard';
import SensorPanel from '../components/dashboard/SensorPanel';
import AutomationPanel from '../components/dashboard/AutomationPanel';
import AlertsWidget from '../components/dashboard/AlertsWidget';
import { RefreshCw, AlertCircle } from 'lucide-react';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.getData();
      setDashboardData(response.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button onClick={fetchDashboardData} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">Live Atmosphere Feed</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Adaptive Air Command Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 max-w-xl">
            Fusion view of AQI, micro-climate and device health with automation readiness.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {lastUpdated && (
            <div className="px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-sm text-primary-700 dark:text-primary-200 border border-primary-100 dark:border-primary-800">
              Synced at {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-cyan-500 text-white rounded-lg shadow-lg shadow-primary-200/60 dark:shadow-none hover:opacity-90 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AQI Card - Takes full width on mobile, 2 cols on large screens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <AQICard 
            data={dashboardData?.aqi} 
            location={dashboardData?.location}
            sensor={dashboardData?.sensorData}
          />
        </motion.div>

        {/* Sensor Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SensorPanel data={dashboardData?.sensorData} />
        </motion.div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Automation Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AutomationPanel data={dashboardData?.automation} />
        </motion.div>

        {/* Alerts Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AlertsWidget alerts={dashboardData?.alerts} />
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
