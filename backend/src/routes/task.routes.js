const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All task routes require authentication
router.use(authenticate);

// Task operations
router.get('/my-tasks', taskController.getMyTasks.bind(taskController));
router.get('/statistics', taskController.getTaskStatistics.bind(taskController));
router.get('/:id', taskController.getTask.bind(taskController));
router.post('/:id/complete', taskController.completeTask.bind(taskController));
router.post('/:id/reassign', taskController.reassignTask.bind(taskController));
router.put('/:id/status', taskController.updateTaskStatus.bind(taskController));

// Form management routes
router.post('/:id/lock', taskController.lockForm.bind(taskController));
router.post('/:id/unlock', taskController.unlockForm.bind(taskController));
router.post('/:id/save-draft', taskController.saveFormDraft.bind(taskController));
router.post('/:id/submit-form', taskController.submitForm.bind(taskController));
router.get('/:id/form-access', taskController.checkFormAccess.bind(taskController));
router.get('/:id/lock-status', taskController.getFormLockStatus.bind(taskController));

module.exports = router;
