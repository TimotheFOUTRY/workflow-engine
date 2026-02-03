const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// SSE endpoint for real-time notifications
router.get('/stream', notificationController.subscribeToNotifications);

// Get all notifications for user
router.get('/', notificationController.getUserNotifications);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all as read
router.put('/mark-all-read', notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

// Test endpoint (development only)
if (process.env.NODE_ENV !== 'production') {
  router.post('/test', notificationController.createTestNotification);
}

module.exports = router;
