import React from 'react';

export default function FormPreview({ fields, formName }) {
  const renderField = (field) => {
    const commonClasses = "w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500";
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            required={field.required}
            className={commonClasses}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder}
            required={field.required}
            rows="4"
            className={commonClasses}
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            required={field.required}
            className={commonClasses}
          />
        );
      
      case 'select':
        return (
          <select required={field.required} className={commonClasses}>
            <option value="">Select an option...</option>
            {(field.options || []).map((option, idx) => (
              <option key={idx} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {(field.options || []).map((option, idx) => (
              <label key={idx} className="flex items-center">
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  required={field.required}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {(field.options || []).map((option, idx) => (
              <label key={idx} className="flex items-center">
                <input
                  type="checkbox"
                  value={option.value}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
      
      case 'file':
        return (
          <input
            type="file"
            required={field.required}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        );
      
      default:
        return <p className="text-sm text-gray-500">Unsupported field type: {field.type}</p>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 h-full overflow-auto">
      <h3 className="text-lg font-semibold mb-2">Form Preview</h3>
      <p className="text-sm text-gray-500 mb-6">Live preview of your form</p>
      
      <div className="border rounded-lg p-6 bg-gray-50">
        <h2 className="text-xl font-bold mb-2">{formName}</h2>
        
        {fields.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No fields added yet</p>
        ) : (
          <form className="space-y-6">
            {fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
                {field.helpText && (
                  <p className="mt-1 text-xs text-gray-500">{field.helpText}</p>
                )}
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <button
                type="button"
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Submit Form
              </button>
            </div>
          </form>
        )}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
        <p className="text-xs text-blue-800">
          ℹ️ This is a preview only. The actual form will be rendered when used in a workflow.
        </p>
      </div>
    </div>
  );
}
