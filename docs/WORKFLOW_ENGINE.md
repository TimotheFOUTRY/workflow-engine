# Workflow Engine Documentation

## Overview

The workflow engine is the core component that executes workflow instances. It implements a state machine pattern to manage workflow execution, handle task creation, process approvals, evaluate conditions, and manage workflow state transitions.

## Architecture

```
┌──────────────────────────────────────────────────────┐
│           Workflow Engine                             │
│                                                        │
│  ┌─────────────┐    ┌──────────────┐                │
│  │   Start     │───▶│   Execute    │                │
│  │  Workflow   │    │    Steps     │                │
│  └─────────────┘    └──────────────┘                │
│                            │                          │
│         ┌──────────────────┼──────────────────┐     │
│         │                  │                  │      │
│    ┌────▼────┐      ┌─────▼────┐      ┌─────▼────┐│
│    │  Task   │      │ Approval │      │Condition ││
│    │ Handler │      │ Handler  │      │ Handler  ││
│    └─────────┘      └──────────┘      └──────────┘ │
│                                                       │
└───────────────────────────────────────────────────────┘
           │                        │
           ▼                        ▼
     ┌──────────┐           ┌────────────┐
     │ RabbitMQ │           │ PostgreSQL │
     │  Events  │           │  Database  │
     └──────────┘           └────────────┘
```

## Key Components

### 1. Workflow Engine (`workflowEngine.js`)

The main engine class that orchestrates workflow execution.

**Key Methods:**

#### `startWorkflow(workflowId, initialData, startedBy)`
Starts a new workflow instance.

```javascript
const instance = await workflowEngine.startWorkflow(
  'workflow-uuid',
  { amount: 5000, description: 'Purchase request' },
  'user-uuid'
);
```

**Process:**
1. Validates workflow exists and is active
2. Creates workflow instance with status 'running'
3. Logs workflow start in history
4. Publishes 'workflow.started' event to RabbitMQ
5. Executes first step

#### `executeNextStep(instanceId)`
Executes the next step in a workflow instance.

```javascript
await workflowEngine.executeNextStep('instance-uuid');
```

**Process:**
1. Loads workflow instance and definition
2. Finds current step in definition
3. Calls appropriate handler based on step type
4. Updates instance state
5. Continues to next step or completes workflow

#### `completeTask(taskId, userId, decision, taskData)`
Completes a task and continues workflow execution.

```javascript
await workflowEngine.completeTask(
  'task-uuid',
  'user-uuid',
  'approved',
  { comments: 'Looks good!' }
);
```

**Process:**
1. Updates task status
2. Updates instance data with task results
3. Logs action in history
4. Publishes 'task.completed' event
5. Handles sequential/parallel approvals
6. Moves to next step

#### `completeWorkflow(instanceId)`
Marks a workflow instance as completed.

#### `failWorkflow(instanceId, errorMessage)`
Marks a workflow instance as failed.

#### `cancelWorkflow(instanceId, userId)`
Cancels a running workflow instance.

### 2. Step Types

#### Start Step
Entry point for workflow execution.

```javascript
{
  "id": "start",
  "type": "start",
  "name": "Start"
}
```

**Behavior:** Immediately moves to next step.

#### Task Step
Creates a user task that requires completion.

```javascript
{
  "id": "task-1",
  "type": "task",
  "name": "Fill Form",
  "config": {
    "formId": "form-uuid",
    "assignedTo": "user-uuid",
    "priority": "medium",
    "instructions": "Please complete the form"
  }
}
```

**Behavior:**
1. Creates a Task record in database
2. Assigns to specified user
3. Publishes 'task.created' event
4. Waits for task completion

#### Approval Step
Creates approval task(s) for decision-making.

```javascript
{
  "id": "approval-1",
  "type": "approval",
  "name": "Manager Approval",
  "config": {
    "approvers": ["user-1", "user-2"],
    "approvalType": "sequential"
  }
}
```

**Approval Types:**
- **Sequential:** Approvers review one after another
- **Parallel:** All approvers review simultaneously

**Behavior:**
1. Creates approval task(s)
2. For sequential: creates first task only
3. For parallel: creates all tasks at once
4. Waits for completion/rejection
5. On rejection: can branch to rejection path
6. On approval: continues to next step

#### Condition Step
Evaluates a condition and branches based on result.

```javascript
{
  "id": "condition-1",
  "type": "condition",
  "name": "Check Amount",
  "config": {
    "condition": {
      "field": "amount",
      "operator": "greaterThan",
      "value": 10000
    }
  }
}
```

**Supported Operators:**
- `equals` - Field equals value
- `notEquals` - Field does not equal value
- `greaterThan` - Field greater than value
- `lessThan` - Field less than value
- `contains` - Field contains value (string)

**Behavior:**
1. Evaluates condition against instance data
2. Returns 'true' or 'false'
3. Follows transition with matching condition
4. Falls back to 'default' transition if no match

#### Timer Step
Delays execution for a specified time.

```javascript
{
  "id": "timer-1",
  "type": "timer",
  "name": "Wait 24 Hours",
  "config": {
    "delay": 86400000  // milliseconds
  }
}
```

**Behavior:**
1. Schedules execution after delay
2. Uses setTimeout (in-memory)
3. In production: use job scheduler (Bull, Agenda, etc.)

#### End Step
Terminates workflow execution.

```javascript
{
  "id": "end",
  "type": "end",
  "name": "End"
}
```

**Behavior:**
1. Marks instance as 'completed'
2. Logs completion in history
3. Publishes 'workflow.completed' event

### 3. Transitions

Transitions define the flow between steps.

```javascript
{
  "from": "step-id",
  "to": "next-step-id",
  "condition": "true|false|default"
}
```

**Types:**
- **Unconditional:** No condition specified
- **Conditional:** Has condition (for condition steps)
- **Default:** Fallback transition

**Example:**
```javascript
[
  { "from": "start", "to": "task-1" },
  { "from": "task-1", "to": "condition-1" },
  { "from": "condition-1", "to": "approval-1", "condition": "true" },
  { "from": "condition-1", "to": "end", "condition": "false" },
  { "from": "approval-1", "to": "end" }
]
```

## State Machine

The workflow engine implements a state machine with these states:

```
pending → running → completed
                  ↘ failed
                  ↘ cancelled
```

### State Transitions

- **pending → running:** When workflow starts
- **running → completed:** When end step reached
- **running → failed:** When error occurs
- **running → cancelled:** When user cancels
- **Any state → (stays same):** During step execution

## Data Flow

### Instance Data
Each workflow instance maintains a data object that:
- Stores initial input data
- Accumulates data from completed tasks
- Is available for condition evaluation
- Can be accessed in subsequent steps

```javascript
{
  // Initial data
  "amount": 5000,
  "description": "Purchase request",
  
  // Added by task completion
  "task-1": {
    "decision": "approved",
    "taskData": { ... },
    "completedBy": "user-uuid",
    "completedAt": "2024-01-22T10:00:00.000Z"
  }
}
```

## Event System

The engine publishes events to RabbitMQ:

### Workflow Events
- `workflow.started` - New workflow instance started
- `workflow.completed` - Workflow successfully completed
- `workflow.failed` - Workflow execution failed
- `workflow.cancelled` - Workflow cancelled by user
- `step.completed` - Step completed

### Task Events
- `task.created` - New task created
- `task.assigned` - Task assigned to user
- `task.reassigned` - Task reassigned to different user
- `task.completed` - Task completed
- `task.rejected` - Task rejected

## History & Audit Trail

Every action is logged in `workflow_history` table:

```javascript
{
  "instanceId": "uuid",
  "stepName": "approval-1",
  "action": "task_completed",
  "userId": "user-uuid",
  "data": { ... },
  "timestamp": "2024-01-22T10:00:00.000Z"
}
```

**Tracked Actions:**
- workflow_started
- workflow_completed
- workflow_failed
- workflow_cancelled
- step_completed
- task_created
- task_completed
- task_rejected
- approval_step_started
- condition_evaluated
- timer_started

## Error Handling

### Automatic Error Handling
The engine automatically:
1. Catches execution errors
2. Marks workflow as 'failed'
3. Logs error in history
4. Publishes failure event
5. Stores error message

### Manual Error Handling
Applications can:
1. Implement retry logic
2. Add error handling steps
3. Create compensation workflows
4. Set up escalation paths

## Best Practices

### 1. Workflow Design
- **Keep it simple:** Start with simple flows
- **Modular design:** Break complex flows into sub-workflows
- **Clear naming:** Use descriptive step names
- **Document transitions:** Add comments for conditional logic

### 2. Task Management
- **Set priorities:** Use priority field appropriately
- **Due dates:** Always set realistic due dates
- **Instructions:** Provide clear task instructions
- **Validation:** Validate form data before submission

### 3. Approval Workflows
- **Sequential vs Parallel:** Choose based on requirements
- **Escalation:** Implement timeout and escalation
- **Rejection paths:** Handle rejections gracefully
- **Delegation:** Allow task reassignment

### 4. Condition Logic
- **Simple conditions:** Keep conditions simple
- **Default paths:** Always provide default transitions
- **Data validation:** Ensure required data exists
- **Type safety:** Check data types before comparison

### 5. Performance
- **Async processing:** Use message queues for long operations
- **Database indexing:** Index frequently queried fields
- **Caching:** Cache workflow definitions
- **Pagination:** Paginate large result sets

### 6. Monitoring
- **Track metrics:** Monitor completion times
- **Error rates:** Track failure rates
- **Bottlenecks:** Identify slow steps
- **User load:** Monitor task assignments

## Advanced Features

### 1. Parallel Execution
Execute multiple steps simultaneously:

```javascript
// Create multiple tasks at once
for (const assignee of assignees) {
  await Task.create({ assignedTo: assignee, ... });
}
```

### 2. Sub-Workflows
Call another workflow from within a workflow:

```javascript
{
  "type": "sub-workflow",
  "config": {
    "workflowId": "sub-workflow-uuid"
  }
}
```

### 3. Dynamic Assignment
Assign tasks based on runtime data:

```javascript
const assignee = instanceData.department === 'IT' 
  ? 'it-manager' 
  : 'general-manager';
```

### 4. Scheduled Execution
Schedule workflows to run at specific times:

```javascript
{
  "type": "scheduled-start",
  "config": {
    "cron": "0 9 * * 1"  // Every Monday at 9 AM
  }
}
```

### 5. External Integration
Trigger workflows from external systems via RabbitMQ:

```javascript
// Listen to enterprise bus
await queueService.listenToEnterpriseBus(async (event) => {
  if (event.type === 'purchase.request.created') {
    await workflowEngine.startWorkflow(
      'purchase-approval-workflow',
      event.data
    );
  }
});
```

## Troubleshooting

### Workflow Stuck
**Symptom:** Instance status is 'running' but not progressing

**Check:**
1. View instance history for last action
2. Check for pending tasks
3. Review error logs
4. Verify transitions are defined

**Fix:**
```javascript
// Get instance status
const instance = await WorkflowInstance.findByPk(instanceId);
console.log('Current step:', instance.currentStep);

// Check pending tasks
const tasks = await Task.findAll({
  where: { instanceId, status: 'pending' }
});

// Manually advance if needed
await workflowEngine.executeNextStep(instanceId);
```

### Task Not Created
**Symptom:** Task step executes but no task created

**Check:**
1. Task service logs
2. Database constraints
3. User assignment validity

### Condition Not Evaluating
**Symptom:** Condition always goes to default path

**Check:**
1. Field name matches instance data
2. Data type compatibility
3. Operator is correct
4. Value format matches

**Debug:**
```javascript
console.log('Instance data:', instance.instanceData);
console.log('Condition:', step.config.condition);
```

## Performance Optimization

### 1. Database
```sql
-- Index frequently queried fields
CREATE INDEX idx_instances_status ON workflow_instances(status);
CREATE INDEX idx_tasks_assigned_status ON tasks(assigned_to, status);
```

### 2. Caching
```javascript
// Cache workflow definitions
const workflowCache = new Map();

const getWorkflow = async (id) => {
  if (workflowCache.has(id)) {
    return workflowCache.get(id);
  }
  const workflow = await Workflow.findByPk(id);
  workflowCache.set(id, workflow);
  return workflow;
};
```

### 3. Batch Processing
```javascript
// Process multiple tasks in batch
const completeTasks = async (taskIds) => {
  await Task.update(
    { status: 'completed' },
    { where: { id: { [Op.in]: taskIds } } }
  );
};
```

## Migration Guide

### From v1 to v2
1. Back up database
2. Run migrations
3. Update workflow definitions
4. Test critical workflows
5. Deploy gradually

---

For more information, see:
- [API Documentation](./API.md)
- [Backend README](../backend/README.md)
- [Frontend README](../frontend/README.md)
