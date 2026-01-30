import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { useForms } from '../../hooks/useForms';
import AssignedToAutocomplete from '../Common/AssignedToAutocomplete';
import AssignedToAutocomplete from '../Common/AssignedToAutocomplete';

export default function NodeConfig({ node, onUpdate, onClose, nodes }) {
  const [config, setConfig] = useState(node.data.config || {});
  const [label, setLabel] = useState(node.data.label || '');
  const [formFields, setFormFields] = useState([]);
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState(config.formId || '');
  const { data: formsData, isLoading: formsLoading } = useForms();
  const forms = formsData?.data || formsData || [];

  useEffect(() => {
    setConfig(node.data.config || {});
    setLabel(node.data.label || '');
    
    // Parse existing form schema if editing
    if (node.type === 'form' && node.data.config?.formSchema) {
      try {
        const schema = JSON.parse(node.data.config.formSchema);
        setFormFields(schema.fields || []);
      } catch (e) {
        setFormFields([]);
      }
    }
  }, [node]);

  // Get all variables declared in the workflow
  const getWorkflowVariables = () => {
    if (!nodes) {
      console.log('❌ NodeConfig: nodes is null/undefined');
      return [];
    }
    
    console.log('🔍 NodeConfig: Analyzing', nodes.length, 'nodes');
    
    const variables = [];
    // Variables from variable nodes
    nodes.forEach(n => {
      console.log('  Node:', n.id, 'Type:', n.type, 'Data:', n.data);
      if (n.type === 'variable') {
        console.log('    ✅ Variable node found! Config:', n.data.config);
        if (n.data.config?.variableName) {
          variables.push({
            name: n.data.config.variableName,
            type: n.data.config.variableType || 'text',
            nodeId: n.id,
            source: 'workflow'
          });
          console.log('    ✅ Variable added:', n.data.config.variableName);
        } else {
          console.log('    ⚠️ Variable node has no variableName configured');
        }
      }
    });
    
    // Variables from selected form
    if (selectedFormId && forms.length > 0) {
      const selectedForm = forms.find(f => f.id === selectedFormId);
      if (selectedForm && selectedForm.schema?.fields) {
        selectedForm.schema.fields.forEach(field => {
          if (field.variableName) {
            variables.push({
              name: field.variableName,
              type: field.variableType || 'string',
              nodeId: selectedFormId,
              source: 'form',
              fieldLabel: field.label
            });
          }
        });
      }
    }
    
    console.log('📊 Total variables found:', variables.length, variables);
    return variables;
  };

  // Auto-save on changes
  useEffect(() => {
    if (node.type === 'form') {
      const formSchema = JSON.stringify({ fields: formFields }, null, 2);
      onUpdate({ label, config: { ...config, formSchema } });
    } else {
      onUpdate({ label, config });
    }
  }, [label, config, formFields]);

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
              <AssignedToAutocomplete
                value={config.assignedTo || ''}
                onChange={(value) => setConfig({ ...config, assignedTo: value })}
                placeholder="Sélectionner un utilisateur ou un groupe"
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
      
      case 'form':
        const workflowVariables = getWorkflowVariables();
        
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <AssignedToAutocomplete
                value={config.assignedTo || ''}
                onChange={(value) => setConfig({ ...config, assignedTo: value })}
                placeholder="Sélectionner un utilisateur ou un groupe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Titre de la tâche"
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
                placeholder="Nombre de jours"
              />
            </div>

            {/* Form Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sélectionner un formulaire existant (optionnel)
              </label>
              <select
                value={selectedFormId}
                onChange={(e) => {
                  setSelectedFormId(e.target.value);
                  setConfig({ ...config, formId: e.target.value });
                }}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                disabled={formsLoading}
              >
                <option value="">
                  {formsLoading ? 'Chargement...' : forms.length === 0 ? 'Aucun formulaire disponible - Créez-en un dans le Form Builder' : 'Aucun - Créer un formulaire personnalisé'}
                </option>
                {forms.map(form => (
                  <option key={form.id} value={form.id}>
                    {form.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Sélectionnez un formulaire pour utiliser ses variables
                {selectedFormId && forms.find(f => f.id === selectedFormId) && (
                  <span className="ml-2 text-green-600">
                    ✓ {forms.find(f => f.id === selectedFormId).schema?.fields?.filter(f => f.variableName).length || 0} variable(s) disponible(s)
                  </span>
                )}
              </p>
            </div>

            {/* Form Builder */}
            <div className="col-span-2">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Champs du formulaire
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const newIndex = formFields.length;
                    setFormFields([...formFields, {
                      name: '',
                      type: 'text',
                      label: '',
                      required: false,
                      placeholder: '',
                      options: []
                    }]);
                    setEditingFieldIndex(newIndex);
                  }}
                  className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                  disabled={editingFieldIndex !== null}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Ajouter un champ
                </button>
              </div>

              {workflowVariables.length === 0 && (
                <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                  ⚠️ Aucune variable disponible. 
                  {!selectedFormId && <span> Sélectionnez un formulaire avec des variables liées ou ajoutez des nodes "Variable" dans le workflow.</span>}
                  {selectedFormId && <span> Le formulaire sélectionné n'a pas de variables liées. Créez des champs avec des variables dans le Form Builder.</span>}
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {formFields.map((field, index) => (
                  <div key={index}>
                    {editingFieldIndex === index ? (
                      <div className="p-4 border-2 border-indigo-500 rounded-lg bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-sm text-gray-900">Configuration du champ</h4>
                        </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Variable Selection */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Variable *
                        </label>
                        <select
                          value={field.name}
                          onChange={(e) => {
                            const newFields = [...formFields];
                            newFields[index].name = e.target.value;
                            setFormFields(newFields);
                          }}
                          className="w-full px-2 py-1.5 text-sm border rounded focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        >
                          <option value="">Sélectionner une variable</option>
                          {workflowVariables.map(v => (
                            <option key={`${v.source}-${v.name}`} value={v.name}>
                              {v.name} {v.source === 'form' ? '(formulaire)' : '(workflow)'}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Field Type */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Type de champ *
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => {
                            const newFields = [...formFields];
                            newFields[index].type = e.target.value;
                            // Initialize options for select/radio
                            if ((e.target.value === 'select' || e.target.value === 'radio') && !newFields[index].options) {
                              newFields[index].options = [];
                            }
                            setFormFields(newFields);
                          }}
                          className="w-full px-2 py-1.5 text-sm border rounded focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="text">Texte</option>
                          <option value="email">Email</option>
                          <option value="number">Nombre</option>
                          <option value="textarea">Zone de texte</option>
                          <option value="select">Liste déroulante</option>
                          <option value="checkbox">Case à cocher</option>
                          <option value="radio">Boutons radio</option>
                          <option value="date">Date</option>
                          <option value="file">Fichier</option>
                        </select>
                      </div>

                      {/* Label */}
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Label *
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => {
                            const newFields = [...formFields];
                            newFields[index].label = e.target.value;
                            setFormFields(newFields);
                          }}
                          className="w-full px-2 py-1.5 text-sm border rounded focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Libellé du champ"
                        />
                      </div>

                      {/* Placeholder (not for checkbox/radio/select) */}
                      {!['checkbox', 'radio', 'select'].includes(field.type) && (
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Placeholder
                          </label>
                          <input
                            type="text"
                            value={field.placeholder || ''}
                            onChange={(e) => {
                              const newFields = [...formFields];
                              newFields[index].placeholder = e.target.value;
                              setFormFields(newFields);
                            }}
                            className="w-full px-2 py-1.5 text-sm border rounded focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Texte d'aide"
                          />
                        </div>
                      )}

                      {/* Options for select/radio */}
                      {(field.type === 'select' || field.type === 'radio') && (
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Options
                          </label>
                          <div className="space-y-2">
                            {(field.options || []).map((option, optIndex) => (
                              <div key={optIndex} className="flex gap-2">
                                <input
                                  type="text"
                                  value={option.value}
                                  onChange={(e) => {
                                    const newFields = [...formFields];
                                    newFields[index].options[optIndex].value = e.target.value;
                                    setFormFields(newFields);
                                  }}
                                  className="flex-1 px-2 py-1 text-sm border rounded"
                                  placeholder="Valeur"
                                />
                                <input
                                  type="text"
                                  value={option.label}
                                  onChange={(e) => {
                                    const newFields = [...formFields];
                                    newFields[index].options[optIndex].label = e.target.value;
                                    setFormFields(newFields);
                                  }}
                                  className="flex-1 px-2 py-1 text-sm border rounded"
                                  placeholder="Libellé"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newFields = [...formFields];
                                    newFields[index].options = newFields[index].options.filter((_, i) => i !== optIndex);
                                    setFormFields(newFields);
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const newFields = [...formFields];
                                if (!newFields[index].options) newFields[index].options = [];
                                newFields[index].options.push({ value: '', label: '' });
                                setFormFields(newFields);
                              }}
                              className="text-sm text-indigo-600 hover:text-indigo-800"
                            >
                              + Ajouter une option
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Required checkbox */}
                      <div className="col-span-2">
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={field.required || false}
                            onChange={(e) => {
                              const newFields = [...formFields];
                              newFields[index].required = e.target.checked;
                              setFormFields(newFields);
                            }}
                            className="mr-2"
                          />
                          Champ obligatoire
                        </label>
                      </div>

                      {/* Validation for text/number */}
                      {(field.type === 'text' || field.type === 'textarea') && (
                        <div className="col-span-2 grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Longueur min
                            </label>
                            <input
                              type="number"
                              value={field.validation?.minLength || ''}
                              onChange={(e) => {
                                const newFields = [...formFields];
                                if (!newFields[index].validation) newFields[index].validation = {};
                                newFields[index].validation.minLength = parseInt(e.target.value) || undefined;
                                setFormFields(newFields);
                              }}
                              className="w-full px-2 py-1 text-sm border rounded"
                              placeholder="Min"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Longueur max
                            </label>
                            <input
                              type="number"
                              value={field.validation?.maxLength || ''}
                              onChange={(e) => {
                                const newFields = [...formFields];
                                if (!newFields[index].validation) newFields[index].validation = {};
                                newFields[index].validation.maxLength = parseInt(e.target.value) || undefined;
                                setFormFields(newFields);
                              }}
                              className="w-full px-2 py-1 text-sm border rounded"
                              placeholder="Max"
                            />
                          </div>
                        </div>
                      )}

                      {field.type === 'number' && (
                        <div className="col-span-2 grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Valeur min
                            </label>
                            <input
                              type="number"
                              value={field.validation?.min || ''}
                              onChange={(e) => {
                                const newFields = [...formFields];
                                if (!newFields[index].validation) newFields[index].validation = {};
                                newFields[index].validation.min = parseInt(e.target.value) || undefined;
                                setFormFields(newFields);
                              }}
                              className="w-full px-2 py-1 text-sm border rounded"
                              placeholder="Min"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Valeur max
                            </label>
                            <input
                              type="number"
                              value={field.validation?.max || ''}
                              onChange={(e) => {
                                const newFields = [...formFields];
                                if (!newFields[index].validation) newFields[index].validation = {};
                                newFields[index].validation.max = parseInt(e.target.value) || undefined;
                                setFormFields(newFields);
                              }}
                              className="w-full px-2 py-1 text-sm border rounded"
                              placeholder="Max"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          if (field.name && field.label) {
                            setEditingFieldIndex(null);
                          } else {
                            alert('Veuillez remplir au moins la variable et le label');
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700"
                      >
                        ✓ Valider
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormFields(formFields.filter((_, i) => i !== index));
                          setEditingFieldIndex(null);
                        }}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">📋</span>
                          <div>
                            <div className="font-medium text-sm text-gray-900">{field.name}</div>
                            <div className="text-xs text-gray-500">{field.label} • {field.type}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingFieldIndex(index)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Modifier"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormFields(formFields.filter((_, i) => i !== index))}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {formFields.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Aucun champ ajouté. Cliquez sur "Ajouter un champ" pour commencer.
                  </div>
                )}
              </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Variable Name *</label>
              <input 
                type="text" 
                value={config.variableName || ''} 
                onChange={(e) => setConfig({ ...config, variableName: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" 
                placeholder="ex: user_email, total_amount" 
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Nom unique pour identifier cette variable dans le workflow
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de variable</label>
              <select 
                value={config.variableType || 'string'} 
                onChange={(e) => setConfig({ ...config, variableType: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="string">Texte (String)</option>
                <option value="number">Nombre (Number)</option>
                <option value="boolean">Booléen (True/False)</option>
                <option value="date">Date</option>
                <option value="array">Liste (Array)</option>
                <option value="object">Objet (Object)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valeur initiale</label>
              <input 
                type="text" 
                value={config.value || ''} 
                onChange={(e) => setConfig({ ...config, value: e.target.value })}
                className="w-full px-3 py-2 border rounded-md" 
                placeholder="Valeur par défaut ou expression" 
              />
              <p className="text-xs text-gray-500 mt-1">
                Optionnel - Valeur ou expression pour initialiser la variable
              </p>
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
    <>
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsFullscreen(false)}
        />
      )}
      <div className={`bg-white rounded-lg shadow-sm border p-3 overflow-auto transition-all ${
        isFullscreen 
          ? 'fixed top-4 left-1/2 -translate-x-1/2 w-[800px] max-w-[90vw] h-[calc(100vh-2rem)] z-50' 
          : 'h-full'
      }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Node Configuration</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)} 
            className="p-1 hover:bg-gray-100 rounded"
            title={isFullscreen ? "R\u00e9duire" : "Agrandir"}
          >
            <ArrowsPointingOutIcon className="h-5 w-5" />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
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
    </>
  );
}
