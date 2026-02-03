const winston = require('winston');
const taskService = require('../services/taskService');
const formLockService = require('../services/formLockService');

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

  /**
   * Lock a form for editing
   */
  async lockForm(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const result = await formLockService.lockForm(id, userId);

      if (!result.success) {
        return res.status(409).json(result);
      }

      res.json({
        success: true,
        message: 'Form locked successfully'
      });
    } catch (error) {
      logger.error('Error locking form:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Unlock a form
   */
  async unlockForm(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const result = await formLockService.unlockForm(id, userId);

      if (!result.success) {
        return res.status(403).json(result);
      }

      res.json({
        success: true,
        message: 'Form unlocked successfully'
      });
    } catch (error) {
      logger.error('Error unlocking form:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Save form as draft (partial save)
   */
  async saveFormDraft(req, res) {
    try {
      const { id } = req.params;
      const { formData, progress } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Check if user can edit
      const canEdit = await formLockService.canEditForm(id, userId);
      if (!canEdit.canEdit) {
        return res.status(403).json({
          success: false,
          error: canEdit.reason
        });
      }

      const result = await formLockService.saveFormDraft(
        id,
        userId,
        formData,
        progress
      );

      res.json({
        success: true,
        data: result.data,
        message: 'Form draft saved successfully'
      });
    } catch (error) {
      logger.error('Error saving form draft:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Submit completed form
   */
  async submitForm(req, res) {
    try {
      const { id } = req.params;
      const { formData } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Check if user can edit
      const canEdit = await formLockService.canEditForm(id, userId);
      if (!canEdit.canEdit) {
        return res.status(403).json({
          success: false,
          error: canEdit.reason
        });
      }

      const result = await formLockService.submitForm(id, userId, formData);

      res.json({
        success: true,
        data: result.data,
        message: 'Form submitted successfully'
      });
    } catch (error) {
      logger.error('Error submitting form:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Check form access and get editable fields
   */
  async checkFormAccess(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const canEdit = await formLockService.canEditForm(id, userId);

      // Get task with form to determine editable fields
      const { Task, Form } = require('../models');
      const task = await Task.findByPk(id, {
        include: [
          {
            model: Form,
            as: 'form'
          }
        ]
      });

      let editableFields = [];
      if (task && task.form && task.form.schema) {
        editableFields = formLockService.getEditableFields(
          task.form.schema,
          userId
        );
      }

      res.json({
        success: true,
        data: {
          canEdit: canEdit.canEdit,
          reason: canEdit.reason,
          editableFields,
          formData: task?.formData || {},
          formProgress: task?.formProgress || 0,
          lockedBy: task?.lockedBy,
          lockedAt: task?.lockedAt
        }
      });
    } catch (error) {
      logger.error('Error checking form access:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get form lock status
   */
  async getFormLockStatus(req, res) {
    try {
      const { id } = req.params;

      const { Task, User } = require('../models');
      const task = await Task.findByPk(id, {
        include: [
          {
            model: User,
            as: 'lockedByUser',
            attributes: ['id', 'username', 'firstName', 'lastName']
          }
        ]
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }

      res.json({
        success: true,
        data: {
          isLocked: !!task.lockedBy,
          lockedBy: task.lockedByUser,
          lockedAt: task.lockedAt,
          formProgress: task.formProgress
        }
      });
    } catch (error) {
      logger.error('Error getting form lock status:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new TaskController();
