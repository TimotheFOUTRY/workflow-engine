const { sequelize } = require('../config/database');
const models = require('../models');

const runMigrations = async () => {
  try {
    console.log('Starting database migrations...');
    
    // Sync all models with database
    // force: false means it won't drop existing tables
    // alter: true will alter tables to match models
    await sequelize.sync({ alter: true });
    
    console.log('Database migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
