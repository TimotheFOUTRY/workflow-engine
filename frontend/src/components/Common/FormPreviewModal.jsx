import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function FormPreviewModal({ fields, title = 'Aperçu du formulaire', onClose }) {
  const renderField = (field, index) => {
    const commonClasses = "w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500";

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
        return (
          <input
            key={index}
            type={field.type}
            placeholder={field.placeholder || ''}
            required={field.required}
            className={commonClasses}
            disabled
          />
        );
      
      case 'textarea':
        return (
          <textarea
            key={index}
            placeholder={field.placeholder || ''}
            required={field.required}
            className={commonClasses}
            rows={4}
            disabled
          />
        );
      
      case 'select':
        return (
          <select
            key={index}
            required={field.required}
            className={commonClasses}
            disabled
          >
            <option value="">Sélectionner...</option>
            {(field.options || []).map((opt, i) => (
              <option key={i} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div key={index} className="flex items-center">
            <input
              type="checkbox"
              required={field.required}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled
            />
            <label className="ml-2 text-sm text-gray-700">{field.label}</label>
          </div>
        );
      
      case 'radio':
        return (
          <div key={index} className="space-y-2">
            {(field.options || []).map((opt, i) => (
              <div key={i} className="flex items-center">
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value}
                  required={field.required && i === 0}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  disabled
                />
                <label className="ml-2 text-sm text-gray-700">{opt.label}</label>
              </div>
            ))}
          </div>
        );
      
      case 'file':
        return (
          <input
            key={index}
            type="file"
            required={field.required}
            className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            disabled
          />
        );
      
      default:
        return (
          <input
            key={index}
            type="text"
            placeholder={field.placeholder || ''}
            className={commonClasses}
            disabled
          />
        );
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-w-[90vw] max-h-[80vh] bg-white rounded-lg shadow-xl z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-indigo-500 to-purple-600">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          {fields.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Aucun champ à afficher</p>
              <p className="text-sm mt-2">Ajoutez des champs au formulaire pour voir l'aperçu</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={index} className="form-field">
                  {field.type !== 'checkbox' && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                      {field.name && (
                        <span className="ml-2 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {field.name}
                        </span>
                      )}
                    </label>
                  )}
                  {renderField(field, index)}
                  {field.placeholder && field.type !== 'checkbox' && field.type !== 'radio' && (
                    <p className="text-xs text-gray-500 mt-1">💡 {field.placeholder}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {fields.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <button
                type="button"
                className="w-full px-4 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors cursor-not-allowed opacity-75"
                disabled
              >
                Soumettre (Aperçu uniquement)
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
