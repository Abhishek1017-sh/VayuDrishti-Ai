const express = require('express');
const router = express.Router();
const automationController = require('../controllers/automationController');

// Automation Logs
router.get('/logs', automationController.getAutomationLogs);
router.post('/trigger', automationController.triggerAutomation);

// Fire Brigade Contacts Management
router.get('/fire-brigade', automationController.getFireBrigadeContacts);
router.get('/fire-brigade/:zone', automationController.getFireBrigadeByZone);
router.post('/fire-brigade', automationController.createFireBrigadeContact);
router.put('/fire-brigade/:zone', automationController.updateFireBrigadeContact);
router.delete('/fire-brigade/:zone', automationController.deleteFireBrigadeContact);

// Initialize default contacts
router.post('/fire-brigade/init/defaults', automationController.initializeDefaultContacts);

// Sprinkler System Control
router.post('/sprinklers/activate', automationController.activateSprinklers);
router.post('/sprinklers/deactivate', automationController.deactivateSprinklers);

// Ventilation System Control
router.post('/ventilation/enable', automationController.enableVentilation);
router.post('/ventilation/disable', automationController.disableVentilation);

module.exports = router;
