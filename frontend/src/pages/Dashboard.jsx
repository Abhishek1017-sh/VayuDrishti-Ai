import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertCircle } from 'lucide-react';
import AdminDashboard from './Dashboard/AdminDashboard';
import IndustryDashboard from './Dashboard/IndustryDashboard';
import HomeDashboard from './Dashboard/HomeDashboard';
import AQICard from '../components/dashboard/AQICard';
import SensorPanel from '../components/dashboard/SensorPanel';
import AutomationPanel from '../components/dashboard/AutomationPanel';
import AlertsWidget from '../components/dashboard/AlertsWidget';

function Dashboard({ userRole = 'home' }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Route to correct dashboard based on user role
  if (userRole === 'admin') {
    return <AdminDashboard />;
  }

  if (userRole === 'industry') {
    return <IndustryDashboard />;
  }

  if (userRole === 'home') {
    return <HomeDashboard />;
  }

  // Fallback for unknown roles - show home dashboard
  return <HomeDashboard />;
}

export default Dashboard;
