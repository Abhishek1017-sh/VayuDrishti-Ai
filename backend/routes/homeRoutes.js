/**
 * Home Routes
 * API endpoints for residential home monitoring
 */

const express = require('express');
const router = express.Router();
const homeService = require('../services/homeService');

// Get home dashboard summary
router.get('/dashboard/:homeId', async (req, res) => {
  try {
    const { homeId } = req.params;
    const data = await homeService.getDashboardSummary(homeId);
    res.json(data);
  } catch (error) {
    console.error('Home dashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get room history
router.get('/room/:roomId/history', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { hours } = req.query;
    
    const data = await homeService.getRoomHistory(roomId, parseInt(hours) || 24);
    res.json(data);
  } catch (error) {
    console.error('Room history error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Control device in room
router.post('/room/:roomId/control', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { action, relayType } = req.body;
    
    if (!action || !relayType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: action and relayType' 
      });
    }
    
    if (!['ON', 'OFF', 'TOGGLE'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid action. Must be ON, OFF, or TOGGLE' 
      });
    }
    
    if (!['led', 'fan', 'pump'].includes(relayType)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid relayType. Must be led, fan, or pump' 
      });
    }
    
    const data = await homeService.controlDevice(roomId, action, relayType);
    res.json(data);
  } catch (error) {
    console.error('Device control error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
