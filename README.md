# Workflow Engine - No-Code/Low-Code Automation Platform

A complete Nintex-like workflow automation platform built with React, Node.js, PostgreSQL, and RabbitMQ.

![Workflow Engine](https://img.shields.io/badge/status-production--ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🌟 Features

### Core Capabilities
- **Visual Workflow Designer** - Drag & drop workflow builder with React Flow
- **Dynamic Form Builder** - Create custom forms with validation rules
- **Multi-Level Approvals** - Sequential and parallel approval workflows
- **Task Management** - Assign, track, and complete tasks
- **Real-Time Monitoring** - Track workflow execution and performance
- **Enterprise Integration** - RabbitMQ message bus for external systems
- **Admin Dashboard** - Analytics and system monitoring

### Workflow Features
- 🎯 **Node Types**: Start, Task, Approval, Condition, Timer, End
- 🔀 **Conditional Branching**: Dynamic routing based on data
- ⏱️ **Timer Support**: Scheduled workflow execution
- 📝 **Task Assignments**: Assign to users or roles
- ✅ **Approval Chains**: Multi-step approval processes
- 📊 **Audit Trail**: Complete history of all actions

### Form Features
- 📝 **Field Types**: Text, Number, Date, Email, Dropdown, Checkbox, Radio, Textarea, File Upload
- ✔️ **Validation**: Required, Min/Max length, Pattern matching, Custom rules
- 👁️ **Live Preview**: See forms as you build them
- 🎨 **UI Schema**: Configure field display properties
- 🔄 **Conditional Logic**: Show/hide fields based on values

## 📋 Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  React Frontend │ ───▶ │  Node.js Backend│ ───▶ │   PostgreSQL    │
│   (Port 3000)   │      │   (Port 3001)   │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │    RabbitMQ     │
                         │  (Ports 5672,   │
                         │      15672)     │
                         └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 15+ (for local development)
- RabbitMQ 3+ (for local development)

### Using Docker (Recommended)

1. **Clone the repository**
```bash
git clone https://github.com/TimotheFOUTRY/workflow-engine.git
cd workflow-engine
```

2. **Start all services**
```bash
docker-compose up -d
```

3. **Access the application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **RabbitMQ Management**: http://localhost:15672 (username: workflow, password: workflow123)

4. **Initialize database** (first time only)
```bash
# Using Docker Compose
docker-compose exec backend npm run migrate

# Or using Make (recommended)
make migrate
make seed-test  # Fills database with test data including admin@workflow.com / admin123
```

**Default admin credentials**: `admin@workflow.com` / `admin123` ⚠️ Change in production!

### Local Development

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run migrate
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📚 Project Structure

```
workflow-engine/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & RabbitMQ configuration
│   │   ├── models/          # Sequelize models
│   │   ├── services/        # Business logic
│   │   │   ├── workflowEngine.js  # Core workflow execution
│   │   │   ├── taskService.js     # Task management
│   │   │   ├── queueService.js    # RabbitMQ integration
│   │   │   └── formService.js     # Form handling
│   │   ├── controllers/     # API controllers
│   │   ├── routes/          # Express routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── migrations/      # Database migrations
│   │   └── utils/           # Helper functions
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/           # Main layout
│   │   │   ├── WorkflowDesigner/ # Visual workflow builder
│   │   │   ├── FormBuilder/      # Visual form builder
│   │   │   ├── TaskManager/      # Task management UI
│   │   │   └── Monitoring/       # Admin monitoring
│   │   ├── pages/           # Main pages
│   │   ├── services/        # API client services
│   │   └── utils/           # Helper functions
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🎯 Usage Examples

### Creating a Workflow

1. **Navigate to Workflows** → Click "Create Workflow"
2. **Drag nodes** from the palette to the canvas
3. **Connect nodes** by dragging from output to input handles
4. **Configure nodes** by clicking them and setting properties
5. **Save** your workflow

### Example: Purchase Request Approval Workflow

```json
{
  "name": "Purchase Request Approval",
  "description": "Multi-level approval for purchase requests",
  "steps": [
    {
      "id": "start",
      "type": "start",
      "name": "Start"
    },
    {
      "id": "submit-form",
      "type": "task",
      "name": "Submit Purchase Request",
      "config": {
        "formId": "purchase-request-form",
        "assignedTo": "requester"
      }
    },
    {
      "id": "check-amount",
      "type": "condition",
      "name": "Check Amount",
      "config": {
        "condition": {
          "field": "amount",
          "operator": "greaterThan",
          "value": 10000
        }
      }
    },
    {
      "id": "manager-approval",
      "type": "approval",
      "name": "Manager Approval",
      "config": {
        "approvers": ["manager-id"],
        "approvalType": "sequential"
      }
    },
    {
      "id": "cfo-approval",
      "type": "approval",
      "name": "CFO Approval",
      "config": {
        "approvers": ["cfo-id"],
        "approvalType": "sequential"
      }
    },
    {
      "id": "end",
      "type": "end",
      "name": "End"
    }
  ],
  "transitions": [
    { "from": "start", "to": "submit-form" },
    { "from": "submit-form", "to": "check-amount" },
    { "from": "check-amount", "to": "manager-approval", "condition": "false" },
    { "from": "check-amount", "to": "cfo-approval", "condition": "true" },
    { "from": "manager-approval", "to": "end" },
    { "from": "cfo-approval", "to": "manager-approval" }
  ]
}
```

### Starting a Workflow Instance

```javascript
// Via API
POST /api/workflows/{workflowId}/start
{
  "data": {
    "amount": 15000,
    "description": "New laptop purchase",
    "category": "IT Equipment"
  }
}

// Or via UI
// Navigate to Workflows → Select workflow → Click "Start"
```

## 🔌 API Documentation

### Workflows

- `GET /api/workflows` - List all workflows
- `GET /api/workflows/:id` - Get workflow by ID
- `POST /api/workflows` - Create workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `POST /api/workflows/:id/start` - Start workflow instance
- `GET /api/workflows/:id/instances` - Get workflow instances

### Tasks

- `GET /api/tasks/my-tasks` - Get tasks for current user
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks/:id/complete` - Complete a task
- `POST /api/tasks/:id/reassign` - Reassign a task
- `GET /api/tasks/statistics` - Get task statistics

### Forms

- `GET /api/forms` - List all forms
- `GET /api/forms/:id` - Get form by ID
- `POST /api/forms` - Create form
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form
- `POST /api/forms/:id/validate` - Validate form data

### Admin

- `GET /api/admin/instances` - Get all workflow instances
- `GET /api/admin/tasks` - Get all tasks
- `GET /api/admin/analytics` - Get workflow analytics
- `GET /api/admin/statistics` - Get system statistics
- `GET /api/admin/instances/:id/history` - Get instance history

See [docs/API.md](./docs/API.md) for complete API documentation.

## 🎨 UI Components

### User Dashboard
- Task statistics and metrics
- Recent tasks list
- Task filtering by status
- Quick actions for pending tasks

### Workflow Designer
- Drag & drop canvas
- Node palette with 6 node types
- Node configuration panel
- Connection editor for transitions
- Save/load workflows

### Form Builder
- Drag & drop form fields
- 9 field types supported
- Field validation configuration
- Live form preview
- Save/load forms

### Admin Dashboard
- System statistics
- Workflow performance analytics
- Instance monitoring
- User management
- Audit logs

## 🔐 Security

- **JWT Authentication** (to be implemented)
- **Role-based Access Control**
- **Input Validation** with Joi
- **SQL Injection Protection** via Sequelize ORM
- **XSS Protection** via React
- **CORS Configuration**
- **Environment Variables** for sensitive data

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📊 Monitoring & Logging

- **Winston** for backend logging
- **Console logging** for frontend (development)
- **RabbitMQ Management UI** for queue monitoring
- **Health check endpoint**: `GET /health`

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
docker-compose exec backend npm run migrate
```

### RabbitMQ Connection Issues
```bash
# Check if RabbitMQ is running
docker-compose ps rabbitmq

# View logs
docker-compose logs rabbitmq

# Restart RabbitMQ
docker-compose restart rabbitmq
```

### Frontend Build Issues
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/TimotheFOUTRY/workflow-engine/issues)
- **Discussions**: [GitHub Discussions](https://github.com/TimotheFOUTRY/workflow-engine/discussions)

## 🗺️ Roadmap

- [ ] User authentication & authorization
- [ ] Workflow versioning
- [ ] Workflow templates library
- [ ] Email notifications
- [ ] Webhook support
- [ ] REST API connectors
- [ ] Scheduled workflows
- [ ] Workflow testing framework
- [ ] Mobile app
- [ ] Internationalization (i18n)

## 🙏 Acknowledgments

- Inspired by Nintex and Microsoft Power Automate
- Built with React, Node.js, PostgreSQL, and RabbitMQ
- Uses React Flow for visual workflow design
- Uses Recharts for data visualization

---

**Made with ❤️ by the Workflow Engine Team**
