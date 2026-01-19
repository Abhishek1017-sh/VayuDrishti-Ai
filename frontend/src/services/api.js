/**
 * API Service
 * Centralized API calls to the backend
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  
  // Get analytics
  getAnalytics: (period = '24h') => api.get(`/dashboard/analytics?period=${period}`),
};

/**
 * Alert APIs
 */
export const alertAPI = {
  // Get all alerts
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/alerts?${queryParams}`);
  },
  
  // Get active alerts
  getActive: () => api.get('/alerts/active'),
  
  // Acknowledge alert
  acknowledge: (alertId, acknowledgedBy) => 
    api.post('/alerts/acknowledge', { alertId, acknowledgedBy }),
};

export default api;
