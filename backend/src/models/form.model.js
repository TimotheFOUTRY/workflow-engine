const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Form = sequelize.define('Form', {
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
  schema: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'JSON Schema defining form fields'
  },
  uiSchema: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'UI configuration for form rendering'
  },
  validationRules: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Custom validation rules'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'forms',
  timestamps: true,
  indexes: [
    { fields: ['name'] },
    { fields: ['isActive'] }
  ]
});

module.exports = Form;
