import React from 'react';

const fieldTypes = [
  {
    type: 'text',
    label: 'Text Input',
    icon: '📝',
    description: 'Single line text',
  },
  {
    type: 'textarea',
    label: 'Text Area',
    icon: '📄',
    description: 'Multi-line text',
  },
  {
    type: 'number',
    label: 'Number',
    icon: '🔢',
    description: 'Numeric input',
  },
  {
    type: 'email',
    label: 'Email',
    icon: '📧',
    description: 'Email address',
  },
  {
    type: 'date',
    label: 'Date',
    icon: '📅',
    description: 'Date picker',
  },
  {
    type: 'select',
    label: 'Dropdown',
    icon: '📋',
    description: 'Select from options',
  },
  {
    type: 'radio',
    label: 'Radio Buttons',
    icon: '⭕',
    description: 'Single choice',
  },
  {
    type: 'checkbox',
    label: 'Checkboxes',
    icon: '☑',
    description: 'Multiple choices',
  },
  {
    type: 'file',
    label: 'File Upload',
    icon: '📎',
    description: 'Upload files',
  },
];

export default function FieldPalette({ onDrop }) {
  const handleDragStart = (e, type) => {
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleClick = (type) => {
    onDrop(type);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 h-full overflow-auto">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Field Types</h3>
      <div className="space-y-2">
        {fieldTypes.map((field) => (
          <div
            key={field.type}
            onClick={() => handleClick(field.type)}
            draggable
            onDragStart={(e) => handleDragStart(e, field.type)}
            className="p-3 rounded-md border-2 border-gray-200 cursor-pointer transition-all hover:border-indigo-400 hover:shadow-md bg-white"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{field.icon}</span>
              <span className="font-medium text-sm">{field.label}</span>
            </div>
            <p className="text-xs text-gray-600">{field.description}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 p-3 bg-blue-50 rounded-md border border-blue-200">
        <p className="text-xs text-blue-800">
          💡 Click or drag fields to add them to your form
        </p>
      </div>
    </div>
  );
}
