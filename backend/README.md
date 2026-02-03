# Backend - Workflow Engine API

Node.js/Express backend for the workflow automation platform.

## Features

- **RESTful API** - Complete REST API for all operations
- **PostgreSQL Database** - Relational data storage with Sequelize ORM
- **RabbitMQ Integration** - Message queue for async operations
- **Workflow Engine** - Core workflow execution logic
- **Task Management** - Task creation, assignment, and completion
- **Form Validation** - Dynamic form validation with Joi
- **Audit Logging** - Complete history of all actions

## Tech Stack

- **Node.js** 18+
- **Express** 4.x - Web framework
- **Sequelize** 6.x - ORM for PostgreSQL
- **PostgreSQL** 15+ - Database
- **RabbitMQ** 3.x - Message broker
- **Winston** - Logging
- **Joi** - Validation

## Setup

### Installation

```bash
npm install
```

### Configuration

```bash
cp .env.example .env
# Edit .env with your settings
```

### Database Migration

```bash
npm run migrate
```

### Start Server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3001`

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm run migrate` - Run database migrations
- `npm test` - Run tests
- `npm run lint` - Run linter

## API Documentation

See [API.md](../docs/API.md) for complete API reference.

## License

MIT
