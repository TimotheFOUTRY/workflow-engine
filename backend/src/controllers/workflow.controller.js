const winston = require('winston');
const { Workflow, WorkflowInstance, User, Group } = require('../models');
const workflowEngine = require('../services/workflowEngine');
const { Op } = require('sequelize');

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

  /**
   * Get accessible workflows for current user (for starting workflows)
   */
  async getAccessibleWorkflows(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      
      let where = {
        isActive: true
      };

      // Admin can see all workflows
      if (userRole === 'admin') {
        // Admin sees all active workflows
        const workflows = await Workflow.findAll({
          where,
          order: [['name', 'ASC']],
          attributes: ['id', 'name', 'description', 'isActive', 'isPublic', 'createdAt']
        });

        return res.json({
          success: true,
          data: workflows
        });
      }

      // For non-admin users, get user's groups
      const user = await User.findByPk(userId, {
        include: [{
          model: Group,
          as: 'groups',
          through: { attributes: [] }
        }]
      });
      
      const userGroupIds = user?.groups?.map(g => g.id) || [];

      // Build OR conditions
      const orConditions = [
        { isPublic: true },              // Public workflows
        { createdBy: userId },            // Workflows created by user
        {
          allowedUsers: {
            [Op.contains]: [userId]
          }
        }
      ];
      
      // Add group condition if user has groups
      if (userGroupIds.length > 0) {
        orConditions.push({
          allowedGroups: {
            [Op.overlap]: userGroupIds
          }
        });
      }

      where[Op.or] = orConditions;

      const workflows = await Workflow.findAll({
        where,
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'description', 'isActive', 'isPublic', 'createdAt']
      });

      res.json({
        success: true,
        data: workflows
      });
    } catch (error) {
      logger.error('Error getting accessible workflows:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update workflow permissions
   */
  async updateWorkflowPermissions(req, res) {
    try {
      const { id } = req.params;
      const { allowedUsers, allowedGroups, isPublic } = req.body;
      
      const workflow = await Workflow.findByPk(id);
      
      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found'
        });
      }

      // Check if user has permission to update (creator or admin)
      if (req.user.role !== 'admin' && workflow.createdBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to update this workflow'
        });
      }

      await workflow.update({
        allowedUsers: allowedUsers || [],
        allowedGroups: allowedGroups || [],
        isPublic: isPublic !== undefined ? isPublic : workflow.isPublic
      });

      res.json({
        success: true,
        data: workflow
      });
    } catch (error) {
      logger.error('Error updating workflow permissions:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Check if user can access workflow
   */
  async checkWorkflowAccess(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      const workflow = await Workflow.findByPk(id);
      
      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found'
        });
      }

      // Admin always has access
      if (userRole === 'admin') {
        return res.json({
          success: true,
          data: { hasAccess: true, reason: 'admin' }
        });
      }

      // Public workflow
      if (workflow.isPublic) {
        return res.json({
          success: true,
          data: { hasAccess: true, reason: 'public' }
        });
      }

      // Creator
      if (workflow.createdBy === userId) {
        return res.json({
          success: true,
          data: { hasAccess: true, reason: 'creator' }
        });
      }

      // Explicitly allowed user
      if (workflow.allowedUsers && workflow.allowedUsers.includes(userId)) {
        return res.json({
          success: true,
          data: { hasAccess: true, reason: 'allowed_user' }
        });
      }

      // Check group membership
      const user = await User.findByPk(userId, {
        include: [{
          model: require('../models').Group,
          as: 'groups',
          through: { attributes: [] }
        }]
      });
      
      const userGroupIds = user?.groups?.map(g => g.id) || [];
      const hasGroupAccess = workflow.allowedGroups && 
        workflow.allowedGroups.some(groupId => userGroupIds.includes(groupId));

      if (hasGroupAccess) {
        return res.json({
          success: true,
          data: { hasAccess: true, reason: 'allowed_group' }
        });
      }

      res.json({
        success: true,
        data: { hasAccess: false, reason: 'no_permission' }
      });
    } catch (error) {
      logger.error('Error checking workflow access:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new WorkflowController();
