import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function FieldConfig({ field, onUpdate, onClose }) {
  const [config, setConfig] = useState(field);

  useEffect(() => {
    setConfig(field);
  }, [field]);

  const handleUpdate = () => {
    onUpdate(config);
  };

  const handleAddOption = () => {
    const newOptions = [...(config.options || []), { label: 'New Option', value: `option${Date.now()}` }];
    setConfig({ ...config, options: newOptions });
  };

  const handleUpdateOption = (index, key, value) => {
    const newOptions = [...config.options];
    newOptions[index][key] = value;
    setConfig({ ...config, options: newOptions });
  };

  const handleDeleteOption = (index) => {
    const newOptions = config.options.filter((_, i) => i !== index);
    setConfig({ ...config, options: newOptions });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 h-full overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Field Configuration</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Basic Properties */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Label
          </label>
          <input
            type="text"
            value={config.label}
            onChange={(e) => setConfig({ ...config, label: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Name (ID)
          </label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">Used to reference this field in code</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placeholder
          </label>
          <input
            type="text"
            value={config.placeholder || ''}
            onChange={(e) => setConfig({ ...config, placeholder: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Help Text
          </label>
          <textarea
            value={config.helpText || ''}
            onChange={(e) => setConfig({ ...config, helpText: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            rows="2"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="required"
            checked={config.required}
            onChange={(e) => setConfig({ ...config, required: e.target.checked })}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="required" className="ml-2 block text-sm text-gray-900">
            Required field
          </label>
        </div>

        {/* Options for select, radio, checkbox */}
        {(config.type === 'select' || config.type === 'radio' || config.type === 'checkbox') && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Options
              </label>
              <button
                onClick={handleAddOption}
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <PlusIcon className="h-4 w-4" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {(config.options || []).map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => handleUpdateOption(index, 'label', e.target.value)}
                    placeholder="Label"
                    className="flex-1 px-2 py-1 text-sm border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={option.value}
                    onChange={(e) => handleUpdateOption(index, 'value', e.target.value)}
                    placeholder="Value"
                    className="flex-1 px-2 py-1 text-sm border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    onClick={() => handleDeleteOption(index)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validation Rules */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Validation</h4>
          
          {config.type === 'text' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Length
                </label>
                <input
                  type="number"
                  value={config.validation?.minLength || ''}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    validation: { ...config.validation, minLength: parseInt(e.target.value) || undefined }
                  })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Length
                </label>
                <input
                  type="number"
                  value={config.validation?.maxLength || ''}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    validation: { ...config.validation, maxLength: parseInt(e.target.value) || undefined }
                  })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pattern (Regex)
                </label>
                <input
                  type="text"
                  value={config.validation?.pattern || ''}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    validation: { ...config.validation, pattern: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="^[A-Za-z]+$"
                />
              </div>
            </>
          )}

          {config.type === 'number' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Value
                </label>
                <input
                  type="number"
                  value={config.validation?.min || ''}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    validation: { ...config.validation, min: parseFloat(e.target.value) || undefined }
                  })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Value
                </label>
                <input
                  type="number"
                  value={config.validation?.max || ''}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    validation: { ...config.validation, max: parseFloat(e.target.value) || undefined }
                  })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </>
          )}
        </div>

        <div className="pt-4 border-t">
          <button
            onClick={handleUpdate}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Update Field
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <p className="text-xs text-gray-600">
          <strong>Field Type:</strong> {config.type}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          <strong>Field ID:</strong> {config.id}
        </p>
      </div>
    </div>
  );
}
