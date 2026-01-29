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

      case 'email':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To (Recipients)</label>
              <input type="text" value={config.to || ''} onChange={(e) => setConfig({ ...config, to: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" placeholder="email1@domain.com, email2@domain.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input type="text" value={config.subject || ''} onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" placeholder="Email subject" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea value={config.message || ''} onChange={(e) => setConfig({ ...config, message: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" rows="4" placeholder="Email body" />
            </div>
          </>
        );

      case 'notification':
      case 'sms':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
              <input type="text" value={config.recipients || ''} onChange={(e) => setConfig({ ...config, recipients: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" placeholder="User IDs or phone numbers" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea value={config.message || ''} onChange={(e) => setConfig({ ...config, message: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" rows="3" placeholder="Notification message" />
            </div>
          </>
        );

      case 'loop':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loop Type</label>
              <select value={config.loopType || 'forEach'} onChange={(e) => setConfig({ ...config, loopType: e.target.value })}
                className="w-full px-3 py-2 border rounded-md">
                <option value="forEach">For Each</option>
                <option value="while">While</option>
                <option value="until">Until</option>
                <option value="count">Count</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Collection/Condition</label>
              <input type="text" value={config.source || ''} onChange={(e) => setConfig({ ...config, source: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" placeholder="data.items or count value" />
            </div>
          </>
        );

      case 'switch':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Switch Variable</label>
              <input type="text" value={config.variable || ''} onChange={(e) => setConfig({ ...config, variable: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" placeholder="data.status" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cases (comma-separated)</label>
              <input type="text" value={config.cases || ''} onChange={(e) => setConfig({ ...config, cases: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" placeholder="pending,approved,rejected" />
            </div>
          </>
        );

      case 'variable':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Variable Name</label>
              <input type="text" value={config.varName || ''} onChange={(e) => setConfig({ ...config, varName: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" placeholder="myVariable" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input type="text" value={config.value || ''} onChange={(e) => setConfig({ ...config, value: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" placeholder="Value or expression" />
            </div>
          </>
        );

      case 'query':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
              <select value={config.dataSource || 'list'} onChange={(e) => setConfig({ ...config, dataSource: e.target.value })}
                className="w-full px-3 py-2 border rounded-md">
                <option value="list">List/Table</option>
                <option value="api">API</option>
                <option value="database">Database</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Query</label>
              <textarea value={config.query || ''} onChange={(e) => setConfig({ ...config, query: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" rows="3" placeholder="SELECT * FROM users WHERE status='active'" />
            </div>
          </>
        );

      case 'calculate':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expression</label>
              <input type="text" value={config.expression || ''} onChange={(e) => setConfig({ ...config, expression: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" placeholder="(amount * 1.2) + tax" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Result In</label>
              <input type="text" value={config.resultVar || ''} onChange={(e) => setConfig({ ...config, resultVar: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" placeholder="totalAmount" />
            </div>
          </>
        );

      case 'create':
      case 'update':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Collection/Table</label>
              <input type="text" value={config.collection || ''} onChange={(e) => setConfig({ ...config, collection: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" placeholder="users" />
            </div>
            {node.type === 'update' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item ID</label>
                <input type="text" value={config.itemId || ''} onChange={(e) => setConfig({ ...config, itemId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md" placeholder="Item ID or expression" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fields (JSON)</label>
              <textarea value={config.fields || ''} onChange={(e) => setConfig({ ...config, fields: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" rows="4" placeholder='{"name": "John", "email": "john@example.com"}' />
            </div>
          </>
        );

      case 'delete':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Collection/Table</label>
              <input type="text" value={config.collection || ''} onChange={(e) => setConfig({ ...config, collection: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" placeholder="users" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item ID</label>
              <input type="text" value={config.itemId || ''} onChange={(e) => setConfig({ ...config, itemId: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" placeholder="Item ID or expression" />
            </div>
          </>
        );

      case 'api':
      case 'webhook':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select value={config.method || 'GET'} onChange={(e) => setConfig({ ...config, method: e.target.value })}
                className="w-full px-3 py-2 border rounded-md">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input type="text" value={config.url || ''} onChange={(e) => setConfig({ ...config, url: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" placeholder="https://api.example.com/endpoint" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Headers (JSON)</label>
              <textarea value={config.headers || ''} onChange={(e) => setConfig({ ...config, headers: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" rows="2" placeholder='{"Authorization": "Bearer token"}' />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body (JSON)</label>
              <textarea value={config.body || ''} onChange={(e) => setConfig({ ...config, body: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" rows="3" placeholder='{"key": "value"}' />
            </div>
          </>
        );

      case 'database':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Connection</label>
              <input type="text" value={config.connection || ''} onChange={(e) => setConfig({ ...config, connection: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" placeholder="Connection name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SQL Query</label>
              <textarea value={config.sql || ''} onChange={(e) => setConfig({ ...config, sql: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" rows="4" placeholder="SELECT * FROM users WHERE id = ?" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parameters</label>
              <input type="text" value={config.params || ''} onChange={(e) => setConfig({ ...config, params: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" placeholder="userId, status" />
            </div>
          </>
        );

      case 'document':
      case 'pdf':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
              <select value={config.operation || 'generate'} onChange={(e) => setConfig({ ...config, operation: e.target.value })}
                className="w-full px-3 py-2 border rounded-md">
                <option value="generate">Generate</option>
                <option value="convert">Convert</option>
                <option value="merge">Merge</option>
                <option value="sign">Sign</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template/Source</label>
              <input type="text" value={config.source || ''} onChange={(e) => setConfig({ ...config, source: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" placeholder="Template ID or file path" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Output Name</label>
              <input type="text" value={config.output || ''} onChange={(e) => setConfig({ ...config, output: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" placeholder="document.pdf" />
            </div>
          </>
        );

      case 'user':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
              <select value={config.operation || 'query'} onChange={(e) => setConfig({ ...config, operation: e.target.value })}
                className="w-full px-3 py-2 border rounded-md">
                <option value="query">Query User</option>
                <option value="addToGroup">Add to Group</option>
                <option value="removeFromGroup">Remove from Group</option>
                <option value="getProfile">Get Profile</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID/Email</label>
              <input type="text" value={config.userId || ''} onChange={(e) => setConfig({ ...config, userId: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" placeholder="user@example.com" />
            </div>
          </>
        );

      case 'permission':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
              <input type="text" value={config.resource || ''} onChange={(e) => setConfig({ ...config, resource: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" placeholder="Resource ID" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User/Group</label>
              <input type="text" value={config.principal || ''} onChange={(e) => setConfig({ ...config, principal: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" placeholder="user@example.com or group name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Permission Level</label>
              <select value={config.level || 'read'} onChange={(e) => setConfig({ ...config, level: e.target.value })}
                className="w-full px-3 py-2 border rounded-md">
                <option value="read">Read</option>
                <option value="write">Write</option>
                <option value="admin">Admin</option>
                <option value="none">None (Remove)</option>
              </select>
            </div>
          </>
        );

      case 'script':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select value={config.language || 'javascript'} onChange={(e) => setConfig({ ...config, language: e.target.value })}
                className="w-full px-3 py-2 border rounded-md">
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="bash">Bash</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Script Code</label>
              <textarea value={config.code || ''} onChange={(e) => setConfig({ ...config, code: e.target.value })}
                className="w-full px-3 py-2 border rounded-md font-mono text-xs" rows="8" placeholder="// Your code here" />
            </div>
          </>
        );

      case 'log':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Log Level</label>
              <select value={config.level || 'info'} onChange={(e) => setConfig({ ...config, level: e.target.value })}
                className="w-full px-3 py-2 border rounded-md">
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea value={config.message || ''} onChange={(e) => setConfig({ ...config, message: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" rows="3" placeholder="Log message" />
            </div>
          </>
        );

      case 'parallel':
        return (
          <p className="text-sm text-gray-500">
            Parallel execution - configure branches by connecting multiple paths from this node
          </p>
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
