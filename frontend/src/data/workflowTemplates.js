// Workflow Templates for ReactFlow Designer
// These can be imported into the Designer to create pre-configured workflows

export const workflowTemplates = {
  // Simple Approval Workflow
  simpleApproval: {
    name: "Simple Approval Workflow",
    description: "Basic one-level approval process",
    definition: {
      nodes: [
        {
          id: "start-1",
          type: "start",
          position: { x: 250, y: 50 },
          data: { label: "Start Request", config: {} }
        },
        {
          id: "task-1",
          type: "task",
          position: { x: 250, y: 150 },
          data: { 
            label: "Submit Request",
            config: {
              assignedTo: "requester",
              formId: "",
              priority: "medium",
              dueDays: 1
            }
          }
        },
        {
          id: "approval-1",
          type: "approval",
          position: { x: 250, y: 280 },
          data: { 
            label: "Manager Approval",
            config: {
              assignedTo: "manager",
              priority: "high",
              dueDays: 3
            }
          }
        },
        {
          id: "condition-1",
          type: "condition",
          position: { x: 250, y: 410 },
          data: { 
            label: "Approved?",
            config: {
              expression: "data.approved === true",
              truePath: "Approved",
              falsePath: "Rejected"
            }
          }
        },
        {
          id: "task-2",
          type: "task",
          position: { x: 100, y: 540 },
          data: { 
            label: "Process Request",
            config: {
              assignedTo: "processor",
              priority: "medium",
              dueDays: 5
            }
          }
        },
        {
          id: "task-3",
          type: "task",
          position: { x: 400, y: 540 },
          data: { 
            label: "Notify Rejection",
            config: {
              assignedTo: "system",
              priority: "low",
              dueDays: 1
            }
          }
        },
        {
          id: "end-1",
          type: "end",
          position: { x: 250, y: 670 },
          data: { label: "Complete", config: {} }
        }
      ],
      edges: [
        { id: "e1", source: "start-1", target: "task-1", type: "smoothstep", animated: true },
        { id: "e2", source: "task-1", target: "approval-1", type: "smoothstep", animated: true },
        { id: "e3", source: "approval-1", target: "condition-1", type: "smoothstep", animated: true },
        { 
          id: "e4", 
          source: "condition-1", 
          target: "task-2", 
          type: "smoothstep", 
          animated: true,
          label: "Approved"
        },
        { 
          id: "e5", 
          source: "condition-1", 
          target: "task-3", 
          type: "smoothstep", 
          animated: true,
          label: "Rejected"
        },
        { id: "e6", source: "task-2", target: "end-1", type: "smoothstep", animated: true },
        { id: "e7", source: "task-3", target: "end-1", type: "smoothstep", animated: true }
      ]
    }
  },

  // Multi-Stage Approval
  multiStageApproval: {
    name: "Multi-Stage Approval Workflow",
    description: "Three-level hierarchical approval process",
    definition: {
      nodes: [
        {
          id: "start-1",
          type: "start",
          position: { x: 300, y: 50 },
          data: { label: "Start", config: {} }
        },
        {
          id: "task-1",
          type: "task",
          position: { x: 300, y: 150 },
          data: { 
            label: "Submit Expense Report",
            config: {
              assignedTo: "employee",
              priority: "medium",
              dueDays: 1
            }
          }
        },
        {
          id: "approval-1",
          type: "approval",
          position: { x: 300, y: 270 },
          data: { 
            label: "Team Lead Approval",
            config: {
              assignedTo: "team_lead",
              priority: "high",
              dueDays: 2
            }
          }
        },
        {
          id: "condition-1",
          type: "condition",
          position: { x: 300, y: 390 },
          data: { 
            label: "Amount > $1000?",
            config: {
              expression: "data.amount > 1000"
            }
          }
        },
        {
          id: "approval-2",
          type: "approval",
          position: { x: 500, y: 510 },
          data: { 
            label: "Manager Approval",
            config: {
              assignedTo: "manager",
              priority: "high",
              dueDays: 3
            }
          }
        },
        {
          id: "approval-3",
          type: "approval",
          position: { x: 500, y: 630 },
          data: { 
            label: "Director Approval",
            config: {
              assignedTo: "director",
              priority: "urgent",
              dueDays: 5
            }
          }
        },
        {
          id: "task-2",
          type: "task",
          position: { x: 300, y: 750 },
          data: { 
            label: "Process Payment",
            config: {
              assignedTo: "finance",
              priority: "high",
              dueDays: 2
            }
          }
        },
        {
          id: "end-1",
          type: "end",
          position: { x: 300, y: 870 },
          data: { label: "Complete", config: {} }
        }
      ],
      edges: [
        { id: "e1", source: "start-1", target: "task-1", type: "smoothstep", animated: true },
        { id: "e2", source: "task-1", target: "approval-1", type: "smoothstep", animated: true },
        { id: "e3", source: "approval-1", target: "condition-1", type: "smoothstep", animated: true },
        { 
          id: "e4", 
          source: "condition-1", 
          target: "task-2", 
          type: "smoothstep", 
          animated: true,
          label: "≤ $1000"
        },
        { 
          id: "e5", 
          source: "condition-1", 
          target: "approval-2", 
          type: "smoothstep", 
          animated: true,
          label: "> $1000"
        },
        { id: "e6", source: "approval-2", target: "approval-3", type: "smoothstep", animated: true },
        { id: "e7", source: "approval-3", target: "task-2", type: "smoothstep", animated: true },
        { id: "e8", source: "task-2", target: "end-1", type: "smoothstep", animated: true }
      ]
    }
  },

  // Timer-based Workflow
  scheduledWorkflow: {
    name: "Scheduled Task Workflow",
    description: "Workflow with timed delays and reminders",
    definition: {
      nodes: [
        {
          id: "start-1",
          type: "start",
          position: { x: 250, y: 50 },
          data: { label: "Start", config: {} }
        },
        {
          id: "task-1",
          type: "task",
          position: { x: 250, y: 150 },
          data: { 
            label: "Assign Task",
            config: {
              assignedTo: "user",
              priority: "medium",
              dueDays: 7
            }
          }
        },
        {
          id: "timer-1",
          type: "timer",
          position: { x: 250, y: 270 },
          data: { 
            label: "Wait 5 Days",
            config: {
              duration: 5,
              unit: "days"
            }
          }
        },
        {
          id: "condition-1",
          type: "condition",
          position: { x: 250, y: 390 },
          data: { 
            label: "Task Complete?",
            config: {
              expression: "data.taskStatus === 'completed'"
            }
          }
        },
        {
          id: "task-2",
          type: "task",
          position: { x: 450, y: 510 },
          data: { 
            label: "Send Reminder",
            config: {
              assignedTo: "system",
              priority: "low",
              dueDays: 1
            }
          }
        },
        {
          id: "end-1",
          type: "end",
          position: { x: 100, y: 510 },
          data: { label: "Complete", config: {} }
        },
        {
          id: "timer-2",
          type: "timer",
          position: { x: 450, y: 630 },
          data: { 
            label: "Wait 2 Days",
            config: {
              duration: 2,
              unit: "days"
            }
          }
        }
      ],
      edges: [
        { id: "e1", source: "start-1", target: "task-1", type: "smoothstep", animated: true },
        { id: "e2", source: "task-1", target: "timer-1", type: "smoothstep", animated: true },
        { id: "e3", source: "timer-1", target: "condition-1", type: "smoothstep", animated: true },
        { 
          id: "e4", 
          source: "condition-1", 
          target: "end-1", 
          type: "smoothstep", 
          animated: true,
          label: "Complete"
        },
        { 
          id: "e5", 
          source: "condition-1", 
          target: "task-2", 
          type: "smoothstep", 
          animated: true,
          label: "Pending"
        },
        { id: "e6", source: "task-2", target: "timer-2", type: "smoothstep", animated: true },
        { id: "e7", source: "timer-2", target: "condition-1", type: "smoothstep", animated: true }
      ]
    }
  },

  // Parallel Processing
  parallelWorkflow: {
    name: "Parallel Processing Workflow",
    description: "Execute multiple tasks in parallel",
    definition: {
      nodes: [
        {
          id: "start-1",
          type: "start",
          position: { x: 300, y: 50 },
          data: { label: "Start", config: {} }
        },
        {
          id: "task-1",
          type: "task",
          position: { x: 300, y: 150 },
          data: { 
            label: "Split Work",
            config: {
              assignedTo: "coordinator",
              priority: "high",
              dueDays: 1
            }
          }
        },
        {
          id: "task-2",
          type: "task",
          position: { x: 100, y: 280 },
          data: { 
            label: "Review Legal",
            config: {
              assignedTo: "legal",
              priority: "high",
              dueDays: 3
            }
          }
        },
        {
          id: "task-3",
          type: "task",
          position: { x: 300, y: 280 },
          data: { 
            label: "Review Finance",
            config: {
              assignedTo: "finance",
              priority: "high",
              dueDays: 3
            }
          }
        },
        {
          id: "task-4",
          type: "task",
          position: { x: 500, y: 280 },
          data: { 
            label: "Review Technical",
            config: {
              assignedTo: "tech",
              priority: "high",
              dueDays: 3
            }
          }
        },
        {
          id: "task-5",
          type: "task",
          position: { x: 300, y: 410 },
          data: { 
            label: "Merge Results",
            config: {
              assignedTo: "coordinator",
              priority: "medium",
              dueDays: 2
            }
          }
        },
        {
          id: "approval-1",
          type: "approval",
          position: { x: 300, y: 530 },
          data: { 
            label: "Final Approval",
            config: {
              assignedTo: "director",
              priority: "urgent",
              dueDays: 2
            }
          }
        },
        {
          id: "end-1",
          type: "end",
          position: { x: 300, y: 650 },
          data: { label: "Complete", config: {} }
        }
      ],
      edges: [
        { id: "e1", source: "start-1", target: "task-1", type: "smoothstep", animated: true },
        { id: "e2", source: "task-1", target: "task-2", type: "smoothstep", animated: true },
        { id: "e3", source: "task-1", target: "task-3", type: "smoothstep", animated: true },
        { id: "e4", source: "task-1", target: "task-4", type: "smoothstep", animated: true },
        { id: "e5", source: "task-2", target: "task-5", type: "smoothstep", animated: true },
        { id: "e6", source: "task-3", target: "task-5", type: "smoothstep", animated: true },
        { id: "e7", source: "task-4", target: "task-5", type: "smoothstep", animated: true },
        { id: "e8", source: "task-5", target: "approval-1", type: "smoothstep", animated: true },
        { id: "e9", source: "approval-1", target: "end-1", type: "smoothstep", animated: true }
      ]
    }
  }
};

// Helper function to load a template
export const loadTemplate = (templateName) => {
  const template = workflowTemplates[templateName];
  if (!template) {
    throw new Error(`Template "${templateName}" not found`);
  }
  return {
    ...template,
    definition: {
      ...template.definition,
      edges: template.definition.edges.map(edge => ({
        ...edge,
        style: { stroke: '#6366f1', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: '#6366f1' }
      }))
    }
  };
};

// Get list of available templates
export const getTemplateList = () => {
  return Object.keys(workflowTemplates).map(key => ({
    id: key,
    name: workflowTemplates[key].name,
    description: workflowTemplates[key].description
  }));
};
