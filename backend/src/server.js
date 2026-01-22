require('dotenv').config();
const winston = require('winston');
const app = require('./app');
const { testConnection } = require('./config/database');
const { sequelize } = require('./config/database');
const rabbitmq = require('./config/rabbitmq');
const queueService = require('./services/queueService');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Test database connection
    logger.info('Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Sync database models (in production, use migrations)
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Syncing database models...');
      await sequelize.sync({ alter: false });
      logger.info('Database models synced');
    }

    // Connect to RabbitMQ
    logger.info('Connecting to RabbitMQ...');
    try {
      await rabbitmq.connect();
      logger.info('RabbitMQ connected successfully');

      // Start consuming events (optional - enable if needed)
      // await queueService.consumeWorkflowEvents(async (event) => {
      //   logger.info('Workflow event received:', event);
      // });
      
      // await queueService.consumeTaskEvents(async (event) => {
      //   logger.info('Task event received:', event);
      // });
    } catch (error) {
      logger.warn('RabbitMQ connection failed. Continuing without message queue:', error.message);
    }

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await rabbitmq.closeConnection();
          await sequelize.close();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
