const winston = require('winston');
const taskService = require('../services/taskService');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

class TaskController {
  /**
   * Get tasks for current user
   */
  async getMyTasks(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const { status, taskType } = req.query;
      const tasks = await taskService.getUserTasks(userId, {
        status,
        taskType
      });

      res.json({
        success: true,
        data: tasks
      });
    } catch (error) {
      logger.error('Error getting user tasks:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get task by ID
   */
  async getTask(req, res) {
    try {
      const { id } = req.params;
      
      const task = await taskService.getTask(id);
      
      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }

      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      logger.error('Error getting task:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Complete a task
   */
  async completeTask(req, res) {
    try {
      const { id } = req.params;
      const { decision, data } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const task = await taskService.completeTask(id, userId, decision, data);

      res.json({
        success: true,
        data: task,
        message: 'Task completed successfully'
      });
    } catch (error) {
      logger.error('Error completing task:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Reassign task
   */
  async reassignTask(req, res) {
    try {
      const { id } = req.params;
      const { assignedTo } = req.body;
      const userId = req.user?.id;

      const task = await taskService.reassignTask(id, assignedTo, userId);

      res.json({
        success: true,
        data: task,
        message: 'Task reassigned successfully'
      });
    } catch (error) {
      logger.error('Error reassigning task:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const task = await taskService.updateTaskStatus(id, status);

      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      logger.error('Error updating task status:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get task statistics
   */
  async getTaskStatistics(req, res) {
    try {
      const userId = req.user?.id;
      const statistics = await taskService.getTaskStatistics(userId);

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error('Error getting task statistics:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new TaskController();
