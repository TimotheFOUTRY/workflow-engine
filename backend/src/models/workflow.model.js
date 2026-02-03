const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Workflow = sequelize.define('Workflow', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  definition: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Workflow definition including steps, conditions, and transitions'
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  allowedUsers: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
    allowNull: true,
    field: 'allowed_users',
    comment: 'Array of user IDs allowed to view and start this workflow'
  },
  allowedGroups: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
    allowNull: true,
    field: 'allowed_groups',
    comment: 'Array of group IDs allowed to view and start this workflow'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_public',
    comment: 'If true, all users can view and start this workflow'
  }
}, {
  tableName: 'workflows',
  timestamps: true,
  indexes: [
    { fields: ['name'] },
    { fields: ['isActive'] }
  ]
});

module.exports = Workflow;
