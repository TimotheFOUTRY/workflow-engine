const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require authentication and admin role
router.use(authenticate);

/**
 * @route   GET /api/users/statistics
 * @desc    Get user statistics
 * @access  Private (Admin)
 */
router.get('/statistics', authorize('admin'), userController.getUserStatistics.bind(userController));

/**
 * @route   GET /api/users/pending
 * @desc    Get all pending users
 * @access  Private (Admin)
 */
router.get('/pending', authorize('admin'), userController.getPendingUsers.bind(userController));

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin, Manager)
 */
router.get('/', authorize('admin', 'manager'), userController.getAllUsers.bind(userController));

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Private (Admin)
 */
router.post('/', authorize('admin'), userController.createUser.bind(userController));

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin, Manager)
 */
router.get('/:id', authorize('admin', 'manager'), userController.getUser.bind(userController));

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin)
 */
router.put('/:id', authorize('admin'), userController.updateUser.bind(userController));

/**
 * @route   POST /api/users/:id/approve
 * @desc    Approve user
 * @access  Private (Admin)
 */
router.post('/:id/approve', authorize('admin'), userController.approveUser.bind(userController));

/**
 * @route   POST /api/users/:id/reject
 * @desc    Reject user
 * @access  Private (Admin)
 */
router.post('/:id/reject', authorize('admin'), userController.rejectUser.bind(userController));

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete('/:id', authorize('admin'), userController.deleteUser.bind(userController));

module.exports = router;
