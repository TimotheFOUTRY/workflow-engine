const Workflow = require('./workflow.model');
const WorkflowInstance = require('./workflowInstance.model');
const Task = require('./task.model');
const Form = require('./form.model');
const User = require('./user.model');
const WorkflowHistory = require('./workflowHistory.model');
const Group = require('./group.model');
const Notification = require('./notification.model');
const WorkflowSubscription = require('./workflowSubscription.model');

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

// User -> WorkflowHistory (one-to-many)
User.hasMany(WorkflowHistory, {
  foreignKey: 'userId',
  as: 'historyEntries'
});
WorkflowHistory.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
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

// User -> Task (one-to-many for lockedBy)
User.hasMany(Task, {
  foreignKey: 'lockedBy',
  as: 'lockedTasks'
});
Task.belongsTo(User, {
  foreignKey: 'lockedBy',
  as: 'lockedByUser'
});

// User -> WorkflowInstance (one-to-many for startedBy)
User.hasMany(WorkflowInstance, {
  foreignKey: 'startedBy',
  as: 'startedInstances'
});
WorkflowInstance.belongsTo(User, {
  foreignKey: 'startedBy',
  as: 'starter'
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

// User -> Notification (one-to-many)
User.hasMany(Notification, {
  foreignKey: 'userId',
  as: 'notifications'
});
Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User <-> Group (many-to-many)
User.belongsToMany(Group, {
  through: 'group_members',
  foreignKey: 'userId',
  otherKey: 'groupId',
  as: 'groups'
});
Group.belongsToMany(User, {
  through: 'group_members',
  foreignKey: 'groupId',
  otherKey: 'userId',
  as: 'users'
});

// WorkflowSubscription relationships
WorkflowSubscription.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});
WorkflowSubscription.belongsTo(WorkflowInstance, {
  foreignKey: 'instanceId',
  as: 'instance'
});
User.hasMany(WorkflowSubscription, {
  foreignKey: 'userId',
  as: 'subscriptions'
});
WorkflowInstance.hasMany(WorkflowSubscription, {
  foreignKey: 'instanceId',
  as: 'subscriptions'
});

module.exports = {
  Workflow,
  WorkflowInstance,
  Task,
  Form,
  User,
  WorkflowHistory,
  Group,
  Notification,
  WorkflowSubscription
};
