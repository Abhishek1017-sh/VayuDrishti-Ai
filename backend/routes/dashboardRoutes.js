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

module.exports = router;
