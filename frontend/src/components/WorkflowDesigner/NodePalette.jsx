import React from 'react';

const nodeTypes = [
  // Core Workflow
  {
    type: 'start',
    label: 'Start',
    icon: '▶',
    color: 'bg-green-100 border-green-400 text-green-700',
    description: 'Workflow start point',
    category: 'Core',
  },
  {
    type: 'end',
    label: 'End',
    icon: '■',
    color: 'bg-red-100 border-red-400 text-red-700',
    description: 'Workflow end point',
    category: 'Core',
  },
  
  // Task Actions
  {
    type: 'task',
    label: 'Task',
    icon: '📋',
    color: 'bg-blue-100 border-blue-400 text-blue-700',
    description: 'Assign task to user',
    category: 'Tasks',
  },
  {
    type: 'approval',
    label: 'Approval',
    icon: '✓',
    color: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    description: 'Request approval',
    category: 'Tasks',
  },
  
  // Logic & Control
  {
    type: 'condition',
    label: 'Condition',
    icon: '◆',
    color: 'bg-purple-100 border-purple-400 text-purple-700',
    description: 'Conditional branching',
    category: 'Logic',
  },
  {
    type: 'switch',
    label: 'Switch',
    icon: '🔀',
    color: 'bg-indigo-100 border-indigo-400 text-indigo-700',
    description: 'Multi-way branch',
    category: 'Logic',
  },
  {
    type: 'loop',
    label: 'Loop',
    icon: '🔁',
    color: 'bg-violet-100 border-violet-400 text-violet-700',
    description: 'Loop over collection',
    category: 'Logic',
  },
  {
    type: 'parallel',
    label: 'Parallel',
    icon: '⫸',
    color: 'bg-fuchsia-100 border-fuchsia-400 text-fuchsia-700',
    description: 'Run actions in parallel',
    category: 'Logic',
  },
  {
    type: 'timer',
    label: 'Timer',
    icon: '⏱',
    color: 'bg-orange-100 border-orange-400 text-orange-700',
    description: 'Wait/delay step',
    category: 'Logic',
  },
  
  // Notifications
  {
    type: 'email',
    label: 'Send Email',
    icon: '✉️',
    color: 'bg-cyan-100 border-cyan-400 text-cyan-700',
    description: 'Send email notification',
    category: 'Notifications',
  },
  {
    type: 'notification',
    label: 'Notification',
    icon: '🔔',
    color: 'bg-pink-100 border-pink-400 text-pink-700',
    description: 'Send push notification',
    category: 'Notifications',
  },
  {
    type: 'sms',
    label: 'Send SMS',
    icon: '📱',
    color: 'bg-teal-100 border-teal-400 text-teal-700',
    description: 'Send SMS message',
    category: 'Notifications',
  },
  
  // Data Operations
  {
    type: 'variable',
    label: 'Set Variable',
    icon: '💾',
    color: 'bg-slate-100 border-slate-400 text-slate-700',
    description: 'Store/retrieve variable',
    category: 'Data',
  },
  {
    type: 'query',
    label: 'Query Data',
    icon: '🔍',
    color: 'bg-sky-100 border-sky-400 text-sky-700',
    description: 'Query list or database',
    category: 'Data',
  },
  {
    type: 'calculate',
    label: 'Calculate',
    icon: '🧮',
    color: 'bg-emerald-100 border-emerald-400 text-emerald-700',
    description: 'Math operations',
    category: 'Data',
  },
  
  // CRUD Operations
  {
    type: 'create',
    label: 'Create Item',
    icon: '➕',
    color: 'bg-green-100 border-green-500 text-green-700',
    description: 'Create new item',
    category: 'CRUD',
  },
  {
    type: 'update',
    label: 'Update Item',
    icon: '✏️',
    color: 'bg-blue-100 border-blue-500 text-blue-700',
    description: 'Update existing item',
    category: 'CRUD',
  },
  {
    type: 'delete',
    label: 'Delete Item',
    icon: '🗑️',
    color: 'bg-rose-100 border-rose-400 text-rose-700',
    description: 'Delete item',
    category: 'CRUD',
  },
  
  // Integration
  {
    type: 'api',
    label: 'API Call',
    icon: '🔌',
    color: 'bg-amber-100 border-amber-400 text-amber-700',
    description: 'Call REST API',
    category: 'Integration',
  },
  {
    type: 'webhook',
    label: 'Webhook',
    icon: '🪝',
    color: 'bg-lime-100 border-lime-400 text-lime-700',
    description: 'Trigger webhook',
    category: 'Integration',
  },
  {
    type: 'database',
    label: 'Database',
    icon: '🗄️',
    color: 'bg-cyan-100 border-cyan-500 text-cyan-700',
    description: 'Execute SQL query',
    category: 'Integration',
  },
  
  // Document Operations
  {
    type: 'document',
    label: 'Document',
    icon: '📄',
    color: 'bg-orange-100 border-orange-500 text-orange-700',
    description: 'Document operations',
    category: 'Documents',
  },
  {
    type: 'pdf',
    label: 'PDF',
    icon: '📕',
    color: 'bg-red-100 border-red-500 text-red-700',
    description: 'PDF operations',
    category: 'Documents',
  },
  
  // User & Security
  {
    type: 'user',
    label: 'User Action',
    icon: '👤',
    color: 'bg-purple-100 border-purple-500 text-purple-700',
    description: 'User operations',
    category: 'Users',
  },
  {
    type: 'permission',
    label: 'Permission',
    icon: '🔐',
    color: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    description: 'Set permissions',
    category: 'Users',
  },
  
  // Advanced
  {
    type: 'script',
    label: 'Script',
    icon: '</>',
    color: 'bg-gray-100 border-gray-400 text-gray-700',
    description: 'Execute custom script',
    category: 'Advanced',
  },
  {
    type: 'log',
    label: 'Log',
    icon: '📝',
    color: 'bg-stone-100 border-stone-400 text-stone-700',
    description: 'Log to history',
    category: 'Advanced',
  },
];

export default function NodePalette() {
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  
  const categories = ['All', ...new Set(nodeTypes.map(n => n.category))];
  
  const filteredNodes = selectedCategory === 'All' 
    ? nodeTypes 
    : nodeTypes.filter(n => n.category === selectedCategory);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Node Palette</h3>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-2">
          {filteredNodes.map((node) => (
            <div
              key={node.type}
              draggable
              onDragStart={(e) => onDragStart(e, node.type)}
              className={`p-2.5 rounded-md border-2 cursor-move transition-all hover:shadow-md ${node.color}`}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-base">{node.icon}</span>
                <span className="font-medium text-sm">{node.label}</span>
              </div>
              <p className="text-xs text-gray-600 leading-tight">{node.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-3 bg-blue-50 border-t border-blue-200">
        <p className="text-xs text-blue-800">
          💡 {filteredNodes.length} actions disponibles
        </p>
      </div>
    </div>
  );
}
