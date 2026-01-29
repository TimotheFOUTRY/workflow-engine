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

module.exports = router;
