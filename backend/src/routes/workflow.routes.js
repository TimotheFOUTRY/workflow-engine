const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflow.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All workflow routes require authentication
router.use(authenticate);

// Workflow CRUD
router.post('/', workflowController.createWorkflow.bind(workflowController));
router.get('/', workflowController.getAllWorkflows.bind(workflowController));
router.get('/:id', workflowController.getWorkflow.bind(workflowController));
router.put('/:id', workflowController.updateWorkflow.bind(workflowController));
router.delete('/:id', workflowController.deleteWorkflow.bind(workflowController));

// Workflow instances
router.post('/:id/start', workflowController.startWorkflowInstance.bind(workflowController));
router.get('/:id/instances', workflowController.getWorkflowInstances.bind(workflowController));
router.get('/instances/:instanceId', workflowController.getWorkflowInstance.bind(workflowController));
router.post('/instances/:instanceId/cancel', workflowController.cancelWorkflowInstance.bind(workflowController));

module.exports = router;
