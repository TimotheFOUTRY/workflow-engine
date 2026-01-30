import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { workflowApi } from '../services/workflowApi';
import { useTasks } from '../hooks/useTasks';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  PlayIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function WorkflowDashboard() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const { data: tasksResponse } = useTasks({ status: 'pending' });
  const tasks = tasksResponse?.data || [];

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const response = await workflowApi.getAccessibleWorkflows();
      const workflowsData = response.data || [];
      setWorkflows(workflowsData);
      
      // Select first workflow by default
      if (workflowsData.length > 0 && !selectedWorkflow) {
        handleSelectWorkflow(workflowsData[0]);
      }
    } catch (error) {
      toast.error('Échec du chargement des workflows');
      console.error(error);
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWorkflow = async (workflow) => {
    setSelectedWorkflow(workflow);
    try {
      const response = await workflowApi.getWorkflow(workflow.id);
      const fullWorkflow = response.data;
      
      if (fullWorkflow.definition) {
        const definition = typeof fullWorkflow.definition === 'string' 
          ? JSON.parse(fullWorkflow.definition) 
          : fullWorkflow.definition;
        
        setNodes(definition.nodes || []);
        setEdges(definition.edges || []);
      } else {
        setNodes([]);
        setEdges([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du workflow:', error);
      setNodes([]);
      setEdges([]);
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
      low: 'text-gray-500',
      medium: 'text-yellow-500',
      high: 'text-orange-500',
      urgent: 'text-red-500',
    };
    return colors[priority] || 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Workflows</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          {sidebarOpen ? (
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Sidebar - Tasks & Workflows */}
      <div
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } lg:block w-full lg:w-80 xl:w-96 bg-white border-r flex flex-col overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Mes tâches</h2>
            <Link
              to="/tasks"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Voir tout
            </Link>
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircleIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Aucune tâche en attente</p>
            </div>
          ) : (
            tasks.slice(0, 5).map((task) => (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                    {task.name}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-500 space-x-3">
                  <span className={`flex items-center ${getPriorityColor(task.priority)}`}>
                    <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                    {task.priority}
                  </span>
                  {task.dueDate && (
                    <span className="flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {format(new Date(task.dueDate), 'dd/MM')}
                    </span>
                  )}
                </div>
              </Link>
            ))
          )}

          {/* Workflows Section */}
          <div className="pt-4 mt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Workflows</h3>
              <Link
                to="/workflows/new"
                className="text-indigo-600 hover:text-indigo-700"
              >
                <PlusIcon className="h-5 w-5" />
              </Link>
            </div>
            <div className="space-y-2">
              {workflows.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucun workflow disponible
                </p>
              ) : (
                workflows.map((workflow) => (
                  <button
                    key={workflow.id}
                    onClick={() => handleSelectWorkflow(workflow)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedWorkflow?.id === workflow.id
                        ? 'bg-indigo-50 border-2 border-indigo-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {workflow.name}
                      </h4>
                      {workflow.isPublic && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                          Public
                        </span>
                      )}
                    </div>
                    {workflow.description && (
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {workflow.description}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - ReactFlow */}
      <div className="flex-1 bg-gray-50 relative">
        {selectedWorkflow ? (
          <>
            {/* Workflow Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b p-4 flex items-center justify-between shadow-sm">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 truncate">
                  {selectedWorkflow.name}
                </h2>
                {selectedWorkflow.description && (
                  <p className="text-sm text-gray-500 truncate">
                    {selectedWorkflow.description}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => navigate(`/workflows/start`)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <PlayIcon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Démarrer</span>
                </button>
                <button
                  onClick={() => navigate(`/workflows/${selectedWorkflow.id}/edit`)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Modifier</span>
                </button>
                <button
                  onClick={() => navigate(`/workflows/${selectedWorkflow.id}/instances`)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Instances</span>
                </button>
              </div>
            </div>

            {/* ReactFlow Canvas */}
            <div className="h-full pt-20">
              {nodes.length > 0 ? (
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  fitView
                  attributionPosition="bottom-left"
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={true}
                >
                  <Background />
                  <Controls />
                  <MiniMap />
                </ReactFlow>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-gray-500 mb-4">Ce workflow n'a pas encore de définition</p>
                    <button
                      onClick={() => navigate(`/workflows/${selectedWorkflow.id}/edit`)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Créer le workflow
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Sélectionnez un workflow pour le visualiser</p>
              <Link
                to="/workflows/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Créer un nouveau workflow
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
