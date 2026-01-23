import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, FileText, TrendingUp, AlertTriangle, BarChart3, Download } from 'lucide-react';
import StatCard from '../../components/Dashboard/Shared/StatCard';
import ComplianceIndicator from '../../components/Dashboard/Shared/ComplianceIndicator';
import MetricCard from '../../components/Dashboard/Shared/MetricCard';
import SimpleTrendChart from '../../components/Dashboard/Shared/SimpleTrendChart';
import AlertManager from '../../components/Dashboard/Shared/AlertManager';
import AQIGauge from '../../components/Dashboard/Shared/AQIGauge';
import { dashboardAPI } from '../../services/api';

function IndustryDashboard() {
  const [industryData, setIndustryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const facilityId = 'FACILITY-001'; // Should come from user profile

  useEffect(() => {
    fetchIndustryData();
    const interval = setInterval(fetchIndustryData, 30000);
    return () => clearInterval(interval);
  }, [facilityId]);

  const fetchIndustryData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getIndustryData?.(facilityId);
      if (response?.data) {
        setIndustryData(response.data);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching industry data:', err);
      setIndustryData(getMockIndustryData());
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    // Generate and download PDF report
    console.log('Generating compliance report...');
  };

  if (loading && !industryData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Building2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-2" />
          <p className="text-gray-400">Loading facility data...</p>
        </div>
      </div>
    );
  }

  const data = industryData || getMockIndustryData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Facility Monitoring</p>
        <h1 className="text-3xl font-bold text-white">{data.facilityName}</h1>
        <p className="text-gray-400 mt-1">Regulatory compliance and operational monitoring</p>
      </div>

      {/* Compliance Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComplianceIndicator
          status={data.complianceStatus}
          percentage={data.compliancePercentage}
          lastCheck={data.lastComplianceCheck}
        />

        <div className="space-y-4">
          <StatCard
            title="Average AQI"
            value={data.averageAQI}
            unit="scale"
            icon={TrendingUp}
            color="from-orange-500/20 to-orange-700/10"
            trend={{ type: data.aqiTrend > 0 ? 'up' : 'down', value: Math.abs(data.aqiTrend), label: 'vs last week' }}
          />

          <StatCard
            title="Emission Rate"
            value={data.emissionRate}
            unit="kg/hr"
            icon={BarChart3}
            color="from-red-500/20 to-red-700/10"
            trend={{ type: 'down', value: 5, label: 'improved' }}
          />
        </div>
      </div>

      {/* Key Metrics */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-white mb-4">Facility Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="PM2.5"
            value={data.pm25}
            unit="µg/m³"
            icon={AlertTriangle}
            color="from-blue-500/20 to-blue-700/10"
            threshold={35}
          />
          <MetricCard
            label="PM10"
            value={data.pm10}
            unit="µg/m³"
            icon={AlertTriangle}
            color="from-blue-500/20 to-blue-700/10"
            threshold={150}
          />
          <MetricCard
            label="SO₂"
            value={data.so2}
            unit="ppb"
            icon={AlertTriangle}
            color="from-purple-500/20 to-purple-700/10"
            threshold={200}
          />
          <MetricCard
            label="NO₂"
            value={data.no2}
            unit="ppb"
            icon={AlertTriangle}
            color="from-red-500/20 to-red-700/10"
            threshold={100}
          />
        </div>
      </motion.div>

      {/* Current AQI and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Current Air Quality</h3>
            <AQIGauge aqi={data.averageAQI} size="medium" status={data.aqiStatus} />
          </div>
        </motion.div>

        <AlertManager alerts={data.alerts} maxItems={6} />
      </div>

      {/* Production vs Air Quality Correlation */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Production Analysis</h2>
        <SimpleTrendChart
          data={data.productionVsAQI || []}
          title="Production Output vs AQI Correlation"
          dataKey="aqi"
          color="#f97316"
        />
      </motion.div>

      {/* Automation Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 border border-white/5 backdrop-blur"
        style={{
          background: `linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))`
        }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Automated Actions Log</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {data.automationLogs?.map((log, idx) => (
            <div key={idx} className="flex items-start justify-between p-3 rounded-lg bg-white/5">
              <div className="flex-1">
                <p className="text-gray-300 font-medium text-sm">{log.action}</p>
                <p className="text-gray-500 text-xs mt-1">{log.timestamp}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                log.status === 'success' ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'
              }`}>
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Report Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 border border-white/5 backdrop-blur"
        style={{
          background: `linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))`
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Regulatory Reports</h3>
            <p className="text-sm text-gray-400">Generate and export compliance documentation</p>
          </div>
          <button
            onClick={handleGenerateReport}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
          <p className="text-xs text-gray-500">Last report generated: {data.lastReportDate}</p>
          <p className="text-xs text-gray-500">Report format: PDF • NAAQS Standards • Monthly</p>
        </div>
      </motion.div>
    </div>
  );
}

function getMockIndustryData() {
  return {
    facilityName: 'Industrial Facility - Unit A',
    complianceStatus: 'COMPLIANT',
    compliancePercentage: 92,
    lastComplianceCheck: '2 hours ago',
    averageAQI: 68,
    aqiStatus: 'MODERATE',
    aqiTrend: -8,
    emissionRate: 24.5,
    pm25: 28,
    pm10: 112,
    so2: 85,
    no2: 42,
    alerts: [
      {
        id: '1',
        title: 'Threshold Warning',
        message: 'PM10 approaching threshold at 112 µg/m³',
        severity: 'warning',
        timestamp: '15 minutes ago'
      },
      {
        id: '2',
        title: 'Maintenance Alert',
        message: 'Air filter replacement recommended',
        severity: 'info',
        timestamp: '1 hour ago'
      }
    ],
    automationLogs: [
      { action: 'Ventilation system activated', timestamp: '5 min ago', status: 'success' },
      { action: 'Emission control engaged', timestamp: '12 min ago', status: 'success' },
      { action: 'Production limiter applied', timestamp: '28 min ago', status: 'success' }
    ],
    productionVsAQI: [
      { time: '08:00', aqi: 45, production: 75 },
      { time: '10:00', aqi: 62, production: 95 },
      { time: '12:00', aqi: 85, production: 110 },
      { time: '14:00', aqi: 68, production: 85 },
      { time: '16:00', aqi: 52, production: 60 },
      { time: '18:00', aqi: 38, production: 40 }
    ],
    lastReportDate: '2026-01-21',
    facilities: ['Unit A', 'Unit B', 'Unit C']
  };
}

export default IndustryDashboard;
