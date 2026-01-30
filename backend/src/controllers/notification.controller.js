const winston = require('winston');
const { Notification } = require('../models');
const { Op } = require('sequelize');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

class NotificationController {
  /**
   * Get all notifications for current user
   */
  async getUserNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { unreadOnly } = req.query;
      
      const where = {
        [Op.or]: [
          { userId },
          { userId: null } // System-wide notifications
        ]
      };
      
      if (unreadOnly === 'true') {
        where.read = false;
      }

      const notifications = await Notification.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: 100
      });

      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      logger.error('Error getting notifications:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      
      const count = await Notification.count({
        where: {
          [Op.or]: [
            { userId },
            { userId: null }
          ],
          read: false
        }
      });

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      logger.error('Error getting unread count:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const notification = await Notification.findOne({
        where: {
          id,
          [Op.or]: [
            { userId },
            { userId: null }
          ]
        }
      });
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
      }

      await notification.update({
        read: true,
        readAt: new Date()
      });

      res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      
      await Notification.update(
        { read: true, readAt: new Date() },
        {
          where: {
            [Op.or]: [
              { userId },
              { userId: null }
            ],
            read: false
          }
        }
      );

      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      logger.error('Error marking all as read:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const notification = await Notification.findOne({
        where: {
          id,
          userId // Can only delete own notifications
        }
      });
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
      }

      await notification.destroy();

      res.json({
        success: true,
        message: 'Notification deleted'
      });
    } catch (error) {
      logger.error('Error deleting notification:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new NotificationController();
