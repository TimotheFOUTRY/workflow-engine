const winston = require('winston');
const { WorkflowInstance, Task, WorkflowHistory, Workflow } = require('../models');
const queueService = require('./queueService');
const { v4: uuidv4 } = require('uuid');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

/**
 * Workflow Engine - Core execution logic
 * Implements a state machine for workflow execution
 */
class WorkflowEngine {
  /**
   * Start a new workflow instance
   */
  async startWorkflow(workflowId, initialData = {}, startedBy = null) {
    try {
      const workflow = await Workflow.findByPk(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      if (!workflow.isActive) {
        throw new Error(`Workflow ${workflowId} is not active`);
      }

      // Create workflow instance
      const instance = await WorkflowInstance.create({
        workflowId,
        status: 'running',
        currentStep: 'start',
        instanceData: initialData,
        startedBy,
        startedAt: new Date()
      });

      // Log history
      await WorkflowHistory.create({
        instanceId: instance.id,
        stepName: 'start',
        action: 'workflow_started',
        userId: startedBy,
        data: { initialData }
      });

      // Publish event
      await queueService.publishWorkflowEvent({
        type: 'workflow.started',
        instanceId: instance.id,
        workflowId,
        data: initialData
      });

      logger.info(`Workflow instance ${instance.id} started`);

      // Execute first step
      await this.executeNextStep(instance.id);

      return instance;
    } catch (error) {
      logger.error('Error starting workflow:', error);
      throw error;
    }
  }

  /**
   * Execute the next step in the workflow
   */
  async executeNextStep(instanceId) {
    try {
      const instance = await WorkflowInstance.findByPk(instanceId, {
        include: [{ model: Workflow, as: 'workflow' }]
      });

      if (!instance) {
        throw new Error(`Workflow instance ${instanceId} not found`);
      }

      if (instance.status !== 'running') {
        logger.info(`Instance ${instanceId} is not running, status: ${instance.status}`);
        return;
      }

      const definition = instance.workflow.definition;
      
      // Support both ReactFlow format (nodes/edges) and legacy format (steps/transitions)
      if (definition.nodes && definition.edges) {
        await this.executeNextNode(instance, definition);
      } else if (definition.steps && definition.transitions) {
        await this.executeNextStepLegacy(instance, definition);
      } else {
        throw new Error('Invalid workflow definition format');
      }
    } catch (error) {
      logger.error(`Error executing step for instance ${instanceId}:`, error);
      await this.failWorkflow(instanceId, error.message);
      throw error;
    }
  }

  /**
   * Execute next node in ReactFlow format
   */
  async executeNextNode(instance, definition) {
    const currentNodeId = instance.currentStep;
    const currentNode = definition.nodes.find(n => n.id === currentNodeId);

    if (!currentNode) {
      await this.completeWorkflow(instance.id);
      return;
    }

    logger.info(`Executing node ${currentNode.id} (${currentNode.type}) for instance ${instance.id}`);

    // Publish node execution started event
    await queueService.publishWorkflowEvent({
      type: 'workflow.node.started',
      instanceId: instance.id,
      workflowId: instance.workflowId,
      nodeId: currentNode.id,
      nodeType: currentNode.type
    });

    // Execute node based on type
    switch (currentNode.type) {
      case 'start':
        await this.processStartNode(instance, currentNode, definition);
        break;
      case 'variable':
        await this.processVariableNode(instance, currentNode, definition);
        break;
      case 'form':
        await this.processFormNode(instance, currentNode, definition);
        break;
      case 'task':
        await this.processTaskNode(instance, currentNode, definition);
        break;
      case 'approval':
        await this.processApprovalNode(instance, currentNode, definition);
        break;
      case 'condition':
        await this.processConditionNode(instance, currentNode, definition);
        break;
      case 'timer':
        await this.processTimerNode(instance, currentNode, definition);
        break;
      case 'notification':
      case 'email':
      case 'sms':
        await this.processNotificationNode(instance, currentNode, definition);
        break;
      case 'end':
        await this.completeWorkflow(instance.id);
        break;
      default:
        logger.warn(`Unknown node type: ${currentNode.type}, moving to next`);
        await this.moveToNextNode(instance, currentNode, definition);
    }
  }

  /**
   * Legacy method for old workflow format
   */
  async executeNextStepLegacy(instance, definition) {
    const currentStep = definition.steps.find(s => s.id === instance.currentStep);

    if (!currentStep) {
      await this.completeWorkflow(instance.id);
      return;
    }

    logger.info(`Executing step ${currentStep.id} for instance ${instance.id}`);

      // Execute step based on type
      switch (currentStep.type) {
        case 'start':
          await this.processStartStep(instance, currentStep, definition);
          break;
        case 'task':
          await this.processTaskStep(instance, currentStep, definition);
          break;
        case 'approval':
          await this.processApprovalStep(instance, currentStep, definition);
          break;
        case 'condition':
          await this.processConditionStep(instance, currentStep, definition);
          break;
        case 'timer':
          await this.processTimerStep(instance, currentStep, definition);
          break;
        case 'end':
          await this.completeWorkflow(instanceId);
          break;
        default:
          logger.warn(`Unknown step type: ${currentStep.type}`);
          await this.moveToNextStep(instance, currentStep, definition);
      }
    } catch (error) {
      logger.error(`Error executing step for instance ${instanceId}:`, error);
      await this.failWorkflow(instanceId, error.message);
      throw error;
    }
  }

  /**
   * Process start step
   */
  async processStartStep(instance, step, definition) {
    await WorkflowHistory.create({
      instanceId: instance.id,
      stepName: step.id,
      action: 'step_completed',
      data: step
    });

    await this.moveToNextStep(instance, step, definition);
  }

  /**
   * Process task step - creates a user task
   */
  async processTaskStep(instance, step, definition) {
    const task = await Task.create({
      instanceId: instance.id,
      taskType: 'task',
      assignedTo: step.config?.assignedTo || null,
      formId: step.config?.formId || null,
      status: 'pending',
      priority: step.config?.priority || 'medium',
      dueDate: step.config?.dueDate || null,
      taskData: {
        stepId: step.id,
        stepName: step.name,
        instructions: step.config?.instructions || ''
      }
    });

    await WorkflowHistory.create({
      instanceId: instance.id,
      stepName: step.id,
      action: 'task_created',
      data: { taskId: task.id }
    });

    // Publish task created event
    await queueService.publishTaskEvent({
      type: 'task.created',
      taskId: task.id,
      instanceId: instance.id,
      assignedTo: task.assignedTo
    });

    logger.info(`Task ${task.id} created for instance ${instance.id}`);
    // Task step waits for completion, don't move to next step yet
  }

  /**
   * Process approval step - creates an approval task
   */
  async processApprovalStep(instance, step, definition) {
    const approvers = step.config?.approvers || [];
    const approvalType = step.config?.approvalType || 'sequential'; // sequential or parallel

    if (approvalType === 'parallel') {
      // Create tasks for all approvers
      for (const approverId of approvers) {
        await Task.create({
          instanceId: instance.id,
          taskType: 'approval',
          assignedTo: approverId,
          status: 'pending',
          priority: step.config?.priority || 'high',
          taskData: {
            stepId: step.id,
            stepName: step.name,
            approvalType: 'parallel'
          }
        });
      }
    } else {
      // Sequential approval - create first task only
      await Task.create({
        instanceId: instance.id,
        taskType: 'approval',
        assignedTo: approvers[0],
        status: 'pending',
        priority: step.config?.priority || 'high',
        taskData: {
          stepId: step.id,
          stepName: step.name,
          approvalType: 'sequential',
          approvers,
          currentApproverIndex: 0
        }
      });
    }

    await WorkflowHistory.create({
      instanceId: instance.id,
      stepName: step.id,
      action: 'approval_step_started',
      data: { approvers, approvalType }
    });

    logger.info(`Approval step ${step.id} started for instance ${instance.id}`);
  }

  /**
   * Process condition step - evaluates condition and branches
   */
  async processConditionStep(instance, step, definition) {
    const condition = step.config?.condition || {};
    const result = this.evaluateCondition(condition, instance.instanceData);

    await WorkflowHistory.create({
      instanceId: instance.id,
      stepName: step.id,
      action: 'condition_evaluated',
      data: { condition, result }
    });

    // Find the transition based on condition result
    const transition = definition.transitions?.find(t => 
      t.from === step.id && t.condition === result
    );

    if (transition) {
      await instance.update({ currentStep: transition.to });
      await this.executeNextStep(instance.id);
    } else {
      // No matching transition, try default
      const defaultTransition = definition.transitions?.find(t => 
        t.from === step.id && t.condition === 'default'
      );
      if (defaultTransition) {
        await instance.update({ currentStep: defaultTransition.to });
        await this.executeNextStep(instance.id);
      } else {
        throw new Error(`No transition found for condition result: ${result}`);
      }
    }
  }

  /**
   * Process timer step - schedules next execution
   */
  async processTimerStep(instance, step, definition) {
    const delay = step.config?.delay || 0; // in milliseconds

    await WorkflowHistory.create({
      instanceId: instance.id,
      stepName: step.id,
      action: 'timer_started',
      data: { delay }
    });

    // In a real system, use a job scheduler
    setTimeout(async () => {
      await this.moveToNextStep(instance, step, definition);
    }, delay);
  }

  /**
   * Evaluate condition based on instance data
   */
  evaluateCondition(condition, instanceData) {
    try {
      const { field, operator, value } = condition;
      const fieldValue = this.getNestedValue(instanceData, field);

      switch (operator) {
        case 'equals':
          return fieldValue === value ? 'true' : 'false';
        case 'notEquals':
          return fieldValue !== value ? 'true' : 'false';
        case 'greaterThan':
          return fieldValue > value ? 'true' : 'false';
        case 'lessThan':
          return fieldValue < value ? 'true' : 'false';
        case 'contains':
          return String(fieldValue).includes(value) ? 'true' : 'false';
        default:
          return 'false';
      }
    } catch (error) {
      logger.error('Error evaluating condition:', error);
      return 'false';
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Move to next step in workflow
   */
  async moveToNextStep(instance, currentStep, definition) {
    const transition = definition.transitions?.find(t => t.from === currentStep.id);
    
    if (transition) {
      await instance.update({ currentStep: transition.to });
      await this.executeNextStep(instance.id);
    } else {
      // No transition means end of workflow
      await this.completeWorkflow(instance.id);
    }
  }

  /**
   * Complete task and continue workflow
   */
  async completeTask(taskId, userId, decision = null, taskData = {}) {
    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        throw new Error(`Task ${taskId} not found`);
      }

      const instance = await WorkflowInstance.findByPk(task.instanceId, {
        include: [{ model: Workflow, as: 'workflow' }]
      });

      // Update task
      await task.update({
        status: decision === 'rejected' ? 'rejected' : 'completed',
        completedAt: new Date(),
        decision,
        taskData: { ...task.taskData, ...taskData }
      });

      // Update instance data with task results
      await instance.update({
        instanceData: {
          ...instance.instanceData,
          [task.taskData.stepId]: {
            decision,
            taskData,
            completedBy: userId,
            completedAt: new Date()
          }
        }
      });

      await WorkflowHistory.create({
        instanceId: instance.id,
        stepName: task.taskData.stepId,
        action: decision === 'rejected' ? 'task_rejected' : 'task_completed',
        userId,
        data: { taskId, decision, taskData }
      });

      // Publish event
      await queueService.publishTaskEvent({
        type: 'task.completed',
        taskId: task.id,
        instanceId: instance.id,
        decision
      });

      // Handle sequential approvals
      if (task.taskType === 'approval' && task.taskData.approvalType === 'sequential') {
        const approvers = task.taskData.approvers;
        const currentIndex = task.taskData.currentApproverIndex;
        
        if (decision === 'rejected') {
          // Approval rejected, fail or go to rejection path
          logger.info(`Approval rejected by user ${userId}`);
          // Continue to next step (could be rejection handling)
        } else if (currentIndex < approvers.length - 1) {
          // Create next approval task
          await Task.create({
            instanceId: instance.id,
            taskType: 'approval',
            assignedTo: approvers[currentIndex + 1],
            status: 'pending',
            priority: task.priority,
            taskData: {
              ...task.taskData,
              currentApproverIndex: currentIndex + 1
            }
          });
          return; // Don't move to next step yet
        }
      }

      // Check if all parallel approvals are complete
      if (task.taskType === 'approval' && task.taskData.approvalType === 'parallel') {
        const pendingTasks = await Task.count({
          where: {
            instanceId: instance.id,
            taskType: 'approval',
            'taskData.stepId': task.taskData.stepId,
            status: 'pending'
          }
        });

        if (pendingTasks > 0) {
          return; // Wait for other approvals
        }
      }

      // Move to next step
      const definition = instance.workflow.definition;
      const currentStep = definition.steps.find(s => s.id === task.taskData.stepId);
      
      if (currentStep) {
        await this.moveToNextStep(instance, currentStep, definition);
      }

      logger.info(`Task ${taskId} completed, workflow ${instance.id} continuing`);
      return task;
    } catch (error) {
      logger.error('Error completing task:', error);
      throw error;
    }
  }

  /**
   * Complete workflow instance
   */
  async completeWorkflow(instanceId) {
    try {
      const instance = await WorkflowInstance.findByPk(instanceId);
      
      await instance.update({
        status: 'completed',
        completedAt: new Date()
      });

      await WorkflowHistory.create({
        instanceId,
        stepName: 'end',
        action: 'workflow_completed',
        data: {}
      });

      await queueService.publishWorkflowEvent({
        type: 'workflow.completed',
        instanceId,
        workflowId: instance.workflowId
      });

      logger.info(`Workflow instance ${instanceId} completed`);
    } catch (error) {
      logger.error('Error completing workflow:', error);
      throw error;
    }
  }

  /**
   * Fail workflow instance
   */
  async failWorkflow(instanceId, errorMessage) {
    try {
      const instance = await WorkflowInstance.findByPk(instanceId);
      
      await instance.update({
        status: 'failed',
        error: errorMessage,
        completedAt: new Date()
      });

      await WorkflowHistory.create({
        instanceId,
        stepName: instance.currentStep || 'unknown',
        action: 'workflow_failed',
        data: { error: errorMessage }
      });

      await queueService.publishWorkflowEvent({
        type: 'workflow.failed',
        instanceId,
        workflowId: instance.workflowId,
        error: errorMessage
      });

      logger.error(`Workflow instance ${instanceId} failed: ${errorMessage}`);
    } catch (error) {
      logger.error('Error failing workflow:', error);
    }
  }

  /**
   * Cancel workflow instance
   */
  async cancelWorkflow(instanceId, userId) {
    try {
      const instance = await WorkflowInstance.findByPk(instanceId);
      
      await instance.update({
        status: 'cancelled',
        completedAt: new Date()
      });

      // Cancel pending tasks
      await Task.update(
        { status: 'cancelled' },
        {
          where: {
            instanceId,
            status: 'pending'
          }
        }
      );

      await WorkflowHistory.create({
        instanceId,
        stepName: instance.currentStep || 'unknown',
        action: 'workflow_cancelled',
        userId,
        data: {}
      });

      logger.info(`Workflow instance ${instanceId} cancelled by user ${userId}`);
    } catch (error) {
      logger.error('Error cancelling workflow:', error);
      throw error;
    }
  }
}

module.exports = new WorkflowEngine();
