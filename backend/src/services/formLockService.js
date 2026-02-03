const winston = require('winston');
const { Task, User, Form, WorkflowInstance, Workflow } = require('../models');
const notificationService = require('./notificationService');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// Lock timeout in milliseconds (15 minutes)
const LOCK_TIMEOUT = 15 * 60 * 1000;

class FormLockService {
  /**
   * Lock a form for editing by a user
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID attempting to lock
   * @returns {Promise<{success: boolean, message?: string, lockedBy?: object}>}
   */
  async lockForm(taskId, userId) {
    try {
      const task = await Task.findByPk(taskId, {
        include: [
          {
            model: User,
            as: 'lockedByUser',
            attributes: ['id', 'username', 'firstName', 'lastName']
          }
        ]
      });

      if (!task) {
        return { success: false, message: 'Task not found' };
      }

      // Check if already locked
      if (task.lockedBy && task.lockedBy !== userId) {
        const lockAge = Date.now() - new Date(task.lockedAt).getTime();
        
        // Check if lock has expired
        if (lockAge < LOCK_TIMEOUT) {
          return {
            success: false,
            message: 'Form is currently locked by another user',
            lockedBy: task.lockedByUser
          };
        }
        
        // Lock has expired, force unlock
        logger.info(`Lock expired for task ${taskId}, unlocking`);
      }

      // Lock the form
      await task.update({
        lockedBy: userId,
        lockedAt: new Date()
      });

      return { success: true };
    } catch (error) {
      logger.error('Error locking form:', error);
      throw error;
    }
  }

  /**
   * Unlock a form
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID attempting to unlock
   * @param {boolean} force - Force unlock regardless of who locked it
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async unlockForm(taskId, userId, force = false) {
    try {
      const task = await Task.findByPk(taskId);

      if (!task) {
        return { success: false, message: 'Task not found' };
      }

      // Check if user has permission to unlock
      if (!force && task.lockedBy && task.lockedBy !== userId) {
        return {
          success: false,
          message: 'You do not have permission to unlock this form'
        };
      }

      // Unlock the form
      await task.update({
        lockedBy: null,
        lockedAt: null
      });

      return { success: true };
    } catch (error) {
      logger.error('Error unlocking form:', error);
      throw error;
    }
  }

  /**
   * Check if user can edit the form
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   * @returns {Promise<{canEdit: boolean, reason?: string}>}
   */
  async canEditForm(taskId, userId) {
    try {
      const task = await Task.findByPk(taskId);

      if (!task) {
        return { canEdit: false, reason: 'Task not found' };
      }

      // Check if task is completed or cancelled
      if (['completed', 'cancelled', 'rejected'].includes(task.status)) {
        return { canEdit: false, reason: 'Task is already completed or cancelled' };
      }

      // Check if user is assigned to the task
      const isAssigned = task.assignedUsers && task.assignedUsers.includes(userId);
      const isDirectAssignee = task.assignedTo === userId;

      if (!isAssigned && !isDirectAssignee) {
        return { canEdit: false, reason: 'User is not assigned to this task' };
      }

      // Check if form is locked by another user
      if (task.lockedBy && task.lockedBy !== userId) {
        const lockAge = Date.now() - new Date(task.lockedAt).getTime();
        
        if (lockAge < LOCK_TIMEOUT) {
          return { canEdit: false, reason: 'Form is locked by another user' };
        }
      }

      return { canEdit: true };
    } catch (error) {
      logger.error('Error checking form edit permission:', error);
      throw error;
    }
  }

  /**
   * Check if user can edit a specific form field based on field assignment
   * @param {object} formSchema - Form schema
   * @param {string} fieldName - Field name
   * @param {string} userId - User ID
   * @returns {boolean}
   */
  canEditField(formSchema, fieldName, userId) {
    if (!formSchema.properties || !formSchema.properties[fieldName]) {
      return false;
    }

    const field = formSchema.properties[fieldName];
    
    // If field has no assigned users, anyone assigned to the task can edit
    if (!field.assignedUsers || field.assignedUsers.length === 0) {
      return true;
    }

    // Check if user is in the field's assigned users
    return field.assignedUsers.includes(userId);
  }

  /**
   * Get all editable fields for a user in a form
   * @param {object} formSchema - Form schema
   * @param {string} userId - User ID
   * @returns {string[]} - Array of editable field names
   */
  getEditableFields(formSchema, userId) {
    if (!formSchema.properties) {
      return [];
    }

    return Object.keys(formSchema.properties).filter(fieldName => 
      this.canEditField(formSchema, fieldName, userId)
    );
  }

  /**
   * Save form draft and send notifications
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   * @param {object} formData - Form data to save
   * @param {number} progress - Form completion percentage
   * @returns {Promise<object>}
   */
  async saveFormDraft(taskId, userId, formData, progress = 0) {
    try {
      const task = await Task.findByPk(taskId, {
        include: [
          {
            model: require('../models').WorkflowInstance,
            as: 'instance',
            include: [
              {
                model: require('../models').Workflow,
                as: 'workflow'
              }
            ]
          },
          {
            model: Form,
            as: 'form'
          }
        ]
      });

      if (!task) {
        throw new Error('Task not found');
      }

      // Validate field-level permissions
      if (task.form && task.form.schema) {
        const editableFields = this.getEditableFields(task.form.schema, userId);
        
        // Filter form data to only include fields the user can edit
        const filteredFormData = {};
        for (const [key, value] of Object.entries(formData)) {
          if (editableFields.includes(key)) {
            filteredFormData[key] = value;
          }
        }

        // Merge with existing form data
        const mergedFormData = {
          ...(task.formData || {}),
          ...filteredFormData
        };

        // Update task with new form data
        await task.update({
          formData: mergedFormData,
          formProgress: progress,
          status: progress === 100 ? 'in_progress' : task.status,
          lockedBy: null,
          lockedAt: null
        });

        // Send notifications
        await this.sendDraftNotifications(task, userId);

        return {
          success: true,
          data: task
        };
      }

      // If no form schema, save all data
      await task.update({
        formData,
        formProgress: progress,
        status: progress === 100 ? 'in_progress' : task.status,
        lockedBy: null,
        lockedAt: null
      });

      // Send notifications
      await this.sendDraftNotifications(task, userId);

      return {
        success: true,
        data: task
      };
    } catch (error) {
      logger.error('Error saving form draft:', error);
      throw error;
    }
  }

  /**
   * Send notifications when form is saved as draft
   * @param {object} task - Task object
   * @param {string} userId - User who saved the draft
   */
  async sendDraftNotifications(task, userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'firstName', 'lastName']
      });

      const userName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.username;

      // Get workflow owner
      const workflowOwner = task.instance?.workflow?.createdBy;

      // Get all assigned users
      const assignedUserIds = [...new Set([
        ...(task.assignedUsers || []),
        task.assignedTo,
        workflowOwner
      ].filter(Boolean).filter(id => id !== userId))];

      // Create notification message
      const message = `${userName} a sauvegardé un formulaire partiellement complété (${task.formProgress}% complété)`;

      // Send notifications to all relevant users
      for (const recipientId of assignedUserIds) {
        await notificationService.createNotification({
          userId: recipientId,
          type: 'form_draft_saved',
          title: 'Formulaire sauvegardé',
          message,
          relatedTaskId: task.id,
          relatedWorkflowInstanceId: task.instanceId,
          priority: 'medium'
        });
      }

      logger.info(`Sent draft notifications for task ${task.id} to ${assignedUserIds.length} users`);
    } catch (error) {
      logger.error('Error sending draft notifications:', error);
      // Don't throw error, just log it - notifications failure shouldn't block form save
    }
  }

  /**
   * Submit completed form and complete the task
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   * @param {object} formData - Complete form data
   * @returns {Promise<object>}
   */
  async submitForm(taskId, userId, formData) {
    try {
      const task = await Task.findByPk(taskId, {
        include: [
          {
            model: Form,
            as: 'form'
          }
        ]
      });

      if (!task) {
        throw new Error('Task not found');
      }

      // Validate that form is complete
      // TODO: Add actual validation based on form schema

      // Update task as completed
      await task.update({
        formData,
        formProgress: 100,
        status: 'completed',
        completedAt: new Date(),
        lockedBy: null,
        lockedAt: null,
        taskData: {
          ...task.taskData,
          submittedBy: userId,
          submittedAt: new Date()
        }
      });

      // Send completion notifications
      await this.sendCompletionNotifications(task, userId);

      return {
        success: true,
        data: task
      };
    } catch (error) {
      logger.error('Error submitting form:', error);
      throw error;
    }
  }

  /**
   * Send notifications when form is completed
   * @param {object} task - Task object
   * @param {string} userId - User who completed the form
   */
  async sendCompletionNotifications(task, userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'firstName', 'lastName']
      });

      const userName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.username;

      // Get all assigned users except the one who completed
      const assignedUserIds = [...new Set([
        ...(task.assignedUsers || []),
        task.assignedTo
      ].filter(Boolean).filter(id => id !== userId))];

      const message = `${userName} a complété le formulaire`;

      // Send notifications
      for (const recipientId of assignedUserIds) {
        await notificationService.createNotification({
          userId: recipientId,
          type: 'task_completed',
          title: 'Formulaire complété',
          message,
          relatedTaskId: task.id,
          relatedWorkflowInstanceId: task.instanceId,
          priority: 'high'
        });
      }

      logger.info(`Sent completion notifications for task ${task.id}`);
    } catch (error) {
      logger.error('Error sending completion notifications:', error);
    }
  }

  /**
   * Auto-unlock expired locks (can be called periodically)
   */
  async cleanExpiredLocks() {
    try {
      const expiryTime = new Date(Date.now() - LOCK_TIMEOUT);
      
      const expiredTasks = await Task.findAll({
        where: {
          lockedBy: { [require('sequelize').Op.ne]: null },
          lockedAt: { [require('sequelize').Op.lt]: expiryTime }
        }
      });

      for (const task of expiredTasks) {
        await task.update({
          lockedBy: null,
          lockedAt: null
        });
        logger.info(`Auto-unlocked expired lock for task ${task.id}`);
      }

      return { cleaned: expiredTasks.length };
    } catch (error) {
      logger.error('Error cleaning expired locks:', error);
      throw error;
    }
  }
}

module.exports = new FormLockService();
