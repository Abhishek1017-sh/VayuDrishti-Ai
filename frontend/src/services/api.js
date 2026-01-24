/**
 * API Service
 * Centralized API calls to the backend
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens (if needed)
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Sensor Data APIs
 */
export const sensorAPI = {
  // Send sensor data
  sendData: (data) => api.post('/sensors/data', data),
  
  // Get latest sensor readings
  getLatest: () => api.get('/sensors/latest'),
  
  // Get sensor history
  getHistory: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/sensors/history?${queryParams}`);
  },
  
  // Get sensor health
  getHealth: () => api.get('/sensors/health'),
};

/**
 * AQI APIs
 */
export const aqiAPI = {
  // Calculate AQI
  calculate: (data) => api.post('/aqi/calculate', data),
  
  // Get current AQI
  getCurrent: () => api.get('/aqi/current'),
  
  // Get AQI history
  getHistory: (hours = 24) => api.get(`/aqi/history?hours=${hours}`),
};

/**
 * Dashboard APIs
 */
export const dashboardAPI = {
  // Get complete dashboard data
  getData: () => api.get('/dashboard'),
  
  // Get admin dashboard data (all sensors and system-wide stats)
  getAdminData: () => api.get('/dashboard/admin'),
  
  // Get industry dashboard data (facility-specific)
  getIndustryData: (facilityId) => api.get(`/dashboard/industry?facilityId=${facilityId}`),
  
  // Get home dashboard data (single device)
  getHomeData: (deviceId) => api.get(`/dashboard/home?deviceId=${deviceId}`),
  
  // Get analytics
  getAnalytics: (period = '24h') => api.get(`/dashboard/analytics?period=${period}`),
};

/**
 * Compliance APIs (for Industry users)
 */
export const complianceAPI = {
  // Get compliance status
  getStatus: (facilityId) => api.get(`/compliance/status?facilityId=${facilityId}`),
  
  // Get compliance score
  getScore: (facilityId) => api.get(`/compliance/score?facilityId=${facilityId}`),
  
  // Generate compliance report
  generateReport: (facilityId, format = 'pdf') => 
    api.post(`/compliance/report`, { facilityId, format }),
  
  // Get compliance history
  getHistory: (facilityId, days = 30) => 
    api.get(`/compliance/history?facilityId=${facilityId}&days=${days}`),
};

/**
 * Recommendations APIs (for Home users)
 */
export const recommendationsAPI = {
  // Get health recommendations based on AQI
  getHealthTips: (aqi) => api.get(`/recommendations/health?aqi=${aqi}`),
  
  // Get activity recommendations
  getActivityRecommendations: (aqi) => api.get(`/recommendations/activities?aqi=${aqi}`),
  
  // Get preventive measures
  getPreventiveMeasures: (aqi) => api.get(`/recommendations/measures?aqi=${aqi}`),
};

/**
 * Alert APIs
 */
export const alertAPI = {
  // Get all alerts (Admin)
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/alerts?${queryParams}`);
  },
  
  // Get active alerts
  getActive: () => api.get('/alerts/active'),
  
  // Get facility alerts (Industry)
  getFacility: (facilityId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/alerts/facility/${facilityId}?${queryParams}`);
  },
  
  // Get device alerts (Home)
  getDevice: (deviceId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/alerts/device/${deviceId}?${queryParams}`);
  },
  
  // Acknowledge alert
  acknowledge: (alertId, acknowledgedBy, notes = '') => 
    api.post(`/alerts/${alertId}/acknowledge`, { acknowledgedBy, notes }),
  
  // Resolve alert
  resolve: (alertId, resolvedBy, notes = '') => 
    api.post(`/alerts/${alertId}/resolve`, { resolvedBy, notes }),
  
  // Delete alert (Admin)
  delete: (alertId) => api.delete(`/alerts/${alertId}`),
  
  // Create alert from sensor data
  create: (alertData) => api.post('/alerts', alertData),
  
  // Control relay (LED, Fan, Pump)
  relayControl: (deviceId, relay, state, duration = null) => 
    api.post(`/alerts/device/${deviceId}/control`, { relay, state, duration }),
  
  // Get device status
  getDeviceStatus: (deviceId) => api.get(`/alerts/device/${deviceId}/status`),
  
  // Get automation logs
  getAutomationLogs: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/alerts/automation/logs?${queryParams}`);
  },
};

/**
 * Water Tank APIs
 */
export const waterTankAPI = {
  // Get all water tanks
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/water-tanks?${queryParams}`);
  },

  // Get specific tank by ID
  getById: (tankId) => api.get(`/water-tanks/${tankId}`),

  // Update water level (from sensor)
  updateLevel: (data) => api.post('/water-tanks/level', data),

  // Create new water tank (Admin)
  create: (tankData) => api.post('/water-tanks', tankData),

  // Update tank configuration
  update: (tankId, updates) => api.put(`/water-tanks/${tankId}`, updates),

  // Delete tank
  delete: (tankId) => api.delete(`/water-tanks/${tankId}`),

  // Check sprinkler availability for a tank
  getSprinklerStatus: (tankId) => api.get(`/water-tanks/${tankId}/sprinkler-status`),

  // Acknowledge municipality refill
  acknowledgeRefill: (tankId, data) => 
    api.post(`/water-tanks/${tankId}/refill-acknowledge`, data),

  // Get tank alerts history
  getAlerts: (tankId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/water-tanks/${tankId}/alerts?${queryParams}`);
  },

  // Get tank statistics
  getStats: (tankId, period = '24h') => 
    api.get(`/water-tanks/${tankId}/stats?period=${period}`),
};

/**
 * Industry APIs
 */
export const industryAPI = {
  // Get industry dashboard
  getDashboard: (facilityId) => api.get(`/industry/dashboard/${facilityId}`),
  
  // Get compliance report
  getComplianceReport: (facilityId, startDate, endDate) => {
    const params = new URLSearchParams({ startDate, endDate }).toString();
    return api.get(`/industry/compliance/${facilityId}?${params}`);
  },
  
  // Get production correlation
  getProductionCorrelation: (facilityId, date) => {
    const params = new URLSearchParams({ date }).toString();
    return api.get(`/industry/production-correlation/${facilityId}?${params}`);
  },
};

/**
 * Home APIs
 */
export const homeAPI = {
  // Get home dashboard
  getDashboard: (homeId) => api.get(`/home/dashboard/${homeId}`),
  
  // Get room history
  getRoomHistory: (roomId, hours = 24) => 
    api.get(`/home/room/${roomId}/history?hours=${hours}`),
  
  // Control room device
  controlDevice: (roomId, action, relayType) => 
    api.post(`/home/room/${roomId}/control`, { action, relayType }),
};

export default api;
