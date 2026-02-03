const winston = require('winston');
const queueService = require('./queueService');
const notificationSocketService = require('./notificationSocketService');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

/**
 * Service to consume notification events from RabbitMQ
 * and send them to connected users via SSE
 */
class NotificationConsumerService {
  /**
   * Start consuming notification events
   */
  async start() {
    try {
      logger.info('Starting notification consumer service...');
      
      await queueService.consumeNotificationEvents(async (event) => {
        await this.handleNotificationEvent(event);
      });
      
      logger.info('Notification consumer service started successfully');
    } catch (error) {
      logger.error('Error starting notification consumer service:', error);
      throw error;
    }
  }

  /**
   * Handle notification event
   */
  async handleNotificationEvent(event) {
    try {
      const { type, notification } = event;
      
      if (type !== 'notification.created') {
        logger.warn(`Unknown notification event type: ${type}`);
        return;
      }

      // Send notification via SSE to the user
      if (notification.userId) {
        // Send to specific user
        notificationSocketService.sendToUser(notification.userId, {
          type: 'notification',
          data: notification
        });
      } else {
        // Broadcast system-wide notification
        notificationSocketService.broadcast({
          type: 'notification',
          data: notification
        });
      }

      logger.info(`Notification delivered via SSE: ${notification.id}`);
    } catch (error) {
      logger.error('Error handling notification event:', error);
    }
  }
}

module.exports = new NotificationConsumerService();
