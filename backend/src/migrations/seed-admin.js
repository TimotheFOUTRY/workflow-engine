const { sequelize } = require('../config/database');
const User = require('../models/user.model');

async function seedAdminUser() {
  try {
    console.log('🌱 Seeding admin user...');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      where: { email: 'admin@workflow.com' }
    });

    if (existingAdmin) {
      console.log('✓ Admin user already exists');
      return;
    }

    // Create admin user
    await User.create({
      username: 'admin',
      email: 'admin@workflow.com',
      password: 'admin123', // Will be hashed by the model hook
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'approved',
      isActive: true
    });

    console.log('✓ Admin user created successfully');
    console.log('  Email: admin@workflow.com');
    console.log('  Password: admin123');
    console.log('  ⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    throw error;
  }
}

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    await seedAdminUser();

    console.log('✓ Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

run();
