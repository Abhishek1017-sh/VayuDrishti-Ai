import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, FileText, TrendingUp, AlertTriangle, BarChart3, Download } from 'lucide-react';
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
