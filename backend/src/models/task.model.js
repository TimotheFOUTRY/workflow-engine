const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  instanceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'workflow_instances',
      key: 'id'
    }
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  taskType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Type of task: approval, form, manual, etc.'
  },
  formId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'forms',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'rejected', 'cancelled'),
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  taskData: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Task-specific data and form responses'
  },
  decision: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'For approval tasks: approved, rejected, etc.'
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lockedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'locked_by',
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User ID who currently has the form locked for editing'
  },
  lockedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'locked_at',
    comment: 'Timestamp when the form was locked'
  },
  formData: {
    type: DataTypes.JSONB,
    defaultValue: {},
    field: 'form_data',
    comment: 'Current form data including partial saves'
  },
  formProgress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'form_progress',
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Form completion percentage (0-100)'
  },
  assignedUsers: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
    allowNull: true,
    field: 'assigned_users',
    comment: 'Array of user IDs assigned to work on this task'
  }
}, {
  tableName: 'tasks',
  timestamps: true,
  indexes: [
    { fields: ['instanceId'] },
    { fields: ['assignedTo'] },
    { fields: ['status'] },
    { fields: ['dueDate'] }
  ]
});

module.exports = Task;
