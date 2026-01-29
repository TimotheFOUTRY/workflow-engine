const winston = require('winston');
const { getChannel, QUEUES } = require('../config/rabbitmq');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

class QueueService {
  /**
   * Publish workflow event to queue
   */
  async publishWorkflowEvent(event) {
    try {
      const channel = getChannel();
      const message = JSON.stringify({
        ...event,
        timestamp: new Date().toISOString()
      });

      channel.sendToQueue(
        QUEUES.WORKFLOW_EVENTS,
        Buffer.from(message),
        { persistent: true }
      );

      logger.debug(`Published workflow event: ${event.type}`);
    } catch (error) {
      logger.error('Error publishing workflow event:', error);
      throw error;
    }
  }

  /**
   * Publish task event to queue
   */
  async publishTaskEvent(event) {
    try {
      const channel = getChannel();
      const message = JSON.stringify({
        ...event,
        timestamp: new Date().toISOString()
      });

      channel.sendToQueue(
        QUEUES.TASK_QUEUE,
        Buffer.from(message),
        { persistent: true }
      );

      logger.debug(`Published task event: ${event.type}`);
    } catch (error) {
      logger.error('Error publishing task event:', error);
      throw error;
    }
  }

  /**
   * Publish event to enterprise bus
   */
  async publishToEnterpriseBus(event) {
    try {
      const channel = getChannel();
      const message = JSON.stringify({
        ...event,
        timestamp: new Date().toISOString(),
        source: 'workflow-engine'
      });

      channel.sendToQueue(
        QUEUES.ENTERPRISE_BUS,
        Buffer.from(message),
        { persistent: true }
      );

      logger.info(`Published to enterprise bus: ${event.type}`);
    } catch (error) {
      logger.error('Error publishing to enterprise bus:', error);
      throw error;
    }
  }

  /**
   * Start consuming workflow events
   */
  async consumeWorkflowEvents(callback) {
    try {
      const channel = getChannel();
      
      await channel.consume(QUEUES.WORKFLOW_EVENTS, async (msg) => {
        if (msg) {
          try {
            const event = JSON.parse(msg.content.toString());
            logger.debug(`Received workflow event: ${event.type}`);
            
            await callback(event);
            channel.ack(msg);
          } catch (error) {
            logger.error('Error processing workflow event:', error);
            channel.nack(msg, false, false); // Don't requeue
          }
        }
      });

      logger.info('Started consuming workflow events');
    } catch (error) {
      logger.error('Error starting workflow events consumer:', error);
      throw error;
    }
  }

  /**
   * Start consuming task events
   */
  async consumeTaskEvents(callback) {
    try {
      const channel = getChannel();
      
      await channel.consume(QUEUES.TASK_QUEUE, async (msg) => {
        if (msg) {
          try {
            const event = JSON.parse(msg.content.toString());
            logger.debug(`Received task event: ${event.type}`);
            
            await callback(event);
            channel.ack(msg);
          } catch (error) {
            logger.error('Error processing task event:', error);
            channel.nack(msg, false, false);
          }
        }
      });

      logger.info('Started consuming task events');
    } catch (error) {
      logger.error('Error starting task events consumer:', error);
      throw error;
    }
  }

  /**
   * Start listening to enterprise bus
   */
  async listenToEnterpriseBus(callback) {
    try {
      const channel = getChannel();
      
      await channel.consume(QUEUES.LOCAL_BUS, async (msg) => {
        if (msg) {
          try {
            const event = JSON.parse(msg.content.toString());
            logger.info(`Received enterprise bus event: ${event.type}`);
            
            await callback(event);
            channel.ack(msg);
          } catch (error) {
            logger.error('Error processing enterprise bus event:', error);
            channel.nack(msg, false, true); // Requeue enterprise events
          }
        }
      });

      logger.info('Started listening to enterprise bus');
    } catch (error) {
      logger.error('Error starting enterprise bus listener:', error);
      throw error;
    }
  }
}

module.exports = new QueueService();
