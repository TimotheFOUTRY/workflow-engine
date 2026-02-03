const winston = require('winston');
const { WorkflowInstance, Task, Workflow, User, WorkflowHistory } = require('../models');
const taskService = require('../services/taskService');
const { Op } = require('sequelize');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

class AdminController {
  /**
   * Get all workflow instances with filtering
   */
  async getAllInstances(req, res) {
    try {
      const { status, workflowId, page = 1, limit = 50 } = req.query;
      const where = {};
      
      if (status) where.status = status;
      if (workflowId) where.workflowId = workflowId;

      const offset = (page - 1) * limit;

      const { count, rows } = await WorkflowInstance.findAndCountAll({
        where,
        include: [
          { model: Workflow, as: 'workflow', attributes: ['id', 'name'] }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          instances: rows,
          total: count,
          page: parseInt(page),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      logger.error('Error getting all instances:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get all tasks (admin view)
   */
  async getAllTasks(req, res) {
    try {
      const { status, assignedTo, instanceId, page = 1, limit = 50 } = req.query;
      
      const result = await taskService.getAllTasks(
        { status, assignedTo, instanceId },
        { page: parseInt(page), limit: parseInt(limit) }
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error getting all tasks:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get workflow analytics
   */
  async getWorkflowAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const dateFilter = {};
      
      if (startDate) {
        dateFilter[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        dateFilter[Op.lte] = new Date(endDate);
      }

      const where = Object.keys(dateFilter).length > 0 
        ? { createdAt: dateFilter }
        : {};

      // Instance statistics
      const totalInstances = await WorkflowInstance.count({ where });
      const completedInstances = await WorkflowInstance.count({
        where: { ...where, status: 'completed' }
      });
      const failedInstances = await WorkflowInstance.count({
        where: { ...where, status: 'failed' }
      });
      const runningInstances = await WorkflowInstance.count({
        where: { ...where, status: 'running' }
      });

      // Task statistics
      const totalTasks = await Task.count({ where });
      const completedTasks = await Task.count({
        where: { ...where, status: 'completed' }
      });
      const pendingTasks = await Task.count({
        where: { ...where, status: 'pending' }
      });

      // Workflow performance
      const workflowStats = await WorkflowInstance.findAll({
        attributes: [
          'workflowId',
          [require('sequelize').fn('COUNT', require('sequelize').col('WorkflowInstance.id')), 'count']
        ],
        where,
        group: ['workflowId'],
        include: [
          { model: Workflow, as: 'workflow', attributes: ['name'] }
        ]
      });

      res.json({
        success: true,
        data: {
          instances: {
            total: totalInstances,
            completed: completedInstances,
            failed: failedInstances,
            running: runningInstances
          },
          tasks: {
            total: totalTasks,
            completed: completedTasks,
            pending: pendingTasks
          },
          workflowPerformance: workflowStats
        }
      });
    } catch (error) {
      logger.error('Error getting workflow analytics:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get instance history
   */
  async getInstanceHistory(req, res) {
    try {
      const { instanceId } = req.params;

      const history = await WorkflowHistory.findAll({
        where: { instanceId },
        include: [
          { model: User, as: 'user', attributes: ['id', 'username', 'email'] }
        ],
        order: [['timestamp', 'ASC']]
      });

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      logger.error('Error getting instance history:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get system statistics
   */
  async getSystemStatistics(req, res) {
    try {
      const statistics = {
        workflows: await Workflow.count(),
        activeWorkflows: await Workflow.count({ where: { isActive: true } }),
        totalInstances: await WorkflowInstance.count(),
        runningInstances: await WorkflowInstance.count({ where: { status: 'running' } }),
        totalTasks: await Task.count(),
        pendingTasks: await Task.count({ where: { status: 'pending' } }),
        users: await User.count()
      };

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error('Error getting system statistics:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(req, res) {
    try {
      const users = await User.findAll({
        attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'role', 'isActive'],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      logger.error('Error getting all users:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new AdminController();
