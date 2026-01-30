const express = require('express');
const router = express.Router();
const assigneeController = require('../controllers/assignee.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get assignees (users + groups)
router.get('/', authenticateToken, assigneeController.getAssignees);

module.exports = router;
