/**
 * Dashboard Routes
 * Provides aggregated data for dashboard display
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET /api/dashboard - Get complete dashboard data
router.get('/', dashboardController.getDashboardData);

// GET /api/dashboard/analytics - Get analytics data
router.get('/analytics', dashboardController.getAnalytics);

// GET /api/dashboard/admin - Get admin dashboard data
router.get('/admin', dashboardController.getDashboardData);

// GET /api/dashboard/industry - Get industry dashboard data
router.get('/industry', dashboardController.getDashboardData);

// GET /api/dashboard/home - Get home dashboard data
router.get('/home', dashboardController.getDashboardData);

module.exports = router;
