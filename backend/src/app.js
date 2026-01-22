const express = require('express');
const cors = require('cors');
const winston = require('winston');

// Import routes
const workflowRoutes = require('./routes/workflow.routes');
const taskRoutes = require('./routes/task.routes');
const formRoutes = require('./routes/form.routes');
const adminRoutes = require('./routes/admin.routes');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Simple auth middleware (mock - replace with real JWT auth)
app.use((req, res, next) => {
  // For demo purposes, add a mock user
  // In production, validate JWT token here
  const authHeader = req.headers.authorization;
  if (authHeader) {
    req.user = { id: 'demo-user-id', role: 'admin' };
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/workflows', workflowRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
