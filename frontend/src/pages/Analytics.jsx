import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardAPI, aqiAPI } from '../services/api';
import { TrendingUp, TrendingDown, Minus, Calendar, Activity, Wind, Droplets } from 'lucide-react';

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
    return data.map(item => {
      const date = new Date(item.timestamp);
      return {
        time: date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        fullDateTime: date.toLocaleDateString('en-GB', { 
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) + ', ' + date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true
        }),
        aqi: item.value,
        category: item.category
      };
    });
  };

  const formatHourlySeries = (hourly) => {
    if (!hourly || hourly.length === 0) return [];
    return hourly.map(({ hour, average }) => ({
      time: `${String(hour).padStart(2, '0')}:00`,
      aqi: average,
      category: ''
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
              className="card p-6 bg-gradient-to-br from-cyan-600/20 to-cyan-700/10 border border-cyan-500/30"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-cyan-400 mb-2 font-semibold">Average AQI</div>
                  <div className="text-3xl font-bold text-white">
                    {analyticsData?.average || 0}
                  </div>
                </div>
                <Activity className="w-8 h-8 text-cyan-400 opacity-50" />
              </div>
              <p className="text-xs text-cyan-300 mt-3">{period} average</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 bg-gradient-to-br from-orange-600/20 to-orange-700/10 border border-orange-500/30"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-orange-400 mb-2 font-semibold">Peak AQI</div>
                  <div className="text-3xl font-bold text-white">
                    {analyticsData?.peak?.value || 0}
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-400 opacity-50" />
              </div>
              {analyticsData?.peak?.timestamp && (
                <p className="text-xs text-orange-300 mt-2">
                  {new Date(analyticsData.peak.timestamp).toLocaleString('en-GB')}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6 bg-gradient-to-br from-blue-600/20 to-blue-700/10 border border-blue-500/30"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-blue-400 mb-2 font-semibold">Data Points</div>
                  <div className="text-3xl font-bold text-white">
                    {analyticsData?.dataPoints || aqiHistory?.length || 0}
                  </div>
                </div>
                <Droplets className="w-8 h-8 text-blue-400 opacity-50" />
              </div>
              <p className="text-xs text-blue-300 mt-3">readings captured</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6 bg-gradient-to-br from-green-600/20 to-green-700/10 border border-green-500/30"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-green-400 mb-2 font-semibold">Trend</div>
                  <div className="flex items-center space-x-2 mt-1">
                    {getTrendIcon(analyticsData?.trend)}
                    <span className="text-lg font-semibold text-white capitalize">
                      {analyticsData?.trend || 'stable'}
                    </span>
                  </div>
                </div>
                <Wind className="w-8 h-8 text-green-400 opacity-50" />
              </div>
            </motion.div>
          </div>

          {/* Main Chart Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AQI Over Time Chart - Takes 2 columns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 card p-6 border border-cyan-500/20 bg-gradient-to-br from-slate-800/50 to-slate-900/30"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                AQI Over Time
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={(aqiHistory && aqiHistory.length) ? formatChartData(aqiHistory) : formatHourlySeries(analyticsData?.hourlyData)}>
                  <defs>
                    <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.2} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#94a3b8"
                    tick={false}
                    axisLine={{ stroke: '#475569' }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={{ stroke: '#475569' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    labelFormatter={(value, payload) => {
                      if (payload && payload[0] && payload[0].payload) {
                        return payload[0].payload.fullDateTime || value;
                      }
                      return value;
                    }}
                    formatter={(value) => [value.toFixed(1), 'AQI']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="aqi" 
                    stroke="#06b6d4" 
                    fillOpacity={1} 
                    fill="url(#colorAqi)" 
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Category Distribution Pie Chart */}
            {analyticsData?.categoryDistribution && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card p-6 border border-cyan-500/20 bg-gradient-to-br from-slate-800/50 to-slate-900/30"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-cyan-400" />
                  AQI Distribution
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={Object.entries(analyticsData.categoryDistribution).map(([key, value]) => ({
                        name: key.charAt(0).toUpperCase() + key.slice(1),
                        value: value
                      }))}
                      cx="50%"
                      cy="45%"
                      labelLine={false}
                      label={false}
                      outerRadius={100}
                      innerRadius={0}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      <Cell fill="#22c55e" />
                      <Cell fill="#3b82f6" />
                      <Cell fill="#f97316" />
                      <Cell fill="#ef4444" />
                      <Cell fill="#a855f7" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                        border: '1px solid #3b82f6',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                      }}
                      formatter={(value, name) => {
                        const total = Object.values(analyticsData.categoryDistribution).reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((Number(value) / total) * 100).toFixed(1) : '0.0';
                        return [`${value} (${percentage}%)`, name];
                      }}
                      labelStyle={{ color: '#e2e8f0', fontWeight: 600, fontSize: '14px' }}
                      itemStyle={{ color: '#94a3b8', fontSize: '13px' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      align="center"
                      height={60}
                      iconType="circle"
                      iconSize={10}
                      wrapperStyle={{ 
                        paddingTop: '25px',
                        fontSize: '14px',
                        lineHeight: '24px'
                      }}
                      formatter={(value, entry) => {
                        const total = Object.values(analyticsData.categoryDistribution).reduce((a, b) => a + b, 0);
                        const sliceValue = Number(entry?.payload?.value ?? 0);
                        const percentage = total > 0 ? ((sliceValue / total) * 100).toFixed(1) : '0.0';
                        return <span className="text-gray-200 font-medium">{`${value}: ${percentage}%`}</span>;
                      }}
                      layout="horizontal"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>

          {/* Category Distribution Bar Chart */}
          {analyticsData?.categoryDistribution && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card p-6 border border-cyan-500/20 bg-gradient-to-br from-slate-800/50 to-slate-900/30"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Wind className="w-5 h-5 text-cyan-400" />
                AQI Category Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(analyticsData.categoryDistribution).map(([key, value]) => ({
                  category: key.charAt(0).toUpperCase() + key.slice(1),
                  count: value
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.2} />
                  <XAxis 
                    dataKey="category" 
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                    axisLine={{ stroke: '#475569' }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                    axisLine={{ stroke: '#475569' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value) => [value, 'Count']}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#06b6d4" 
                    radius={[8, 8, 0, 0]}
                    animationDuration={800}
                  />
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
