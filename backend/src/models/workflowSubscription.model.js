const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkflowSubscription = sequelize.define('WorkflowSubscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  instanceId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'instance_id',
    references: {
      model: 'workflow_instances',
      key: 'id'
    }
  }
}, {
  tableName: 'workflow_subscriptions',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['instance_id'] },
    { unique: true, fields: ['user_id', 'instance_id'] }
  ]
});

module.exports = WorkflowSubscription;
