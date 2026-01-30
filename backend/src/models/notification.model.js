const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'User to notify, null for system-wide notifications'
  },
  type: {
    type: DataTypes.ENUM(
      'workflow_started',
      'workflow_completed',
      'workflow_failed',
      'task_assigned',
      'task_completed',
      'task_overdue',
      'system',
      'info',
      'warning',
      'error'
    ),
    allowNull: false,
    defaultValue: 'info'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Additional data (workflowId, taskId, etc.)'
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['type'] },
    { fields: ['read'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Notification;
