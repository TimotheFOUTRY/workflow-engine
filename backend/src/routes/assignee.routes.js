const express = require('express');
const router = express.Router();
const assigneeController = require('../controllers/assignee.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Get assignees (users + groups)
router.get('/', authenticate, assigneeController.getAssignees);

module.exports = router;
