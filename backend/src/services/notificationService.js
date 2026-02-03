const winston = require('winston');
const { Notification, WorkflowInstance, Task, User } = require('../models');
const queueService = require('./queueService');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

class NotificationService {
  /**
   * Start consuming RabbitMQ events and creating notifications
   */
  async startListening() {
    try {
      logger.info('Starting notification service...');
      
      // Consume workflow events
      await queueService.consumeWorkflowEvents(async (event) => {
        await this.handleWorkflowEvent(event);
      });
      
      // Consume task events
      await queueService.consumeTaskEvents(async (event) => {
        await this.handleTaskEvent(event);
      });
      
      logger.info('Notification service started successfully');
    } catch (error) {
      logger.error('Error starting notification service:', error);
      throw error;
    }
  }

  /**
   * Handle workflow events
   */
  async handleWorkflowEvent(event) {
    try {
      const { type, workflowInstanceId, workflowName, userId, error } = event;
      
      logger.info(`Handling workflow event: ${type}`, { workflowInstanceId });
      
      let notificationData = {
        type: this.mapWorkflowEventType(type),
        data: {
          workflowInstanceId,
          workflowName,
          timestamp: event.timestamp
        }
      };

      switch (type) {
        case 'workflow.started':
          notificationData.title = 'Workflow démarré';
          notificationData.message = `Le workflow "${workflowName}" a été démarré avec succès`;
          notificationData.userId = userId;
          break;

        case 'workflow.completed':
          notificationData.title = 'Workflow terminé';
          notificationData.message = `Le workflow "${workflowName}" s'est terminé avec succès`;
          notificationData.userId = userId;
          break;

        case 'workflow.failed':
          notificationData.title = 'Workflow échoué';
          notificationData.message = `Le workflow "${workflowName}" a échoué: ${error || 'Erreur inconnue'}`;
          notificationData.data.error = error;
          notificationData.userId = userId;
          break;

        default:
          logger.warn(`Unknown workflow event type: ${type}`);
          return;
      }

      await this.createNotification(notificationData);
    } catch (error) {
      logger.error('Error handling workflow event:', error);
    }
  }

  /**
   * Handle task events
   */
  async handleTaskEvent(event) {
    try {
      const { type, taskId, assigneeId, taskName, dueDate } = event;
      
      logger.info(`Handling task event: ${type}`, { taskId });
      
      let notificationData = {
        type: this.mapTaskEventType(type),
        data: {
          taskId,
          taskName,
          timestamp: event.timestamp
        }
      };

      switch (type) {
        case 'task.assigned':
          notificationData.title = 'Nouvelle tâche assignée';
          notificationData.message = `La tâche "${taskName}" vous a été assignée`;
          notificationData.userId = assigneeId;
          break;

        case 'task.completed':
          // Notify the person who created the workflow
          const task = await Task.findByPk(taskId, {
            include: [
              {
                model: require('../models').WorkflowInstance,
                as: 'workflowInstance',
                attributes: ['userId']
              }
            ]
          });
          
          if (task && task.workflowInstance) {
            notificationData.title = 'Tâche terminée';
            notificationData.message = `La tâche "${taskName}" a été complétée`;
            notificationData.userId = task.workflowInstance.userId;
          }
          break;

        case 'task.overdue':
          notificationData.title = 'Tâche en retard';
          notificationData.message = `La tâche "${taskName}" est en retard (échéance: ${dueDate})`;
          notificationData.userId = assigneeId;
          notificationData.data.dueDate = dueDate;
          break;

        default:
          logger.warn(`Unknown task event type: ${type}`);
          return;
      }

      await this.createNotification(notificationData);
    } catch (error) {
      logger.error('Error handling task event:', error);
    }
  }

  /**
   * Map workflow event types to notification types
   */
  mapWorkflowEventType(eventType) {
    const mapping = {
      'workflow.started': 'workflow_started',
      'workflow.completed': 'workflow_completed',
      'workflow.failed': 'workflow_failed'
    };
    return mapping[eventType] || 'info';
  }

  /**
   * Map task event types to notification types
   */
  mapTaskEventType(eventType) {
    const mapping = {
      'task.assigned': 'task_assigned',
      'task.completed': 'task_completed',
      'task.overdue': 'task_overdue'
    };
    return mapping[eventType] || 'info';
  }

  /**
   * Create a notification in database
   */
  async createNotification({ userId, type, title, message, data }) {
    try {
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        data,
        read: false
      });
      
      logger.info(`Notification created: ${notification.id}`);
      
      // Publish to RabbitMQ for real-time delivery
      await this.publishNotificationEvent(notification);
      
      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Publish notification event to RabbitMQ for real-time delivery
   */
  async publishNotificationEvent(notification) {
    try {
      await queueService.publishNotificationEvent({
        type: 'notification.created',
        notification: {
          id: notification.id,
          userId: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          read: notification.read,
          createdAt: notification.createdAt
        }
      });
    } catch (error) {
      // Don't throw error, just log it - notification is already saved
      logger.error('Error publishing notification event:', error);
    }
  }

  /**
   * Create a system-wide notification (no specific user)
   */
  async createSystemNotification({ type, title, message, data }) {
    return this.createNotification({
      userId: null,
      type: type || 'system',
      title,
      message,
      data
    });
  }
}

module.exports = new NotificationService();
