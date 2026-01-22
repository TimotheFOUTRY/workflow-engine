import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function NodeConfig({ node, onUpdate, onClose }) {
  const [config, setConfig] = useState(node.data.config || {});
  const [label, setLabel] = useState(node.data.label || '');

  useEffect(() => {
    setConfig(node.data.config || {});
    setLabel(node.data.label || '');
  }, [node]);

  const handleUpdate = () => {
    onUpdate({ label, config });
  };

  const renderConfigFields = () => {
    switch (node.type) {
      case 'task':
      case 'approval':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <input
                type="text"
                value={config.assignedTo || ''}
                onChange={(e) => setConfig({ ...config, assignedTo: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Form ID
              </label>
              <input
                type="text"
                value={config.formId || ''}
                onChange={(e) => setConfig({ ...config, formId: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Form ID (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={config.priority || 'medium'}
                onChange={(e) => setConfig({ ...config, priority: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Days
              </label>
              <input
                type="number"
                value={config.dueDays || ''}
                onChange={(e) => setConfig({ ...config, dueDays: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Number of days"
              />
            </div>
          </>
        );
      
      case 'condition':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition Expression
              </label>
              <textarea
                value={config.expression || ''}
                onChange={(e) => setConfig({ ...config, expression: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                rows="3"
                placeholder="e.g., data.amount > 1000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use JavaScript expressions to evaluate workflow data
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                True Path Label
              </label>
              <input
                type="text"
                value={config.trueLabel || 'Yes'}
                onChange={(e) => setConfig({ ...config, trueLabel: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                False Path Label
              </label>
              <input
                type="text"
                value={config.falseLabel || 'No'}
                onChange={(e) => setConfig({ ...config, falseLabel: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </>
        );
      
      case 'timer':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration Type
              </label>
              <select
                value={config.durationType || 'minutes'}
                onChange={(e) => setConfig({ ...config, durationType: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration Value
              </label>
              <input
                type="number"
                value={config.duration || ''}
                onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter duration"
              />
            </div>
          </>
        );
      
      default:
        return (
          <p className="text-sm text-gray-500">
            No configuration options for this node type
          </p>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 h-full overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Node Configuration</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Node Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter node label"
          />
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Properties</h4>
          <div className="space-y-3">
            {renderConfigFields()}
          </div>
        </div>

        <div className="pt-4 border-t">
          <button
            onClick={handleUpdate}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Update Node
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <p className="text-xs text-gray-600">
          <strong>Node ID:</strong> {node.id}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          <strong>Type:</strong> {node.type}
        </p>
      </div>
    </div>
  );
}
