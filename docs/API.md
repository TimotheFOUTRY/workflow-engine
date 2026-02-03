# Backend API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

Currently using mock authentication. In production, include JWT token in Authorization header:

```
Authorization: Bearer <token>
```

## API Endpoints

### Health Check

#### Check API Health
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-22T10:00:00.000Z",
  "uptime": 1234.56
}
```

---

## Workflows

### List All Workflows
```http
GET /api/workflows
```

**Query Parameters:**
- `isActive` (boolean) - Filter by active status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Purchase Request Approval",
      "description": "Multi-level approval workflow",
      "definition": { ... },
      "version": 1,
      "isActive": true,
      "createdAt": "2024-01-22T10:00:00.000Z"
    }
  ]
}
```

### Get Workflow by ID
```http
GET /api/workflows/:id
```

### Create Workflow
```http
POST /api/workflows
Content-Type: application/json

{
  "name": "My Workflow",
  "description": "Workflow description",
  "definition": {
    "steps": [...],
    "transitions": [...]
  }
}
```

### Update Workflow
```http
PUT /api/workflows/:id
Content-Type: application/json

{
  "name": "Updated name",
  "definition": { ... }
}
```

### Delete Workflow
```http
DELETE /api/workflows/:id
```

### Start Workflow Instance
```http
POST /api/workflows/:id/start
Content-Type: application/json

{
  "data": {
    "amount": 5000,
    "description": "Purchase request"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "instance-uuid",
    "workflowId": "workflow-uuid",
    "status": "running",
    "currentStep": "start",
    "instanceData": { ... },
    "startedAt": "2024-01-22T10:00:00.000Z"
  }
}
```

### Get Workflow Instances
```http
GET /api/workflows/:id/instances?status=running
```

### Get Specific Instance
```http
GET /api/workflows/instances/:instanceId
```

### Cancel Workflow Instance
```http
POST /api/workflows/instances/:instanceId/cancel
```

---

## Tasks

### Get My Tasks
```http
GET /api/tasks/my-tasks?status=pending
```

**Query Parameters:**
- `status` - Filter by status (pending, in_progress, completed, rejected)
- `taskType` - Filter by type (task, approval)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "task-uuid",
      "instanceId": "instance-uuid",
      "assignedTo": "user-uuid",
      "taskType": "approval",
      "status": "pending",
      "priority": "high",
      "dueDate": "2024-01-25T10:00:00.000Z",
      "taskData": {
        "stepId": "approval-step",
        "stepName": "Manager Approval"
      },
      "createdAt": "2024-01-22T10:00:00.000Z"
    }
  ]
}
```

### Get Task Details
```http
GET /api/tasks/:id
```

### Complete Task
```http
POST /api/tasks/:id/complete
Content-Type: application/json

{
  "decision": "approved",
  "data": {
    "comments": "Approved with conditions"
  }
}
```

**Decisions for Approval Tasks:**
- `approved` - Approve the task
- `rejected` - Reject the task

### Reassign Task
```http
POST /api/tasks/:id/reassign
Content-Type: application/json

{
  "assignedTo": "new-user-uuid"
}
```

### Update Task Status
```http
PUT /api/tasks/:id/status
Content-Type: application/json

{
  "status": "in_progress"
}
```

### Get Task Statistics
```http
GET /api/tasks/statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 50,
    "pending": 10,
    "inProgress": 5,
    "completed": 30,
    "rejected": 3,
    "overdue": 2
  }
}
```

### Lock Form for Editing
```http
POST /api/tasks/:id/lock
```

**Response:**
```json
{
  "success": true,
  "message": "Form locked successfully"
}
```

**Error Response (409 Conflict):**
```json
{
  "success": false,
  "message": "Form is currently locked by another user",
  "lockedBy": {
    "id": "user-uuid",
    "username": "john.doe",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Unlock Form
```http
POST /api/tasks/:id/unlock
```

**Response:**
```json
{
  "success": true,
  "message": "Form unlocked successfully"
}
```

### Save Form Draft (Partial Save)
```http
POST /api/tasks/:id/save-draft
Content-Type: application/json

{
  "formData": {
    "field1": "value1",
    "field2": "value2"
  },
  "progress": 45
}
```

**Response:**
```json
{
  "success": true,
  "message": "Form draft saved successfully",
  "data": {
    "id": "task-uuid",
    "formData": { ... },
    "formProgress": 45,
    "lockedBy": null,
    "lockedAt": null
  }
}
```

**Notes:**
- Automatically unlocks the form after saving
- Sends notifications to workflow owner and assigned users
- Only editable fields for the user are saved (others are filtered)

### Submit Completed Form
```http
POST /api/tasks/:id/submit-form
Content-Type: application/json

{
  "formData": {
    "field1": "value1",
    "field2": "value2",
    "field3": "value3"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "data": {
    "id": "task-uuid",
    "status": "completed",
    "formData": { ... },
    "formProgress": 100,
    "completedAt": "2026-02-03T20:30:00.000Z"
  }
}
```

**Notes:**
- Marks the task as completed
- Sets formProgress to 100
- Sends completion notifications to assigned users
- Workflow continues to next step

### Check Form Access and Permissions
```http
GET /api/tasks/:id/form-access
```

**Response:**
```json
{
  "success": true,
  "data": {
    "canEdit": true,
    "reason": null,
    "editableFields": ["field1", "field2", "field3"],
    "formData": {
      "field1": "existing-value"
    },
    "formProgress": 30,
    "lockedBy": null,
    "lockedAt": null
  }
}
```

**Response when locked by another user:**
```json
{
  "success": true,
  "data": {
    "canEdit": false,
    "reason": "Form is locked by another user",
    "editableFields": [],
    "formData": { ... },
    "formProgress": 45,
    "lockedBy": "user-uuid",
    "lockedAt": "2026-02-03T20:25:00.000Z"
  }
}
```

**Notes:**
- `editableFields` contains only fields the user can edit based on field-level assignments
- If field has no `assignedUsers`, all task assignees can edit
- If field has `assignedUsers`, only those users can edit

### Get Form Lock Status
```http
GET /api/tasks/:id/lock-status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isLocked": true,
    "lockedBy": {
      "id": "user-uuid",
      "username": "john.doe",
      "firstName": "John",
      "lastName": "Doe"
    },
    "lockedAt": "2026-02-03T20:25:00.000Z",
    "formProgress": 45
  }
}
```

---

## Forms

### List All Forms
```http
GET /api/forms?isActive=true
```

### Get Form by ID
```http
GET /api/forms/:id
```

### Create Form
```http
POST /api/forms
Content-Type: application/json

{
  "name": "Purchase Request Form",
  "description": "Form for purchase requests",
  "schema": {
    "type": "object",
    "properties": {
      "amount": {
        "type": "number",
        "title": "Amount"
      },
      "description": {
        "type": "string",
        "title": "Description"
      }
    },
    "required": ["amount", "description"]
  },
  "uiSchema": {
    "amount": {
      "ui:widget": "number"
    }
  }
}
```

### Update Form
```http
PUT /api/forms/:id
Content-Type: application/json

{
  "name": "Updated form name",
  "schema": { ... }
}
```

### Delete Form
```http
DELETE /api/forms/:id
```

### Validate Form Data
```http
POST /api/forms/:id/validate
Content-Type: application/json

{
  "data": {
    "amount": 5000,
    "description": "Test"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "data": { ... }
  }
}
```

Or if validation fails:
```json
{
  "success": true,
  "data": {
    "valid": false,
    "errors": [
      {
        "field": "amount",
        "message": "Amount is required"
      }
    ]
  }
}
```

### Render Form
```http
GET /api/forms/:id/render
```

---

## Admin

### Get All Instances
```http
GET /api/admin/instances?status=running&page=1&limit=50
```

**Query Parameters:**
- `status` - Filter by status
- `workflowId` - Filter by workflow
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

### Get All Tasks
```http
GET /api/admin/tasks?status=pending&page=1&limit=50
```

### Get Workflow Analytics
```http
GET /api/admin/analytics?startDate=2024-01-01&endDate=2024-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "instances": {
      "total": 100,
      "completed": 80,
      "failed": 5,
      "running": 15
    },
    "tasks": {
      "total": 500,
      "completed": 400,
      "pending": 100
    },
    "workflowPerformance": [
      {
        "workflowId": "uuid",
        "count": 50,
        "workflow": {
          "name": "Purchase Request"
        }
      }
    ]
  }
}
```

### Get Instance History
```http
GET /api/admin/instances/:instanceId/history
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "history-uuid",
      "instanceId": "instance-uuid",
      "stepName": "approval-step",
      "action": "task_completed",
      "userId": "user-uuid",
      "data": { ... },
      "timestamp": "2024-01-22T10:00:00.000Z"
    }
  ]
}
```

### Get System Statistics
```http
GET /api/admin/statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workflows": 10,
    "activeWorkflows": 8,
    "totalInstances": 100,
    "runningInstances": 15,
    "totalTasks": 500,
    "pendingTasks": 50,
    "users": 25
  }
}
```

### Get All Users
```http
GET /api/admin/users
```

---

## Users

### Get User Basic Info
Get basic information about a user (available to all authenticated users).

```http
GET /api/users/basic/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "username": "john.doe",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "service": "IT",
    "role": "user"
  }
}
```

**Use case:** Get email and details of a user when double-clicking on assigned user in a task.

### Get Users by IDs (Bulk Fetch)
Get multiple users at once by their IDs.

```http
GET /api/users/by-ids?ids=uuid1,uuid2,uuid3
```

**Query Parameters:**
- `ids` - Comma-separated list of user UUIDs

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid1",
      "username": "user1",
      "email": "user1@example.com",
      "firstName": "First",
      "lastName": "User",
      "service": "Finance",
      "role": "user",
      "status": "approved"
    },
    {
      "id": "uuid2",
      "username": "user2",
      "email": "user2@example.com",
      "firstName": "Second",
      "lastName": "User",
      "service": "HR",
      "role": "manager",
      "status": "approved"
    }
  ]
}
```

**Use case:** Load details of all users in `assignedUsers` array.

---

## Workflow Definition Schema

A workflow is defined by steps and transitions:

```json
{
  "steps": [
    {
      "id": "unique-step-id",
      "type": "start|task|approval|condition|timer|end",
      "name": "Step Name",
      "config": {
        // Step-specific configuration
      }
    }
  ],
  "transitions": [
    {
      "from": "step-id",
      "to": "next-step-id",
      "condition": "true|false|default"
    }
  ]
}
```

### Step Types

#### Start
```json
{
  "id": "start",
  "type": "start",
  "name": "Start"
}
```

#### Task
```json
{
  "id": "task-1",
  "type": "task",
  "name": "Submit Form",
  "config": {
    "formId": "form-uuid",
    "assignedTo": "user-uuid",
    "priority": "medium|high|low",
    "dueDate": "2024-01-25T10:00:00.000Z",
    "instructions": "Please fill out the form"
  }
}
```

#### Approval
```json
{
  "id": "approval-1",
  "type": "approval",
  "name": "Manager Approval",
  "config": {
    "approvers": ["user-uuid-1", "user-uuid-2"],
    "approvalType": "sequential|parallel",
    "priority": "high"
  }
}
```

#### Condition
```json
{
  "id": "condition-1",
  "type": "condition",
  "name": "Check Amount",
  "config": {
    "condition": {
      "field": "amount",
      "operator": "greaterThan|lessThan|equals|notEquals|contains",
      "value": 10000
    }
  }
}
```

#### Timer
```json
{
  "id": "timer-1",
  "type": "timer",
  "name": "Wait 24 Hours",
  "config": {
    "delay": 86400000
  }
}
```

#### End
```json
{
  "id": "end",
  "type": "end",
  "name": "End"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## RabbitMQ Integration

The system publishes events to RabbitMQ queues:

### Queues

- `workflow.events` - Workflow lifecycle events
- `task.queue` - Task events
- `enterprise.bus` - Enterprise integration events
- `local.bus` - Local event processing

### Event Types

**Workflow Events:**
- `workflow.started`
- `workflow.completed`
- `workflow.failed`
- `workflow.cancelled`
- `step.completed`

**Task Events:**
- `task.created`
- `task.assigned`
- `task.reassigned`
- `task.completed`
- `task.rejected`

---

## WebSocket Support

Coming soon - real-time updates for workflow and task status changes.

---

## Rate Limiting

Currently no rate limiting. In production, implement rate limiting per user/IP.

---

## Pagination

For endpoints returning lists, use:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50, max: 100)

Response includes:
```json
{
  "total": 100,
  "page": 1,
  "totalPages": 2
}
```
