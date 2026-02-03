const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// Admin operations
router.get('/instances', adminController.getAllInstances.bind(adminController));
router.get('/tasks', adminController.getAllTasks.bind(adminController));
router.get('/analytics', adminController.getWorkflowAnalytics.bind(adminController));
router.get('/instances/:instanceId/history', adminController.getInstanceHistory.bind(adminController));
router.get('/statistics', adminController.getSystemStatistics.bind(adminController));
router.get('/users', adminController.getAllUsers.bind(adminController));

module.exports = router;
