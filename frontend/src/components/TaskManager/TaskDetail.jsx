import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskApi } from '../../services/taskApi';
import { formApi } from '../../services/formApi';
import toast from 'react-hot-toast';
import TaskActions from './TaskActions';
import {
  ArrowLeftIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [formSchema, setFormSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTask();
  }, [id]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const taskResponse = await taskApi.getTask(id);
      const taskData = taskResponse.data || taskResponse;
      setTask(taskData);
      setFormData(taskData.data || {});

      // Load form schema if formId is present
      if (taskData.formId) {
        try {
          const formResponse = await formApi.getForm(taskData.formId);
          const form = formResponse.data || formResponse;
          setFormSchema(form.schema);
        } catch (error) {
          console.error('Failed to load form schema:', error);
        }
      }
    } catch (error) {
      toast.error('Failed to load task');
      console.error(error);
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (fieldName, value) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  const handleTaskComplete = async (action, data) => {
    try {
      // If action is 'complete' and task has a form (formId or taskType 'form'), redirect to the TaskComplete page
      if (action === 'complete' && (task.formId || task.taskType === 'form')) {
        console.log('Redirecting to complete page for form task');
        navigate(`/tasks/${id}/complete`);
        return;
      }

      // Otherwise, complete the task directly (for simple tasks or approval/reject actions)
      const payload = { ...formData, ...data };
      await taskApi.completeTask(id, { action, data: payload });
      toast.success(`Task ${action} successfully`);
      navigate('/tasks');
    } catch (error) {
      toast.error(`Failed to ${action} task`);
      console.error(error);
    }
  };

  const renderFormField = (field) => {
    const commonClasses = "w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500";
    const value = formData[field.name] || '';

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleFormChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={commonClasses}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFormChange(field.name, parseFloat(e.target.value))}
            placeholder={field.placeholder}
            required={field.required}
            className={commonClasses}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFormChange(field.name, e.target.value)}
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
            value={value}
            onChange={(e) => handleFormChange(field.name, e.target.value)}
            required={field.required}
            className={commonClasses}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFormChange(field.name, e.target.value)}
            required={field.required}
            className={commonClasses}
          >
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
                  checked={value === option.value}
                  onChange={(e) => handleFormChange(field.name, e.target.value)}
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
                  checked={(value || []).includes(option.value)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...(value || []), option.value]
                      : (value || []).filter((v) => v !== option.value);
                    handleFormChange(field.name, newValue);
                  }}
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
            onChange={(e) => handleFormChange(field.name, e.target.files[0])}
            required={field.required}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        );

      default:
        return <p className="text-sm text-gray-500">Unsupported field type: {field.type}</p>;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Task not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/tasks')}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{task.name}</h2>
          <p className="text-sm text-gray-500 mt-1">{task.workflowName}</p>
        </div>
        <div className="flex gap-2">
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ')}
          </span>
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Info */}
          <div className="bg-white shadow-sm rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Task Information</h3>
            
            {task.description && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <p className="text-sm text-gray-600">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <ClockIcon className="h-4 w-4 inline mr-1" />
                  Created
                </label>
                <p className="text-gray-600">{format(new Date(task.createdAt), 'MMM d, yyyy HH:mm')}</p>
              </div>
              {task.dueDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <ClockIcon className="h-4 w-4 inline mr-1" />
                    Due Date
                  </label>
                  <p className="text-gray-600">{format(new Date(task.dueDate), 'MMM d, yyyy HH:mm')}</p>
                </div>
              )}
              {task.assignedTo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <UserIcon className="h-4 w-4 inline mr-1" />
                    Assigned To
                  </label>
                  <p className="text-gray-600">{task.assignedTo}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                  Instance ID
                </label>
                <p className="text-gray-600 font-mono text-xs">{task.workflowInstanceId}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          {formSchema && formSchema.fields && formSchema.fields.length > 0 && (
            <div className="bg-white shadow-sm rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Task Form</h3>
              <div className="space-y-4">
                {formSchema.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderFormField(field)}
                    {field.helpText && (
                      <p className="mt-1 text-xs text-gray-500">{field.helpText}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="lg:col-span-1">
          <TaskActions
            task={task}
            onComplete={handleTaskComplete}
            disabled={task.status === 'completed' || task.status === 'cancelled'}
          />
        </div>
      </div>
    </div>
  );
}
