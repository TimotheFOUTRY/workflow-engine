const express = require('express');
const router = express.Router();
const { WorkflowInstance, Workflow, WorkflowHistory, Task, WorkflowSubscription, User } = require('../models');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * GET /api/instances/:id
 * Get instance details with history and tasks
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const instance = await WorkflowInstance.findByPk(id, {
      include: [
        {
          model: Workflow,
          as: 'workflow',
          attributes: ['id', 'name', 'description', 'definition']
        },
        {
          model: WorkflowHistory,
          as: 'history',
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName']
            }
          ]
        },
        {
          model: Task,
          as: 'tasks',
          include: [
            {
              model: User,
              as: 'assignee',
              attributes: ['id', 'username', 'firstName', 'lastName']
            }
          ]
        },
        {
          model: WorkflowSubscription,
          as: 'subscriptions'
        }
      ]
    });

    if (!instance) {
      return res.status(404).json({ error: 'Instance not found' });
    }

    // Check if user is subscribed
    const isSubscribed = instance.subscriptions.some(sub => sub.userId === req.user.id);

    // Calculate progress
    const definition = instance.workflow.definition;
    let progress = 0;
    
    if (definition.nodes && definition.edges) {
      const totalNodes = definition.nodes.length;
      const executedNodes = instance.history.filter(h => 
        h.action === 'node_executed' || h.action === 'node_completed'
      ).length;
      progress = Math.round((executedNodes / totalNodes) * 100);
    }

    res.json({
      ...instance.toJSON(),
      isSubscribed,
      progress
    });
  } catch (error) {
    console.error('Error fetching instance:', error);
    res.status(500).json({ error: 'Failed to fetch instance' });
  }
});

/**
 * POST /api/instances/:id/subscribe
 * Subscribe to instance updates
 */
router.post('/:id/subscribe', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const instance = await WorkflowInstance.findByPk(id);
    if (!instance) {
      return res.status(404).json({ error: 'Instance not found' });
    }

    // Check if already subscribed
    const existing = await WorkflowSubscription.findOne({
      where: { userId, instanceId: id }
    });

    if (existing) {
      return res.json({ message: 'Already subscribed', subscription: existing });
    }

    const subscription = await WorkflowSubscription.create({
      userId,
      instanceId: id
    });

    res.json({ message: 'Subscribed successfully', subscription });
  } catch (error) {
    console.error('Error subscribing to instance:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

/**
 * DELETE /api/instances/:id/subscribe
 * Unsubscribe from instance updates
 */
router.delete('/:id/subscribe', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = await WorkflowSubscription.destroy({
      where: { userId, instanceId: id }
    });

    if (deleted === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Error unsubscribing from instance:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

/**
 * GET /api/instances/workflow/:workflowId
 * Get all instances for a workflow
 */
router.get('/workflow/:workflowId', authenticate, async (req, res) => {
  try {
    const { workflowId } = req.params;

    const instances = await WorkflowInstance.findAll({
      where: { workflowId },
      include: [
        {
          model: User,
          as: 'starter',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(instances);
  } catch (error) {
    console.error('Error fetching workflow instances:', error);
    res.status(500).json({ error: 'Failed to fetch instances' });
  }
});

module.exports = router;
