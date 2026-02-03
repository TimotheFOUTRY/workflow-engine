const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

/**
 * Service for managing SSE connections for real-time notifications
 */
class NotificationSocketService {
  constructor() {
    // Map of userId -> array of response objects for SSE connections
    this.connections = new Map();
  }

  /**
   * Add a new SSE connection for a user
   */
  addConnection(userId, res) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, []);
    }
    
    const userConnections = this.connections.get(userId);
    userConnections.push(res);
    
    logger.info(`SSE connection added for user ${userId}. Total connections: ${userConnections.length}`);
    
    // Remove connection when client disconnects
    res.on('close', () => {
      this.removeConnection(userId, res);
    });
  }

  /**
   * Remove a connection for a user
   */
  removeConnection(userId, res) {
    if (!this.connections.has(userId)) {
      return;
    }
    
    const userConnections = this.connections.get(userId);
    const index = userConnections.indexOf(res);
    
    if (index !== -1) {
      userConnections.splice(index, 1);
      logger.info(`SSE connection removed for user ${userId}. Remaining: ${userConnections.length}`);
      
      if (userConnections.length === 0) {
        this.connections.delete(userId);
      }
    }
  }

  /**
   * Send notification to a specific user
   */
  sendToUser(userId, notification) {
    if (!this.connections.has(userId)) {
      logger.debug(`No active connections for user ${userId}`);
      return;
    }
    
    const userConnections = this.connections.get(userId);
    const data = JSON.stringify(notification);
    
    // Send to all connections for this user
    userConnections.forEach((res) => {
      try {
        res.write(`data: ${data}\n\n`);
      } catch (error) {
        logger.error(`Error sending notification to user ${userId}:`, error);
      }
    });
    
    logger.info(`Notification sent to user ${userId} (${userConnections.length} connections)`);
  }

  /**
   * Send notification to multiple users
   */
  sendToUsers(userIds, notification) {
    userIds.forEach(userId => {
      this.sendToUser(userId, notification);
    });
  }

  /**
   * Broadcast to all connected users
   */
  broadcast(notification) {
    const data = JSON.stringify(notification);
    let totalSent = 0;
    
    this.connections.forEach((userConnections, userId) => {
      userConnections.forEach((res) => {
        try {
          res.write(`data: ${data}\n\n`);
          totalSent++;
        } catch (error) {
          logger.error(`Error broadcasting to user ${userId}:`, error);
        }
      });
    });
    
    logger.info(`Notification broadcasted to ${totalSent} connections`);
  }

  /**
   * Get count of active connections
   */
  getConnectionCount() {
    let total = 0;
    this.connections.forEach((connections) => {
      total += connections.length;
    });
    return total;
  }

  /**
   * Get users currently connected
   */
  getConnectedUsers() {
    return Array.from(this.connections.keys());
  }
}

module.exports = new NotificationSocketService();
