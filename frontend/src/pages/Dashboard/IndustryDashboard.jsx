import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, FileText, TrendingUp, TrendingDown, AlertTriangle, BarChart3, Download, Factory, Wind, Bell, CheckCircle, Zap, Droplet, StopCircle } from 'lucide-react';
import StatCard from '../../components/Dashboard/Shared/StatCard';
import ComplianceIndicator from '../../components/Dashboard/Shared/ComplianceIndicator';
import MetricCard from '../../components/Dashboard/Shared/MetricCard';
import SimpleTrendChart from '../../components/Dashboard/Shared/SimpleTrendChart';
import AlertManager from '../../components/Dashboard/Shared/AlertManager';
import AQIGauge from '../../components/Dashboard/Shared/AQIGauge';
import { industryAPI } from '../../services/api';

function IndustryDashboard() {
  const [industryData, setIndustryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const facilityId = 'FACILITY_001'; // Should come from user profile/auth context

  useEffect(() => {
    fetchIndustryData();
    const interval = setInterval(fetchIndustryData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [facilityId]);

  const fetchIndustryData = async () => {
    try {
      setError(null);
      const response = await industryAPI.getDashboard(facilityId);
      
      if (response?.data?.success) {
        setIndustryData(response.data);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error fetching industry data:', err);
      setError('Failed to load facility data. Using fallback data.');
      // Fallback to mock data
      setIndustryData(getMockIndustryData());
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await industryAPI.getComplianceReport(facilityId, startDate, endDate);
      
      // Generate CSV
      const csvData = generateComplianceCSV(response.data);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Compliance_Report_${facilityId}_${endDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  const generateComplianceCSV = (data) => {
    let csv = 'Facility Compliance Report\n\n';
    csv += `Facility ID:,${data.facilityId}\n`;
    csv += `Report Period:,${data.reportPeriod?.start} to ${data.reportPeriod?.end}\n`;
    csv += `Generated:,${new Date().toLocaleString()}\n\n`;
    
    // Summary
    csv += 'COMPLIANCE SUMMARY\n';
    csv += 'Metric,Value\n';
    csv += `Overall Compliance Rate,${data.summary?.overallComplianceRate || 0}%\n`;
    csv += `Total Violations,${data.summary?.totalViolations || 0}\n`;
    csv += `Average AQI,${data.summary?.averageAQI || 0}\n`;
    csv += `Peak AQI,${data.summary?.peakAQI || 0}\n\n`;
    
    // Zone-wise compliance
    csv += 'ZONE-WISE COMPLIANCE\n';
    csv += 'Zone Name,Zone Type,Avg AQI,Max AQI,Violations,Compliance Rate,Status\n';
    (data.zoneCompliance || []).forEach(zone => {
      csv += `${zone.zoneName},${zone.zoneType},${zone.averageAQI},${zone.maxAQI},${zone.violations},${zone.complianceRate}%,${zone.status}\n`;
    });
    csv += '\n';
    
    // Violations log
    csv += 'VIOLATIONS LOG\n';
    csv += 'Timestamp,Zone,AQI,Limit,Excess,Duration (min)\n';
    (data.violations || []).forEach(v => {
      csv += `${v.timestamp},${v.zoneName},${v.aqi},${v.limit},${v.excess},${v.duration}\n`;
    });
    
    return csv;
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

  // Transform API data to match component expectations
  const data = industryData && industryData.summary ? {
    facilityName: `Facility ${facilityId}`,
    complianceStatus: industryData.summary.complianceRate >= 90 ? 'COMPLIANT' : 
                      industryData.summary.complianceRate >= 70 ? 'WARNING' : 'NON_COMPLIANT',
    compliancePercentage: parseFloat(industryData.summary.complianceRate) || 0,
    lastComplianceCheck: 'Just now',
    averageAQI: industryData.summary.averageAQI || 0,
    aqiStatus: industryData.summary.averageAQI <= 50 ? 'GOOD' :
               industryData.summary.averageAQI <= 100 ? 'MODERATE' :
               industryData.summary.averageAQI <= 200 ? 'UNHEALTHY' : 'HAZARDOUS',
    aqiTrend: 0,
    emissionRate: (industryData.summary.averageAQI * 0.35).toFixed(1),
    totalZones: industryData.summary.totalZones || 0,
    activeZones: industryData.summary.activeZones || 0,
    criticalZones: industryData.summary.criticalZones || 0,
    totalDevices: industryData.summary.totalDevices || 0,
    zones: industryData.zones || [],
    alerts: (industryData.recentAlerts || []).map(alert => ({
      id: alert._id || alert.id,
      title: alert.type,
      message: alert.message,
      severity: alert.severity,
      timestamp: new Date(alert.timestamp).toLocaleString(),
    })),
    waterTanks: industryData.waterTanks || [],
    lastReportDate: new Date().toISOString().split('T')[0],
  } : getMockIndustryData();

  return (
    <div className="space-y-8">
      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-400 text-sm">{error}</p>
        </div>
      )}

      {/* Header */}
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Facility Monitoring</p>
        <h1 className="text-3xl font-bold text-white">{data.facilityName}</h1>
        <p className="text-gray-400 mt-1">Regulatory compliance and operational monitoring</p>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Zones"
          value={data.totalZones}
          unit="zones"
          icon={Building2}
          color="from-blue-500/20 to-blue-700/10"
        />
        <StatCard
          title="Active Zones"
          value={data.activeZones}
          unit="online"
          icon={TrendingUp}
          color="from-green-500/20 to-green-700/10"
        />
        <StatCard
          title="Critical Zones"
          value={data.criticalZones}
          unit="alerts"
          icon={AlertTriangle}
          color="from-red-500/20 to-red-700/10"
        />
        <StatCard
          title="Total Devices"
          value={data.totalDevices}
          unit="sensors"
          icon={BarChart3}
          color="from-cyan-500/20 to-cyan-700/10"
        />
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
            label="MQ Index"
            value={data.mq}
            unit="ppm"
            icon={AlertTriangle}
            color="from-orange-500/20 to-orange-700/10"
            threshold={100}
          />
          <MetricCard
            label="Humidity"
            value={data.humidity}
            unit="%"
            icon={AlertTriangle}
            color="from-blue-500/20 to-blue-700/10"
            threshold={70}
          />
          <MetricCard
            label="Temperature"
            value={data.temperature}
            unit="°C"
            icon={AlertTriangle}
            color="from-red-500/20 to-red-700/10"
            threshold={35}
          />
          <MetricCard
            label="AQI"
            value={data.averageAQI}
            unit=""
            icon={AlertTriangle}
            color="from-purple-500/20 to-purple-700/10"
            threshold={150}
          />
        </div>
      </motion.div>

      {/* Facility-Wide Metrics Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Factory className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-white">FACILITY_001: Delhi Industrial Complex</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-lg">
                <span className="text-slate-400 text-sm">Total Zones:</span>
                <span className="font-bold text-white">5</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-lg">
                <span className="text-slate-400 text-sm">Active Devices:</span>
                <span className="font-bold text-green-400">3</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-lg">
                <span className="text-slate-400 text-sm">Avg AQI:</span>
                <span className="font-bold text-orange-400">{data.averageAQI}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-lg">
                <span className="text-slate-400 text-sm">Compliance:</span>
                <span className="font-bold text-green-400">{data.compliancePercentage}%</span>
              </div>
              <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/30">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm font-bold">Critical Alerts: 2</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Multi-Zone Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Wind className="w-6 h-6 text-cyan-400" />
          Live Zone Monitoring
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          {/* Production Zone A */}
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/5 rounded-xl p-4 border border-orange-500/30 hover:border-orange-500/50 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white text-sm">Production A</h3>
              <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full font-bold">⚠️ WARNING</span>
            </div>
            <div className="mb-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-orange-400">145</span>
                <span className="text-slate-400 text-sm">AQI</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-red-400" />
                <span className="text-red-400 text-xs">↑ Increasing</span>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">MQ Index:</span>
                <span className="font-bold text-white">85 ppm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Temp:</span>
                <span className="font-bold text-white">28°C</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Humidity:</span>
                <span className="font-bold text-white">62%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Devices:</span>
                <span className="font-bold text-green-400">1 Active</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-orange-500/20">
              <div className="text-xs text-slate-400 mb-1">Last Hour Trend</div>
              <div className="text-orange-400 text-lg">▁▂▃▅▆▅▃</div>
            </div>
          </div>

          {/* Production Zone B */}
          <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-xl p-4 border border-red-500/30 hover:border-red-500/50 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white text-sm">Production B</h3>
              <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full font-bold">⚠️ WARNING</span>
            </div>
            <div className="mb-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-red-400">178</span>
                <span className="text-slate-400 text-sm">AQI</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-red-400" />
                <span className="text-red-400 text-xs">↑ Increasing</span>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">MQ Index:</span>
                <span className="font-bold text-white">92 ppm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Temp:</span>
                <span className="font-bold text-white">30°C</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Humidity:</span>
                <span className="font-bold text-white">58%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Devices:</span>
                <span className="font-bold text-green-400">1 Active</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-red-500/20">
              <div className="text-xs text-slate-400 mb-1">Last Hour Trend</div>
              <div className="text-red-400 text-lg">▃▄▅▆▆▅▄</div>
            </div>
          </div>

          {/* Warehouse */}
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-4 border border-green-500/30 hover:border-green-500/50 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white text-sm">Warehouse</h3>
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full font-bold">✅ NORMAL</span>
            </div>
            <div className="mb-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-green-400">89</span>
                <span className="text-slate-400 text-sm">AQI</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-green-400 text-xs">→ Stable</span>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">MQ Index:</span>
                <span className="font-bold text-white">45 ppm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Temp:</span>
                <span className="font-bold text-white">22°C</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Humidity:</span>
                <span className="font-bold text-white">55%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Devices:</span>
                <span className="font-bold text-green-400">1 Active</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-green-500/20">
              <div className="text-xs text-slate-400 mb-1">Last Hour Trend</div>
              <div className="text-green-400 text-lg">▂▂▂▂▂▂▂</div>
            </div>
          </div>

          {/* Loading Dock */}
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl p-4 border border-orange-500/30 hover:border-orange-500/50 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white text-sm">Loading Dock</h3>
              <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full font-bold">⚠️ WARNING</span>
            </div>
            <div className="mb-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-orange-400">156</span>
                <span className="text-slate-400 text-sm">AQI</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3 text-green-400" />
                <span className="text-green-400 text-xs">↓ Decreasing</span>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">MQ Index:</span>
                <span className="font-bold text-white">78 ppm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Temp:</span>
                <span className="font-bold text-white">25°C</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Humidity:</span>
                <span className="font-bold text-white">60%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Devices:</span>
                <span className="font-bold text-slate-400">0 Active</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-orange-500/20">
              <div className="text-xs text-slate-400 mb-1">Last Hour Trend</div>
              <div className="text-orange-400 text-lg">▂▃▄▅▄▃▂</div>
            </div>
          </div>

          {/* Outdoor Perimeter */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-xl p-4 border border-yellow-500/30 hover:border-yellow-500/50 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white text-sm">Outdoor</h3>
              <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full font-bold">✅ NORMAL</span>
            </div>
            <div className="mb-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-yellow-400">112</span>
                <span className="text-slate-400 text-sm">AQI</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-slate-400 text-xs">→ Stable</span>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">MQ Index:</span>
                <span className="font-bold text-white">52 ppm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Temp:</span>
                <span className="font-bold text-white">24°C</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Humidity:</span>
                <span className="font-bold text-white">65%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Devices:</span>
                <span className="font-bold text-slate-400">0 Active</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-yellow-500/20">
              <div className="text-xs text-slate-400 mb-1">Last Hour Trend</div>
              <div className="text-yellow-400 text-lg">▂▂▃▃▂▂▂</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Compliance Status & Real-Time Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Dashboard */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Compliance Dashboard
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Compliant Zones</span>
              <span className="text-green-400 font-bold text-lg">3/5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Warning Zones</span>
              <span className="text-orange-400 font-bold text-lg">2/5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Critical Zones</span>
              <span className="text-red-400 font-bold text-lg">0/5</span>
            </div>
            <div className="pt-4 border-t border-slate-700">
              <div className="text-xs font-semibold text-slate-300 mb-2">Today's Violations:</div>
              <div className="space-y-1 text-xs text-slate-400">
                <div>• Production A: 2 violations</div>
                <div>• Loading Dock: 1 violation</div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-700 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Next Inspection:</span>
                <span className="text-white font-semibold">Jan 30, 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Report Due:</span>
                <span className="text-white font-semibold">Feb 1, 2026</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Real-Time Alert Feed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-400 animate-pulse" />
            Live Alerts Feed
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <div className="flex items-start gap-3 bg-red-500/10 p-3 rounded-lg border border-red-500/30">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-red-400 text-sm">Production A: AQI Critical</span>
                  <span className="text-xs text-slate-400">14:35</span>
                </div>
                <p className="text-xs text-slate-300">AQI exceeded 200 → Sprinklers activated</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-orange-500/10 p-3 rounded-lg border border-orange-500/30">
              <Wind className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-orange-400 text-sm">Production A: MQ Index High</span>
                  <span className="text-xs text-slate-400">16:20</span>
                </div>
                <p className="text-xs text-slate-300">MQ Index 92 → Ventilation increased</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-orange-500/10 p-3 rounded-lg border border-orange-500/30">
              <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-orange-400 text-sm">Loading Dock: Operations Paused</span>
                  <span className="text-xs text-slate-400">18:45</span>
                </div>
                <p className="text-xs text-slate-300">AQI 156 → Operations temporarily halted</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-green-500/10 p-3 rounded-lg border border-green-500/30">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-green-400 text-sm">Warehouse: Normal Operation</span>
                  <span className="text-xs text-slate-400">19:10</span>
                </div>
                <p className="text-xs text-slate-300">All parameters within limits</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions Panel */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gradient-to-br from-cyan-600/10 to-blue-600/5 rounded-xl p-5 border border-cyan-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button className="bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 hover:border-cyan-500/60 text-cyan-400 font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm">
              <Wind className="w-4 h-4" />
              Activate Ventilation
            </button>
            <button className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 hover:border-blue-500/60 text-blue-400 font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm">
              <Droplet className="w-4 h-4" />
              Start Sprinklers
            </button>
            <button className="bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/40 hover:border-yellow-500/60 text-yellow-400 font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm">
              <Bell className="w-4 h-4" />
              Notify Safety Team
            </button>
            <button className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 hover:border-purple-500/60 text-purple-400 font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm">
              <FileText className="w-4 h-4" />
              Generate Report
            </button>
            <button className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 hover:border-red-500/60 text-red-400 font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm">
              <StopCircle className="w-4 h-4" />
              Emergency Pause
            </button>
          </div>
        </div>
      </motion.div>

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
    mq: 85,
    humidity: 62,
    temperature: 28,
    alerts: [
      {
        id: '1',
        title: 'Threshold Warning',
        message: 'MQ Index approaching threshold at 85 ppm',
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
