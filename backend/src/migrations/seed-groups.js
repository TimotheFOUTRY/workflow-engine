const { sequelize } = require('../config/database');
const { Group, User } = require('../models');

const seedGroups = async () => {
  try {
    console.log('🌱 Starting group seeding...');
    
    // Get all users to assign to groups
    const users = await User.findAll();
    
    if (users.length === 0) {
      console.log('⚠️ No users found. Please seed users first.');
      process.exit(1);
    }
    
    const admin = users.find(u => u.role === 'admin');
    const regularUsers = users.filter(u => u.role === 'user');
    
    // Group 1: Public group created by admin
    const [publicGroup, publicCreated] = await Group.findOrCreate({
      where: { name: 'Équipe Développement' },
      defaults: {
        name: 'Équipe Développement',
        description: 'Groupe public pour tous les développeurs de l\'entreprise',
        isPublic: true,
        createdBy: admin.id,
        members: [admin.id, ...regularUsers.slice(0, 3).map(u => u.id)],
      },
    });
    
    if (publicCreated) {
      console.log('✅ Created public group: Équipe Développement');
    } else {
      console.log('ℹ️ Public group already exists: Équipe Développement');
    }
    
    // Group 2: Private group created by admin
    const [adminPrivateGroup, adminPrivateCreated] = await Group.findOrCreate({
      where: { name: 'Administrateurs' },
      defaults: {
        name: 'Administrateurs',
        description: 'Groupe privé pour les administrateurs système',
        isPublic: false,
        createdBy: admin.id,
        members: [admin.id],
      },
    });
    
    if (adminPrivateCreated) {
      console.log('✅ Created admin private group: Administrateurs');
    } else {
      console.log('ℹ️ Admin private group already exists: Administrateurs');
    }
    
    // Group 3: Private group created by regular user
    if (regularUsers.length > 0) {
      const user1 = regularUsers[0];
      const [userPrivateGroup, userPrivateCreated] = await Group.findOrCreate({
        where: { name: 'Mon Équipe' },
        defaults: {
          name: 'Mon Équipe',
          description: 'Groupe personnel pour mes projets',
          isPublic: false,
          createdBy: user1.id,
          members: [user1.id, ...regularUsers.slice(1, 2).map(u => u.id)],
        },
      });
      
      if (userPrivateCreated) {
        console.log('✅ Created user private group: Mon Équipe');
      } else {
        console.log('ℹ️ User private group already exists: Mon Équipe');
      }
    }
    
    // Group 4: Another public group by admin
    const [publicGroup2, publicCreated2] = await Group.findOrCreate({
      where: { name: 'Design & UX' },
      defaults: {
        name: 'Design & UX',
        description: 'Groupe pour l\'équipe de design et expérience utilisateur',
        isPublic: true,
        createdBy: admin.id,
        members: [admin.id, ...regularUsers.slice(0, 2).map(u => u.id)],
      },
    });
    
    if (publicCreated2) {
      console.log('✅ Created public group: Design & UX');
    } else {
      console.log('ℹ️ Public group already exists: Design & UX');
    }
    
    console.log('\n✨ Group seeding completed successfully!');
    console.log('\nGroups created:');
    console.log('  - Équipe Développement (public)');
    console.log('  - Administrateurs (private - admin)');
    console.log('  - Mon Équipe (private - user)');
    console.log('  - Design & UX (public)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding groups:', error);
    process.exit(1);
  }
};

// Connect to database and seed
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection established');
    return seedGroups();
  })
  .catch((error) => {
    console.error('❌ Unable to connect to database:', error);
    process.exit(1);
  });
