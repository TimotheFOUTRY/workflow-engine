const { sequelize } = require('../config/database');
const User = require('../models/user.model');
const Workflow = require('../models/workflow.model');
const WorkflowInstance = require('../models/workflowInstance.model');
const Task = require('../models/task.model');
const Form = require('../models/form.model');

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...');

    // 1. Create Admin User (if not exists)
    console.log('\n📋 Creating admin user...');
    let admin = await User.findOne({ where: { email: 'admin@workflow.com' } });
    
    if (!admin) {
      admin = await User.create({
        username: 'admin',
        email: 'admin@workflow.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        status: 'approved',
        isActive: true
      });
      console.log('  ✓ Admin user created (admin@workflow.com / admin123)');
    } else {
      console.log('  ✓ Admin user already exists');
    }

    // 2. Create Test Users
    console.log('\n📋 Creating test users...');
    const testUsers = [
      {
        username: 'john_doe',
        email: 'john.doe@workflow.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        status: 'approved',
        isActive: true
      },
      {
        username: 'jane_smith',
        email: 'jane.smith@workflow.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'user',
        status: 'approved',
        isActive: true
      },
      {
        username: 'bob_manager',
        email: 'bob.manager@workflow.com',
        password: 'password123',
        firstName: 'Bob',
        lastName: 'Manager',
        role: 'manager',
        status: 'approved',
        isActive: true
      },
      {
        username: 'alice_pending',
        email: 'alice.pending@workflow.com',
        password: 'password123',
        firstName: 'Alice',
        lastName: 'Pending',
        role: 'user',
        status: 'pending',
        isActive: true
      }
    ];

    for (const userData of testUsers) {
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (!existingUser) {
        await User.create(userData);
        console.log(`  ✓ User created: ${userData.email}`);
      } else {
        console.log(`  - User already exists: ${userData.email}`);
      }
    }

    // 3. Create Test Forms
    console.log('\n📋 Creating test forms...');
    const forms = [
      {
        name: 'Demande de congés',
        description: 'Formulaire de demande de congés',
        schema: {
          type: 'object',
          properties: {
            startDate: { type: 'string', format: 'date', title: 'Date de début' },
            endDate: { type: 'string', format: 'date', title: 'Date de fin' },
            reason: { type: 'string', title: 'Motif', maxLength: 500 },
            type: { 
              type: 'string', 
              title: 'Type de congé',
              enum: ['paid', 'unpaid', 'sick', 'parental']
            }
          },
          required: ['startDate', 'endDate', 'type']
        },
        uiSchema: {
          reason: { 'ui:widget': 'textarea' },
          type: {
            'ui:widget': 'select',
            'ui:options': {
              labels: {
                paid: 'Congés payés',
                unpaid: 'Congés sans solde',
                sick: 'Congé maladie',
                parental: 'Congé parental'
              }
            }
          }
        },
        isActive: true
      },
      {
        name: 'Demande d\'achat',
        description: 'Formulaire de demande d\'achat de matériel',
        schema: {
          type: 'object',
          properties: {
            item: { type: 'string', title: 'Article' },
            quantity: { type: 'integer', title: 'Quantité', minimum: 1 },
            estimatedCost: { type: 'number', title: 'Coût estimé (€)' },
            justification: { type: 'string', title: 'Justification' },
            urgency: { 
              type: 'string', 
              title: 'Urgence',
              enum: ['low', 'medium', 'high', 'critical']
            }
          },
          required: ['item', 'quantity', 'estimatedCost', 'justification']
        },
        uiSchema: {
          justification: { 'ui:widget': 'textarea' }
        },
        isActive: true
      }
    ];

    const createdForms = [];
    for (const formData of forms) {
      const existingForm = await Form.findOne({ where: { name: formData.name } });
      if (!existingForm) {
        const form = await Form.create(formData);
        createdForms.push(form);
        console.log(`  ✓ Form created: ${formData.name}`);
      } else {
        createdForms.push(existingForm);
        console.log(`  - Form already exists: ${formData.name}`);
      }
    }

    // 4. Create Test Workflows
    console.log('\n📋 Creating test workflows...');
    const workflows = [
      {
        name: 'Workflow de validation de congés',
        description: 'Processus de validation des demandes de congés',
        definition: {
          nodes: [
            {
              id: 'start',
              type: 'start',
              data: { label: 'Début' },
              position: { x: 250, y: 50 }
            },
            {
              id: 'submit-request',
              type: 'userTask',
              data: { 
                label: 'Soumettre la demande',
                formId: createdForms[0]?.id
              },
              position: { x: 250, y: 150 }
            },
            {
              id: 'manager-approval',
              type: 'userTask',
              data: { 
                label: 'Approbation manager',
                assignmentType: 'role',
                assignedRole: 'manager'
              },
              position: { x: 250, y: 250 }
            },
            {
              id: 'decision',
              type: 'decision',
              data: { 
                label: 'Décision',
                condition: 'approved'
              },
              position: { x: 250, y: 350 }
            },
            {
              id: 'end',
              type: 'end',
              data: { label: 'Fin' },
              position: { x: 250, y: 450 }
            }
          ],
          edges: [
            { id: 'e1', source: 'start', target: 'submit-request' },
            { id: 'e2', source: 'submit-request', target: 'manager-approval' },
            { id: 'e3', source: 'manager-approval', target: 'decision' },
            { id: 'e4', source: 'decision', target: 'end', label: 'Approved' },
            { id: 'e5', source: 'decision', target: 'end', label: 'Rejected' }
          ]
        },
        version: 1,
        isActive: true,
        createdBy: admin.id
      },
      {
        name: 'Workflow d\'achat',
        description: 'Processus de validation des demandes d\'achat',
        definition: {
          nodes: [
            {
              id: 'start',
              type: 'start',
              data: { label: 'Début' },
              position: { x: 250, y: 50 }
            },
            {
              id: 'submit',
              type: 'userTask',
              data: { 
                label: 'Soumettre la demande',
                formId: createdForms[1]?.id
              },
              position: { x: 250, y: 150 }
            },
            {
              id: 'check-amount',
              type: 'decision',
              data: { 
                label: 'Vérifier le montant',
                condition: 'amount > 1000'
              },
              position: { x: 250, y: 250 }
            },
            {
              id: 'manager-approval',
              type: 'userTask',
              data: { 
                label: 'Approbation manager',
                assignmentType: 'role',
                assignedRole: 'manager'
              },
              position: { x: 100, y: 350 }
            },
            {
              id: 'admin-approval',
              type: 'userTask',
              data: { 
                label: 'Approbation admin',
                assignmentType: 'role',
                assignedRole: 'admin'
              },
              position: { x: 400, y: 350 }
            },
            {
              id: 'end',
              type: 'end',
              data: { label: 'Fin' },
              position: { x: 250, y: 450 }
            }
          ],
          edges: [
            { id: 'e1', source: 'start', target: 'submit' },
            { id: 'e2', source: 'submit', target: 'check-amount' },
            { id: 'e3', source: 'check-amount', target: 'manager-approval', label: '< 1000€' },
            { id: 'e4', source: 'check-amount', target: 'admin-approval', label: '≥ 1000€' },
            { id: 'e5', source: 'manager-approval', target: 'end' },
            { id: 'e6', source: 'admin-approval', target: 'end' }
          ]
        },
        version: 1,
        isActive: true,
        createdBy: admin.id
      }
    ];

    const createdWorkflows = [];
    for (const workflowData of workflows) {
      const existingWorkflow = await Workflow.findOne({ where: { name: workflowData.name } });
      if (!existingWorkflow) {
        const workflow = await Workflow.create(workflowData);
        createdWorkflows.push(workflow);
        console.log(`  ✓ Workflow created: ${workflowData.name}`);
      } else {
        createdWorkflows.push(existingWorkflow);
        console.log(`  - Workflow already exists: ${workflowData.name}`);
      }
    }

    // 5. Create Sample Workflow Instances and Tasks
    console.log('\n📋 Creating sample workflow instances and tasks...');
    
    const john = await User.findOne({ where: { email: 'john.doe@workflow.com' } });
    const bob = await User.findOne({ where: { email: 'bob.manager@workflow.com' } });
    
    if (createdWorkflows.length > 0 && john && bob) {
      // Instance 1: Running workflow
      const instance1 = await WorkflowInstance.findOne({ 
        where: { 
          workflowId: createdWorkflows[0].id,
          status: 'running'
        } 
      });
      
      if (!instance1) {
        const newInstance1 = await WorkflowInstance.create({
          workflowId: createdWorkflows[0].id,
          status: 'running',
          currentStep: 'manager-approval',
          instanceData: {
            startDate: '2026-02-15',
            endDate: '2026-02-20',
            reason: 'Vacances familiales',
            type: 'paid'
          },
          startedBy: john.id,
          startedAt: new Date()
        });

        await Task.create({
          instanceId: newInstance1.id,
          assignedTo: bob.id,
          taskType: 'approval',
          status: 'pending',
          priority: 'medium',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          taskData: {
            requestedBy: 'John Doe',
            type: 'Congés payés',
            duration: '5 jours'
          }
        });
        
        console.log('  ✓ Sample running instance created with pending task');
      }

      // Instance 2: Completed workflow
      const instance2 = await WorkflowInstance.findOne({ 
        where: { 
          workflowId: createdWorkflows[0].id,
          status: 'completed'
        } 
      });
      
      if (!instance2) {
        const newInstance2 = await WorkflowInstance.create({
          workflowId: createdWorkflows[0].id,
          status: 'completed',
          currentStep: 'end',
          instanceData: {
            startDate: '2026-01-10',
            endDate: '2026-01-15',
            reason: 'Rendez-vous médical',
            type: 'sick'
          },
          startedBy: john.id,
          startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
        });

        await Task.create({
          instanceId: newInstance2.id,
          assignedTo: bob.id,
          taskType: 'approval',
          status: 'completed',
          priority: 'medium',
          taskData: {
            requestedBy: 'John Doe',
            type: 'Congé maladie'
          },
          decision: 'approved',
          completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
        });
        
        console.log('  ✓ Sample completed instance created');
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✓ Test data seeding completed successfully!');
    console.log('='.repeat(50));
    console.log('\n📧 Available test accounts:');
    console.log('  Admin:    admin@workflow.com / admin123');
    console.log('  Manager:  bob.manager@workflow.com / password123');
    console.log('  User 1:   john.doe@workflow.com / password123');
    console.log('  User 2:   jane.smith@workflow.com / password123');
    console.log('  Pending:  alice.pending@workflow.com / password123');
    console.log('\n⚠️  IMPORTANT: Change passwords in production!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  }
}

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    await seedTestData();

    console.log('\n✓ All seeds completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

run();
