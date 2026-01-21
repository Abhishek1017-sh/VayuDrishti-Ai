import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardAPI, aqiAPI } from '../services/api';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';

function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [aqiHistory, setAqiHistory] = useState([]);
  const [period, setPeriod] = useState('24h');
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsResponse, historyResponse] = await Promise.all([
        dashboardAPI.getAnalytics(period),
        aqiAPI.getHistory(period === '24h' ? 24 : period === '7d' ? 168 : 720)
      ]);
      
      setAnalyticsData(analyticsResponse.data.data);
      setAqiHistory(historyResponse.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="w-5 h-5 text-green-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatChartData = (data) => {
    return data.map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      aqi: item.value,
      category: item.category
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AQI trends and historical data analysis
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center space-x-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg p-1">
          {['24h', '7d', '30d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {p === '24h' ? '24 Hours' : p === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-4"
            >
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average AQI</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData?.average || 0}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-4"
            >
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Peak AQI</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData?.peak?.value || 0}
              </div>
              {analyticsData?.peak?.timestamp && (
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(analyticsData.peak.timestamp).toLocaleString()}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-4"
            >
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Data Points</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData?.dataPoints || 0}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-4"
            >
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trend</div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(analyticsData?.trend)}
                <span className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {analyticsData?.trend || 'stable'}
                </span>
              </div>
            </motion.div>
          </div>

          {/* AQI Over Time Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              AQI Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={formatChartData(aqiHistory)}>
                <defs>
                  <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="aqi" 
                  stroke="#0ea5e9" 
                  fillOpacity={1} 
                  fill="url(#colorAqi)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Distribution */}
          {analyticsData?.categoryDistribution && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                AQI Category Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(analyticsData.categoryDistribution).map(([key, value]) => ({
                  category: key,
                  count: value
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis 
                    dataKey="category" 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

export default Analytics;
