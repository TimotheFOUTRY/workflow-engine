const winston = require('winston');
const { Workflow, WorkflowInstance } = require('../models');
const workflowEngine = require('../services/workflowEngine');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

class WorkflowController {
  /**
   * Create a new workflow
   */
  async createWorkflow(req, res) {
    try {
      const { name, description, definition } = req.body;
      
      const workflow = await Workflow.create({
        name,
        description,
        definition,
        createdBy: req.user?.id || null
      });

      res.status(201).json({
        success: true,
        data: workflow
      });
    } catch (error) {
      logger.error('Error creating workflow:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get all workflows
   */
  async getAllWorkflows(req, res) {
    try {
      const { isActive } = req.query;
      const where = {};
      
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const workflows = await Workflow.findAll({
        where,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: workflows
      });
    } catch (error) {
      logger.error('Error getting workflows:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(req, res) {
    try {
      const { id } = req.params;
      
      const workflow = await Workflow.findByPk(id);
      
      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found'
        });
      }

      res.json({
        success: true,
        data: workflow
      });
    } catch (error) {
      logger.error('Error getting workflow:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update workflow
   */
  async updateWorkflow(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const workflow = await Workflow.findByPk(id);
      
      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found'
        });
      }

      await workflow.update(updates);

      res.json({
        success: true,
        data: workflow
      });
    } catch (error) {
      logger.error('Error updating workflow:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(req, res) {
    try {
      const { id } = req.params;
      
      const workflow = await Workflow.findByPk(id);
      
      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found'
        });
      }

      await workflow.destroy();

      res.json({
        success: true,
        message: 'Workflow deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting workflow:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Start a workflow instance
   */
  async startWorkflowInstance(req, res) {
    try {
      const { id } = req.params;
      const { data } = req.body;
      
      const instance = await workflowEngine.startWorkflow(
        id,
        data || {},
        req.user?.id || null
      );

      res.status(201).json({
        success: true,
        data: instance
      });
    } catch (error) {
      logger.error('Error starting workflow instance:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get workflow instances
   */
  async getWorkflowInstances(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.query;
      
      const where = { workflowId: id };
      if (status) {
        where.status = status;
      }

      const instances = await WorkflowInstance.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: 100
      });

      res.json({
        success: true,
        data: instances
      });
    } catch (error) {
      logger.error('Error getting workflow instances:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get specific workflow instance
   */
  async getWorkflowInstance(req, res) {
    try {
      const { instanceId } = req.params;
      
      const instance = await WorkflowInstance.findByPk(instanceId, {
        include: [
          { model: Workflow, as: 'workflow' }
        ]
      });
      
      if (!instance) {
        return res.status(404).json({
          success: false,
          error: 'Workflow instance not found'
        });
      }

      res.json({
        success: true,
        data: instance
      });
    } catch (error) {
      logger.error('Error getting workflow instance:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Cancel workflow instance
   */
  async cancelWorkflowInstance(req, res) {
    try {
      const { instanceId } = req.params;
      
      await workflowEngine.cancelWorkflow(
        instanceId,
        req.user?.id || null
      );

      res.json({
        success: true,
        message: 'Workflow instance cancelled'
      });
    } catch (error) {
      logger.error('Error cancelling workflow instance:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new WorkflowController();
