const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkflowHistory = sequelize.define('WorkflowHistory', {
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
  stepName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Action taken: started, completed, approved, rejected, etc.'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  data: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional context data for this history entry'
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'workflow_history',
  timestamps: false,
  indexes: [
    { fields: ['instanceId'] },
    { fields: ['timestamp'] },
    { fields: ['userId'] }
  ]
});

module.exports = WorkflowHistory;
