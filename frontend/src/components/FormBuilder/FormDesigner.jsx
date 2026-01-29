import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FieldPalette from './FieldPalette';
import FieldConfig from './FieldConfig';
import FormPreview from './FormPreview';
import { formApi } from '../../services/formApi';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, EyeIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

export default function FormDesigner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formName, setFormName] = useState('New Form');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadForm();
    }
  }, [id]);

  const loadForm = async () => {
    try {
      const response = await formApi.getForm(id);
      const form = response.data || response;
      setFormName(form.name);
      setFormDescription(form.description || '');
      setFields(form.schema?.fields || []);
    } catch (error) {
      toast.error('Failed to load form');
      console.error(error);
    }
  };

  const handleDrop = (fieldType) => {
    const newField = {
      id: `field-${Date.now()}`,
      type: fieldType,
      label: `New ${fieldType} field`,
      name: `field_${Date.now()}`,
      required: false,
      validation: {},
      options: fieldType === 'select' || fieldType === 'radio' || fieldType === 'checkbox' 
        ? [{ label: 'Option 1', value: 'option1' }] 
        : undefined,
    };
    setFields([...fields, newField]);
    setSelectedField(newField);
  };

  const handleFieldUpdate = (updatedField) => {
    setFields(fields.map(f => f.id === updatedField.id ? updatedField : f));
    setSelectedField(updatedField);
  };

  const handleFieldDelete = (fieldId) => {
    setFields(fields.filter(f => f.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  const handleFieldSelect = (field) => {
    setSelectedField(field);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('Please enter a form name');
      return;
    }

    try {
      setSaving(true);
      const formData = {
        name: formName,
        description: formDescription,
        schema: {
          fields,
        },
      };

      if (id) {
        await formApi.updateForm(id, formData);
        toast.success('Form updated successfully');
      } else {
        const result = await formApi.createForm(formData);
        toast.success('Form created successfully');
        navigate(`/forms/${result._id}/edit`);
      }
    } catch (error) {
      toast.error('Failed to save form');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const SortableField = ({ field, index }) => {
    return (
      <div
        onClick={() => handleFieldSelect(field)}
        className={`p-4 bg-white border-2 rounded-lg cursor-pointer hover:border-indigo-300 transition-all ${
          selectedField?.id === field.id ? 'border-indigo-500 shadow-md' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{field.label}</span>
              {field.required && <span className="text-red-500">*</span>}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {field.type} • {field.name}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFieldDelete(field.id);
            }}
            className="text-red-600 hover:text-red-800 text-sm px-2"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b mb-4 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => navigate('/workflows')}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex-1 max-w-2xl">
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="text-lg font-semibold w-full border-0 border-b-2 border-transparent hover:border-gray-300 focus:border-indigo-500 focus:ring-0 px-2 py-1"
                placeholder="Form Name"
              />
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="text-sm text-gray-500 w-full border-0 border-b-2 border-transparent hover:border-gray-300 focus:border-indigo-500 focus:ring-0 px-2 py-1 mt-1"
                placeholder="Description"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <EyeIcon className="h-5 w-5 inline mr-1" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-4 h-full">
        {/* Field Palette */}
        <div className="w-64 flex-shrink-0">
          <FieldPalette onDrop={handleDrop} />
        </div>

        {/* Form Builder */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border p-6 overflow-auto">
          <h3 className="text-lg font-semibold mb-4">Form Fields</h3>
          {fields.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CodeBracketIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p>Click on fields from the palette to add them to your form</p>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <SortableField key={field.id} field={field} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Field Configuration or Preview */}
        <div className="w-96 flex-shrink-0">
          {showPreview ? (
            <FormPreview fields={fields} formName={formName} />
          ) : selectedField ? (
            <FieldConfig
              field={selectedField}
              onUpdate={handleFieldUpdate}
              onClose={() => setSelectedField(null)}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center text-gray-500">
              <p>Select a field to configure its properties</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
