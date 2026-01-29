const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkflowInstance = sequelize.define('WorkflowInstance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  workflowId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'workflows',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'running', 'completed', 'failed', 'cancelled'),
    defaultValue: 'pending'
  },
  currentStep: {
    type: DataTypes.STRING,
    allowNull: true
  },
  instanceData: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Dynamic data for this workflow instance'
  },
  startedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'workflow_instances',
  timestamps: true,
  indexes: [
    { fields: ['workflowId'] },
    { fields: ['status'] },
    { fields: ['startedBy'] },
    { fields: ['startedAt'] }
  ]
});

module.exports = WorkflowInstance;
