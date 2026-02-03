const amqp = require('amqplib');
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

let connection = null;
let channel = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://workflow:workflow123@localhost:5672';

// Queue names
const QUEUES = {
  WORKFLOW_EVENTS: 'workflow.events',
  TASK_QUEUE: 'task.queue',
  ENTERPRISE_BUS: 'enterprise.bus',
  LOCAL_BUS: 'local.bus',
  NOTIFICATIONS: 'notifications.realtime'
};

const connect = async () => {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Assert all queues
    await Promise.all(
      Object.values(QUEUES).map(queue => 
        channel.assertQueue(queue, { durable: true })
      )
    );
    
    logger.info('RabbitMQ connection established successfully');
    
    // Handle connection errors
    connection.on('error', (err) => {
      logger.error('RabbitMQ connection error:', err);
    });
    
    connection.on('close', () => {
      logger.warn('RabbitMQ connection closed. Reconnecting...');
      setTimeout(connect, 5000);
    });
    
    return { connection, channel };
  } catch (error) {
    logger.error('Failed to connect to RabbitMQ:', error);
    setTimeout(connect, 5000);
    throw error;
  }
};

const getChannel = () => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  return channel;
};

const closeConnection = async () => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    logger.info('RabbitMQ connection closed');
  } catch (error) {
    logger.error('Error closing RabbitMQ connection:', error);
  }
};

module.exports = {
  connect,
  getChannel,
  closeConnection,
  QUEUES
};
