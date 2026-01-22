import React from 'react';

const nodeTypes = [
  {
    type: 'start',
    label: 'Start',
    icon: '▶',
    color: 'bg-green-100 border-green-400 text-green-700',
    description: 'Workflow start point',
  },
  {
    type: 'task',
    label: 'Task',
    icon: '📋',
    color: 'bg-blue-100 border-blue-400 text-blue-700',
    description: 'Assign task to user',
  },
  {
    type: 'approval',
    label: 'Approval',
    icon: '✓',
    color: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    description: 'Approval step',
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: '◆',
    color: 'bg-purple-100 border-purple-400 text-purple-700',
    description: 'Conditional branching',
  },
  {
    type: 'timer',
    label: 'Timer',
    icon: '⏱',
    color: 'bg-orange-100 border-orange-400 text-orange-700',
    description: 'Wait/delay step',
  },
  {
    type: 'end',
    label: 'End',
    icon: '■',
    color: 'bg-red-100 border-red-400 text-red-700',
    description: 'Workflow end point',
  },
];

export default function NodePalette() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 h-full overflow-auto">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Node Palette</h3>
      <div className="space-y-2">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            draggable
            onDragStart={(e) => onDragStart(e, node.type)}
            className={`p-3 rounded-md border-2 cursor-move transition-all hover:shadow-md ${node.color}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{node.icon}</span>
              <span className="font-medium">{node.label}</span>
            </div>
            <p className="text-xs text-gray-600">{node.description}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 p-3 bg-blue-50 rounded-md border border-blue-200">
        <p className="text-xs text-blue-800">
          💡 Drag and drop nodes onto the canvas to build your workflow
        </p>
      </div>
    </div>
  );
}
