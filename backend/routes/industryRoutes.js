/**
 * Industry Routes
 * API endpoints for industrial facility monitoring
 */

const express = require('express');
const router = express.Router();
const industryService = require('../services/industryService');

// Get industry dashboard summary
router.get('/dashboard/:facilityId', async (req, res) => {
  try {
    const { facilityId } = req.params;
    const data = await industryService.getDashboardSummary(facilityId);
    res.json(data);
  } catch (error) {
    console.error('Industry dashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get compliance report
router.get('/compliance/:facilityId', async (req, res) => {
  try {
    const { facilityId } = req.params;
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const data = await industryService.getComplianceReport(facilityId, start, end);
    res.json(data);
  } catch (error) {
    console.error('Compliance report error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get production correlation analysis
router.get('/production-correlation/:facilityId', async (req, res) => {
  try {
    const { facilityId } = req.params;
    const { date } = req.query;
    
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const data = await industryService.getProductionCorrelation(facilityId, targetDate);
    res.json(data);
  } catch (error) {
    console.error('Production correlation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
