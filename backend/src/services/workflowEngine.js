const winston = require('winston');
const { WorkflowInstance, Task, WorkflowHistory, Workflow, Notification } = require('../models');
const queueService = require('./queueService');
const { v4: uuidv4 } = require('uuid');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

/**
 * Workflow Engine - Core execution logic with ReactFlow support
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

      const definition = workflow.definition;
      let firstNodeId = 'start';

      // Find start node in ReactFlow format
      if (definition.nodes && definition.edges) {
        const startNode = definition.nodes.find(n => n.type === 'start');
        if (startNode) {
          firstNodeId = startNode.id;
        }
      }

      // Create workflow instance
      const instance = await WorkflowInstance.create({
        workflowId,
        status: 'running',
        currentStep: firstNodeId,
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
   * Process start node
   */
  async processStartNode(instance, node, definition) {
    await WorkflowHistory.create({
      instanceId: instance.id,
      stepName: node.data?.label || node.id,
      action: 'node_executed',
      data: { nodeId: node.id, nodeType: node.type }
    });

    await queueService.publishWorkflowEvent({
      type: 'workflow.node.completed',
      instanceId: instance.id,
      workflowId: instance.workflowId,
      nodeId: node.id,
      nodeType: node.type
    });

    await this.moveToNextNode(instance, node, definition);
  }

  /**
   * Process variable node - stores data in instance
   */
  async processVariableNode(instance, node, definition) {
    const variableData = node.data?.config || {};
    
    await instance.update({
      instanceData: {
        ...instance.instanceData,
        [node.id]: variableData
      }
    });

    await WorkflowHistory.create({
      instanceId: instance.id,
      stepName: node.data?.label || node.id,
      action: 'variable_set',
      data: { nodeId: node.id, variableData }
    });

    await queueService.publishWorkflowEvent({
      type: 'workflow.node.completed',
      instanceId: instance.id,
      workflowId: instance.workflowId,
      nodeId: node.id,
      nodeType: node.type,
      variableData
    });

    await this.moveToNextNode(instance, node, definition);
  }

  /**
   * Process form node - creates a task with form
   */
  async processFormNode(instance, node, definition) {
    const config = node.data?.config || {};
    let assignedTo = config.assignedTo;
    const formId = config.formId;
    
    // Handle assignedTo format - could be UUID, array of UUIDs, or array of user objects
    if (!assignedTo) {
      logger.warn(`Form node ${node.id} has no assignedTo, skipping task creation`);
      await this.moveToNextNode(instance, node, definition);
      return;
    }

    // Extract UUIDs from various formats
    let assignees = [];
    
    logger.info(`assignedTo received: ${JSON.stringify(assignedTo)} (type: ${typeof assignedTo})`);
    
    // First, try to parse if it's a JSON string
    let parsedAssignedTo = assignedTo;
    if (typeof assignedTo === 'string') {
      try {
        parsedAssignedTo = JSON.parse(assignedTo);
        logger.info(`Parsed assignedTo: ${JSON.stringify(parsedAssignedTo)}`);
      } catch (e) {
        // Not JSON, treat as simple UUID string
        parsedAssignedTo = assignedTo;
      }
    }
    
    if (typeof parsedAssignedTo === 'string') {
      // Simple UUID string
      assignees = [parsedAssignedTo];
    } else if (Array.isArray(parsedAssignedTo)) {
      // Array of UUIDs or array of objects
      assignees = parsedAssignedTo.map(item => {
        if (typeof item === 'string') {
          return item;
        } else if (item && typeof item === 'object') {
          // Extract UUID from object (format: {id: "user:UUID", ...} or {id: "UUID", ...})
          const id = item.id || item.value;
          if (id && id.includes(':')) {
            // Format like "user:UUID"
            return id.split(':')[1];
          }
          return id;
        }
        return null;
      }).filter(id => id); // Remove nulls
    } else if (typeof parsedAssignedTo === 'object') {
      // Single object
      const id = parsedAssignedTo.id || parsedAssignedTo.value;
      if (id && id.includes(':')) {
        assignees = [id.split(':')[1]];
      } else {
        assignees = [id];
      }
    }

    if (assignees.length === 0) {
      logger.warn(`Form node ${node.id} has invalid assignedTo format, skipping task creation`);
      await this.moveToNextNode(instance, node, definition);
      return;
    }

    logger.info(`Extracted assignees: ${JSON.stringify(assignees)}`);

    for (const userId of assignees) {
      logger.info(`Creating task for userId: ${userId} (type: ${typeof userId})`);
      const task = await Task.create({
        instanceId: instance.id,
        taskType: 'form',
        assignedTo: userId,
        formId: formId || null,
        status: 'pending',
        priority: config.priority || 'medium',
        dueDate: config.dueDate || null,
        taskData: {
          nodeId: node.id,
          nodeName: node.data?.label || 'Formulaire',
          formFields: config.formFields || [],
          instructions: config.instructions || ''
        }
      });

      // Create notification for assigned user
      await Notification.create({
        userId: userId,
        type: 'task_assigned',
        title: 'Nouvelle tâche assignée',
        message: `Vous avez une nouvelle tâche: ${node.data?.label || 'Formulaire'}`,
        data: {
          taskId: task.id,
          instanceId: instance.id,
          nodeId: node.id,
          workflowId: instance.workflowId
        }
      });

      // Publish task created event
      await queueService.publishTaskEvent({
        type: 'task.created',
        taskId: task.id,
        instanceId: instance.id,
        assignedTo: userId,
        nodeId: node.id
      });

      logger.info(`Task ${task.id} created for user ${userId}, node ${node.id}`);
    }

    await WorkflowHistory.create({
      instanceId: instance.id,
      stepName: node.data?.label || node.id,
      action: 'form_task_created',
      data: { nodeId: node.id, assignees, formId }
    });

    await queueService.publishWorkflowEvent({
      type: 'workflow.node.completed',
      instanceId: instance.id,
      workflowId: instance.workflowId,
      nodeId: node.id,
      nodeType: node.type
    });

    // Node waits for form completion, don't move to next node yet
  }

  /**
   * Process task node
   */
  async processTaskNode(instance, node, definition) {
    const config = node.data?.config || {};
    
    // Extract UUID from assignedTo (could be string or object)
    let assignedToId = null;
    if (config.assignedTo) {
      if (typeof config.assignedTo === 'string') {
        assignedToId = config.assignedTo;
      } else if (typeof config.assignedTo === 'object') {
        const id = config.assignedTo.id || config.assignedTo.value;
        assignedToId = id && id.includes(':') ? id.split(':')[1] : id;
      }
    }
    
    const task = await Task.create({
      instanceId: instance.id,
      taskType: 'task',
      assignedTo: assignedToId,
      formId: config.formId || null,
      status: 'pending',
      priority: config.priority || 'medium',
      dueDate: config.dueDate || null,
      taskData: {
        nodeId: node.id,
        nodeName: node.data?.label || 'Tâche',
        instructions: config.instructions || ''
      }
    });

    // Create notification
    if (assignedToId) {
      await Notification.create({
        userId: assignedToId,
        type: 'task_assigned',
        title: 'Nouvelle tâche assignée',
        message: `Vous avez une nouvelle tâche: ${node.data?.label || 'Tâche'}`,
        data: {
          taskId: task.id,
          instanceId: instance.id,
          nodeId: node.id
        }
      });
    }

    await WorkflowHistory.create({
      instanceId: instance.id,
      stepName: node.data?.label || node.id,
      action: 'task_created',
      data: { nodeId: node.id, taskId: task.id }
    });

    await queueService.publishTaskEvent({
      type: 'task.created',
      taskId: task.id,
      instanceId: instance.id,
      assignedTo: task.assignedTo
    });

    logger.info(`Task ${task.id} created for instance ${instance.id}`);
  }

  /**
   * Process approval node
   */
  async processApprovalNode(instance, node, definition) {
    const config = node.data?.config || {};
    let approvers = config.approvers || [];
    
    // Extract UUIDs from approvers (could be array of strings or objects)
    approvers = approvers.map(approver => {
      if (typeof approver === 'string') {
        return approver;
      } else if (approver && typeof approver === 'object') {
        const id = approver.id || approver.value;
        return id && id.includes(':') ? id.split(':')[1] : id;
      }
      return null;
    }).filter(id => id);
    const approvalType = config.approvalType || 'sequential';

    if (approvalType === 'parallel') {
      for (const approverId of approvers) {
        const task = await Task.create({
          instanceId: instance.id,
          taskType: 'approval',
          assignedTo: approverId,
          status: 'pending',
          priority: config.priority || 'high',
          taskData: {
            nodeId: node.id,
            nodeName: node.data?.label || 'Approbation',
            approvalType: 'parallel'
          }
        });

        await Notification.create({
          userId: approverId,
          type: 'approval_required',
          title: 'Approbation requise',
          message: `Une approbation est requise: ${node.data?.label || 'Approbation'}`,
          data: {
            taskId: task.id,
            instanceId: instance.id,
            nodeId: node.id
          }
        });
      }
    } else {
      // Sequential - create first task only
      const task = await Task.create({
        instanceId: instance.id,
        taskType: 'approval',
        assignedTo: approvers[0],
        status: 'pending',
        priority: config.priority || 'high',
        taskData: {
          nodeId: node.id,
          nodeName: node.data?.label || 'Approbation',
          approvalType: 'sequential',
          approvers,
          currentApproverIndex: 0
        }
      });

      await Notification.create({
        userId: approvers[0],
        type: 'approval_required',
        title: 'Approbation requise',
        message: `Une approbation est requise: ${node.data?.label || 'Approbation'}`,
        data: {
          taskId: task.id,
          instanceId: instance.id,
          nodeId: node.id
        }
      });
    }

    await WorkflowHistory.create({
      instanceId: instance.id,
      stepName: node.data?.label || node.id,
      action: 'approval_started',
      data: { nodeId: node.id, approvers, approvalType }
    });

    logger.info(`Approval node ${node.id} started for instance ${instance.id}`);
  }

  /**
   * Process condition node
   */
  async processConditionNode(instance, node, definition) {
    const condition = node.data?.config?.condition || {};
    const result = this.evaluateCondition(condition, instance.instanceData);

    await WorkflowHistory.create({
      instanceId: instance.id,
      stepName: node.data?.label || node.id,
      action: 'condition_evaluated',
      data: { nodeId: node.id, condition, result }
    });

    await queueService.publishWorkflowEvent({
      type: 'workflow.node.completed',
      instanceId: instance.id,
      workflowId: instance.workflowId,
      nodeId: node.id,
      nodeType: node.type,
      conditionResult: result
    });

    // Find edge based on condition result
    const outgoingEdge = definition.edges.find(e => 
      e.source === node.id && (!e.label || e.label === result || e.label === 'default')
    );

    if (outgoingEdge) {
      await instance.update({ currentStep: outgoingEdge.target });
      await this.executeNextStep(instance.id);
    } else {
      throw new Error(`No edge found for condition result: ${result}`);
    }
  }

  /**
   * Process timer node
   */
  async processTimerNode(instance, node, definition) {
    const delay = node.data?.config?.delay || 0;

    await WorkflowHistory.create({
      instanceId: instance.id,
      stepName: node.data?.label || node.id,
      action: 'timer_started',
      data: { nodeId: node.id, delay }
    });

    setTimeout(async () => {
      await this.moveToNextNode(instance, node, definition);
    }, delay);
  }

  /**
   * Process notification node (email, SMS, notification)
   */
  async processNotificationNode(instance, node, definition) {
    const config = node.data?.config || {};
    
    // Send notification to specified users
    const recipients = config.recipients || [];
    for (const userId of recipients) {
      await Notification.create({
        userId: userId,
        type: node.type,
        title: config.title || 'Notification',
        message: config.message || '',
        data: {
          instanceId: instance.id,
          nodeId: node.id,
          workflowId: instance.workflowId
        }
      });
    }

    await WorkflowHistory.create({
      instanceId: instance.id,
      stepName: node.data?.label || node.id,
      action: 'notification_sent',
      data: { nodeId: node.id, notificationType: node.type, recipients }
    });

    await queueService.publishWorkflowEvent({
      type: 'workflow.node.completed',
      instanceId: instance.id,
      workflowId: instance.workflowId,
      nodeId: node.id,
      nodeType: node.type
    });

    await this.moveToNextNode(instance, node, definition);
  }

  /**
   * Move to next node in ReactFlow graph
   */
  async moveToNextNode(instance, currentNode, definition) {
    // Find outgoing edge from current node
    const outgoingEdge = definition.edges.find(e => e.source === currentNode.id);
    
    if (outgoingEdge) {
      await instance.update({ currentStep: outgoingEdge.target });
      await this.executeNextStep(instance.id);
    } else {
      // No outgoing edge means workflow completed
      await this.completeWorkflow(instance.id);
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

    switch (currentStep.type) {
      case 'start':
        await this.processStartStepLegacy(instance, currentStep, definition);
        break;
      case 'task':
        await this.processTaskStepLegacy(instance, currentStep, definition);
        break;
      case 'approval':
        await this.processApprovalStepLegacy(instance, currentStep, definition);
        break;
      case 'condition':
        await this.processConditionStepLegacy(instance, currentStep, definition);
        break;
      case 'timer':
        await this.processTimerStepLegacy(instance, currentStep, definition);
        break;
      case 'end':
        await this.completeWorkflow(instance.id);
        break;
      default:
        logger.warn(`Unknown step type: ${currentStep.type}`);
        await this.moveToNextStepLegacy(instance, currentStep, definition);
    }
  }

  async processStartStepLegacy(instance, step, definition) {
    await WorkflowHistory.create({
      instanceId: instance.id,
      stepName: step.id,
      action: 'step_completed',
      data: step
    });
    await this.moveToNextStepLegacy(instance, step, definition);
  }

  async processTaskStepLegacy(instance, step, definition) {
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

    await queueService.publishTaskEvent({
      type: 'task.created',
      taskId: task.id,
      instanceId: instance.id,
      assignedTo: task.assignedTo
    });

    logger.info(`Task ${task.id} created for instance ${instance.id}`);
  }

  async processApprovalStepLegacy(instance, step, definition) {
    // Similar to processApprovalNode
    const approvers = step.config?.approvers || [];
    const approvalType = step.config?.approvalType || 'sequential';

    if (approvalType === 'parallel') {
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

  async processConditionStepLegacy(instance, step, definition) {
    const condition = step.config?.condition || {};
    const result = this.evaluateCondition(condition, instance.instanceData);

    await WorkflowHistory.create({
      instanceId: instance.id,
      stepName: step.id,
      action: 'condition_evaluated',
      data: { condition, result }
    });

    const transition = definition.transitions?.find(t => 
      t.from === step.id && t.condition === result
    );

    if (transition) {
      await instance.update({ currentStep: transition.to });
      await this.executeNextStep(instance.id);
    } else {
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

  async processTimerStepLegacy(instance, step, definition) {
    const delay = step.config?.delay || 0;

    await WorkflowHistory.create({
      instanceId: instance.id,
      stepName: step.id,
      action: 'timer_started',
      data: { delay }
    });

    setTimeout(async () => {
      await this.moveToNextStepLegacy(instance, step, definition);
    }, delay);
  }

  async moveToNextStepLegacy(instance, currentStep, definition) {
    const transition = definition.transitions?.find(t => t.from === currentStep.id);
    
    if (transition) {
      await instance.update({ currentStep: transition.to });
      await this.executeNextStep(instance.id);
    } else {
      await this.completeWorkflow(instance.id);
    }
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
          [task.taskData.nodeId || task.taskData.stepId]: {
            decision,
            taskData,
            completedBy: userId,
            completedAt: new Date()
          }
        }
      });

      await WorkflowHistory.create({
        instanceId: instance.id,
        stepName: task.taskData.nodeName || task.taskData.stepName || 'task',
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

      // Notify subscribers about task completion
      await this.notifySubscribers(instance.id, {
        type: 'task_completed',
        taskId,
        nodeName: task.taskData.nodeName || task.taskData.stepName,
        completedBy: userId
      });

      // Handle sequential approvals
      if (task.taskType === 'approval' && task.taskData.approvalType === 'sequential') {
        const approvers = task.taskData.approvers;
        const currentIndex = task.taskData.currentApproverIndex;
        
        if (decision === 'rejected') {
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
            status: 'pending'
          }
        });

        if (pendingTasks > 0) {
          return; // Wait for other approvals
        }
      }

      // Move to next step/node
      const definition = instance.workflow.definition;
      const nodeId = task.taskData.nodeId || task.taskData.stepId;
      
      if (definition.nodes && definition.edges) {
        // ReactFlow format
        const currentNode = definition.nodes.find(n => n.id === nodeId);
        if (currentNode) {
          await this.moveToNextNode(instance, currentNode, definition);
        }
      } else if (definition.steps && definition.transitions) {
        // Legacy format
        const currentStep = definition.steps.find(s => s.id === nodeId);
        if (currentStep) {
          await this.moveToNextStepLegacy(instance, currentStep, definition);
        }
      }

      logger.info(`Task ${taskId} completed, workflow ${instance.id} continuing`);
      return task;
    } catch (error) {
      logger.error('Error completing task:', error);
      throw error;
    }
  }

  /**
   * Notify subscribers about workflow changes
   */
  async notifySubscribers(instanceId, changeData) {
    try {
      const { WorkflowSubscription } = require('../models');
      const subscriptions = await WorkflowSubscription.findAll({
        where: { instanceId }
      });

      for (const sub of subscriptions) {
        await Notification.create({
          userId: sub.userId,
          type: 'workflow_update',
          title: 'Mise à jour du workflow',
          message: this.formatSubscriptionMessage(changeData),
          data: {
            instanceId,
            subscriptionId: sub.id,
            ...changeData
          }
        });
      }

      await queueService.publishWorkflowEvent({
        type: 'workflow.subscription.notified',
        instanceId,
        subscribersCount: subscriptions.length,
        changeData
      });
    } catch (error) {
      logger.error('Error notifying subscribers:', error);
    }
  }

  formatSubscriptionMessage(changeData) {
    switch (changeData.type) {
      case 'task_completed':
        return `Tâche "${changeData.nodeName}" complétée`;
      case 'node_started':
        return `Étape "${changeData.nodeName}" démarrée`;
      case 'node_completed':
        return `Étape "${changeData.nodeName}" terminée`;
      case 'workflow_completed':
        return 'Workflow terminé';
      case 'workflow_failed':
        return 'Workflow en erreur';
      default:
        return 'Mise à jour du workflow';
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

      // Notify subscribers
      await this.notifySubscribers(instanceId, {
        type: 'workflow_completed'
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

      // Notify subscribers
      await this.notifySubscribers(instanceId, {
        type: 'workflow_failed',
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

      await queueService.publishWorkflowEvent({
        type: 'workflow.cancelled',
        instanceId,
        workflowId: instance.workflowId,
        cancelledBy: userId
      });

      logger.info(`Workflow instance ${instanceId} cancelled by user ${userId}`);
    } catch (error) {
      logger.error('Error cancelling workflow:', error);
      throw error;
    }
  }
}

module.exports = new WorkflowEngine();
