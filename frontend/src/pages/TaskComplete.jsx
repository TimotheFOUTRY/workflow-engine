import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import taskApi from '../services/taskApi';
import { formApi } from '../services/formApi';
import { useCompleteTask } from '../hooks/useTasks';
import { ArrowLeftIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

function TaskComplete() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [decision, setDecision] = useState(null);
  const [formSchema, setFormSchema] = useState(null);
  
  const completeTaskMutation = useCompleteTask();

  // Fetch task details
  const { data: task, isLoading, error } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const response = await taskApi.getTask(taskId);
      return response.data || response;
    },
    enabled: !!taskId
  });

  // Load form schema if formId exists
  useEffect(() => {
    const loadForm = async () => {
      if (task?.formId) {
        try {
          const formResponse = await formApi.getForm(task.formId);
          const form = formResponse.data || formResponse;
          setFormSchema(form.schema);
        } catch (error) {
          console.error('Failed to load form schema:', error);
          toast.error('Erreur lors du chargement du formulaire');
        }
      }
    };
    loadForm();
  }, [task]);

  // Initialize form data from task fields or form schema
  useEffect(() => {
    const fields = formSchema?.fields || task?.taskData?.formFields || [];
    if (fields.length > 0) {
      const initialData = {};
      fields.forEach(field => {
        initialData[field.name] = field.defaultValue || '';
      });
      setFormData(initialData);
    }
  }, [task, formSchema]);

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const validateForm = () => {
    const fields = formSchema?.fields || task?.taskData?.formFields || [];
    if (fields.length === 0) return true;

    for (const field of fields) {
      if (field.required && !formData[field.name]) {
        toast.error(`Le champ "${field.label}" est requis`);
        return false;
      }

      // Email validation
      if (field.type === 'email' && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          toast.error(`Le champ "${field.label}" doit être un email valide`);
          return false;
        }
      }

      // Number validation
      if (field.type === 'number' && formData[field.name]) {
        const value = Number(formData[field.name]);
        if (isNaN(value)) {
          toast.error(`Le champ "${field.label}" doit être un nombre`);
          return false;
        }
        if (field.min !== undefined && value < field.min) {
          toast.error(`Le champ "${field.label}" doit être >= ${field.min}`);
          return false;
        }
        if (field.max !== undefined && value > field.max) {
          toast.error(`Le champ "${field.label}" doit être <= ${field.max}`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await completeTaskMutation.mutateAsync({
        taskId,
        decision: task.taskType === 'approval' ? decision : null,
        taskData: formData
      });

      toast.success('Tâche complétée avec succès');
      navigate('/tasks');
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Erreur lors de la complétion');
    }
  };

  const renderField = (field) => {
    const value = formData[field.name] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
        return (
          <input
            type={field.type}
            id={field.name}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
            min={field.min}
            max={field.max}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder={field.placeholder}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={field.name}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
            rows={field.rows || 3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder={field.placeholder}
          />
        );

      case 'select':
        return (
          <select
            id={field.name}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Sélectionner...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            id={field.name}
            checked={value === true || value === 'true'}
            onChange={(e) => handleInputChange(field.name, e.target.checked)}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        );

      case 'radio':
        return (
          <div className="mt-1 space-y-2">
            {field.options?.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="mr-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            id={field.name}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Chargement de la tâche...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Erreur: {error.message}</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Tâche non trouvée</div>
      </div>
    );
  }

  if (!['pending', 'in_progress', 'assigned'].includes(task.status)) {
    const statusMessages = {
      'completed': 'complétée',
      'cancelled': 'annulée',
      'failed': 'échouée'
    };
    const statusText = statusMessages[task.status] || task.status;
    
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Cette tâche a déjà été {statusText}.</p>
          <button
            onClick={() => navigate('/tasks')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Retour aux tâches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <button
        onClick={() => navigate('/tasks')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Retour aux tâches
      </button>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {task.taskData?.nodeName || 'Compléter la tâche'}
        </h1>

        {task.taskData?.instructions && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">{task.taskData.instructions}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields */}
          {(() => {
            const fields = formSchema?.fields || task.taskData?.formFields || [];
            return fields.length > 0 ? (
              fields.map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
                {field.helpText && (
                  <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
                )}
              </div>
              ))
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  {task.formId 
                    ? "Le formulaire n'a pas encore été configuré pour cette tâche."
                    : "Cette tâche ne nécessite pas de remplir de formulaire. Vous pouvez la compléter directement."}
                </p>
              </div>
            );
          })()}

          {/* Approval Buttons */}
          {task.taskType === 'approval' && (
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Décision d'approbation <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setDecision('approved')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium ${
                    decision === 'approved'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CheckIcon className="w-5 h-5" />
                  Approuver
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('rejected')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium ${
                    decision === 'rejected'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <XMarkIcon className="w-5 h-5" />
                  Rejeter
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={
                completeTaskMutation.isLoading ||
                (task.taskType === 'approval' && !decision)
              }
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {completeTaskMutation.isLoading ? 'En cours...' : 'Compléter la tâche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskComplete;
