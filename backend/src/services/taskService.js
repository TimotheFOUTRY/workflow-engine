const winston = require('winston');
const { Task, User, Form, WorkflowInstance } = require('../models');
const queueService = require('./queueService');
const workflowEngine = require('./workflowEngine');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

class TaskService {
  /**
   * Get task by ID
   */
  async getTask(taskId) {
    try {
      const task = await Task.findByPk(taskId, {
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'username', 'email', 'firstName', 'lastName'] },
          { model: User, as: 'lockedByUser', attributes: ['id', 'username', 'email', 'firstName', 'lastName'] },
          { model: Form, as: 'form' },
          { 
            model: WorkflowInstance, 
            as: 'instance',
            attributes: ['id', 'workflowId', 'status', 'currentStep']
          }
        ]
      });

      return task;
    } catch (error) {
      logger.error('Error getting task:', error);
      throw error;
    }
  }

  /**
   * Get tasks for a user
   */
  async getUserTasks(userId, filters = {}) {
    try {
      const where = { assignedTo: userId };
      
      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.taskType) {
        where.taskType = filters.taskType;
      }

      const tasks = await Task.findAll({
        where,
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'username', 'email', 'firstName', 'lastName'] },
          { model: User, as: 'lockedByUser', attributes: ['id', 'username', 'email', 'firstName', 'lastName'] },
          { model: Form, as: 'form' },
          { 
            model: WorkflowInstance, 
            as: 'instance',
            attributes: ['id', 'workflowId', 'status', 'currentStep']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return tasks;
    } catch (error) {
      logger.error('Error getting user tasks:', error);
      throw error;
    }
  }

  /**
   * Get all tasks (admin)
   */
  async getAllTasks(filters = {}, pagination = {}) {
    try {
      const where = {};
      
      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.assignedTo) {
        where.assignedTo = filters.assignedTo;
      }

      if (filters.instanceId) {
        where.instanceId = filters.instanceId;
      }

      const { page = 1, limit = 50 } = pagination;
      const offset = (page - 1) * limit;

      const { count, rows } = await Task.findAndCountAll({
        where,
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'username', 'email'] },
          { model: Form, as: 'form', attributes: ['id', 'name'] },
          { 
            model: WorkflowInstance, 
            as: 'instance',
            attributes: ['id', 'workflowId', 'status']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      return {
        tasks: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      logger.error('Error getting all tasks:', error);
      throw error;
    }
  }

  /**
   * Complete a task
   */
  async completeTask(taskId, userId, decision = null, taskData = {}) {
    try {
      const task = await this.getTask(taskId);
      
      if (!task) {
        throw new Error(`Task ${taskId} not found`);
      }

      if (task.assignedTo && task.assignedTo !== userId) {
        throw new Error('Task not assigned to this user');
      }

      if (task.status !== 'pending' && task.status !== 'in_progress') {
        throw new Error(`Task cannot be completed. Current status: ${task.status}`);
      }

      // Use workflow engine to complete task
      await workflowEngine.completeTask(taskId, userId, decision, taskData);

      logger.info(`Task ${taskId} completed by user ${userId}`);
      return await this.getTask(taskId);
    } catch (error) {
      logger.error('Error completing task:', error);
      throw error;
    }
  }

  /**
   * Reassign task to another user
   */
  async reassignTask(taskId, newAssignee, reassignedBy) {
    try {
      const task = await Task.findByPk(taskId);
      
      if (!task) {
        throw new Error(`Task ${taskId} not found`);
      }

      if (task.status !== 'pending') {
        throw new Error('Only pending tasks can be reassigned');
      }

      const oldAssignee = task.assignedTo;
      
      await task.update({ assignedTo: newAssignee });

      // Publish event
      await queueService.publishTaskEvent({
        type: 'task.reassigned',
        taskId: task.id,
        oldAssignee,
        newAssignee,
        reassignedBy
      });

      logger.info(`Task ${taskId} reassigned from ${oldAssignee} to ${newAssignee}`);
      return task;
    } catch (error) {
      logger.error('Error reassigning task:', error);
      throw error;
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId, status) {
    try {
      const task = await Task.findByPk(taskId);
      
      if (!task) {
        throw new Error(`Task ${taskId} not found`);
      }

      await task.update({ status });

      logger.info(`Task ${taskId} status updated to ${status}`);
      return task;
    } catch (error) {
      logger.error('Error updating task status:', error);
      throw error;
    }
  }

  /**
   * Get task statistics
   */
  async getTaskStatistics(userId = null) {
    try {
      const where = userId ? { assignedTo: userId } : {};

      const statistics = {
        total: await Task.count({ where }),
        pending: await Task.count({ where: { ...where, status: 'pending' } }),
        inProgress: await Task.count({ where: { ...where, status: 'in_progress' } }),
        completed: await Task.count({ where: { ...where, status: 'completed' } }),
        rejected: await Task.count({ where: { ...where, status: 'rejected' } }),
        overdue: await Task.count({
          where: {
            ...where,
            status: 'pending',
            dueDate: { [require('sequelize').Op.lt]: new Date() }
          }
        })
      };

      return statistics;
    } catch (error) {
      logger.error('Error getting task statistics:', error);
      throw error;
    }
  }
}

module.exports = new TaskService();
