const Workflow = require('./workflow.model');
const WorkflowInstance = require('./workflowInstance.model');
const Task = require('./task.model');
const Form = require('./form.model');
const User = require('./user.model');
const WorkflowHistory = require('./workflowHistory.model');
const Group = require('./group.model');

// Define relationships

// Workflow -> WorkflowInstance (one-to-many)
Workflow.hasMany(WorkflowInstance, {
  foreignKey: 'workflowId',
  as: 'instances'
});
WorkflowInstance.belongsTo(Workflow, {
  foreignKey: 'workflowId',
  as: 'workflow'
});

// WorkflowInstance -> Task (one-to-many)
WorkflowInstance.hasMany(Task, {
  foreignKey: 'instanceId',
  as: 'tasks'
});
Task.belongsTo(WorkflowInstance, {
  foreignKey: 'instanceId',
  as: 'instance'
});

// WorkflowInstance -> WorkflowHistory (one-to-many)
WorkflowInstance.hasMany(WorkflowHistory, {
  foreignKey: 'instanceId',
  as: 'history'
});
WorkflowHistory.belongsTo(WorkflowInstance, {
  foreignKey: 'instanceId',
  as: 'instance'
});

// User -> Task (one-to-many)
User.hasMany(Task, {
  foreignKey: 'assignedTo',
  as: 'tasks'
});
Task.belongsTo(User, {
  foreignKey: 'assignedTo',
  as: 'assignee'
});

// Form -> Task (one-to-many)
Form.hasMany(Task, {
  foreignKey: 'formId',
  as: 'tasks'
});
Task.belongsTo(Form, {
  foreignKey: 'formId',
  as: 'form'
});

// User -> WorkflowHistory (one-to-many)
User.hasMany(WorkflowHistory, {
  foreignKey: 'userId',
  as: 'history'
});
WorkflowHistory.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  Workflow,
  WorkflowInstance,
  Task,
  Form,
  User,
  WorkflowHistory,
  Group
};
