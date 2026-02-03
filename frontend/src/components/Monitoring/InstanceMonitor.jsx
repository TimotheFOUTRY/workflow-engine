import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { workflowApi } from '../../services/workflowApi';
import { useInstancesByWorkflow } from '../../hooks/useInstances';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function InstanceMonitor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const { data: instances = [], isLoading: loading } = useInstancesByWorkflow(id);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });

  useEffect(() => {
    loadWorkflow();
  }, [id]);

  const loadWorkflow = async () => {
    try {
      const workflowData = await workflowApi.getWorkflow(id);
      setWorkflow(workflowData);
    } catch (error) {
      toast.error('Failed to load workflow');
      console.error(error);
    }
  };

  const handleCancel = async (instanceId) => {
    try {
      await workflowApi.cancelWorkflowInstance(instanceId);
      toast.success('Workflow instance cancelled');
      loadData();
    } catch (error) {
      toast.error('Failed to cancel workflow instance');
      console.error(error);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      running: <ClockIcon className="h-5 w-5 text-blue-600" />,
      completed: <CheckCircleIcon className="h-5 w-5 text-green-600" />,
      failed: <XCircleIcon className="h-5 w-5 text-red-600" />,
      cancelled: <ExclamationCircleIcon className="h-5 w-5 text-gray-600" />,
    };
    return icons[status] || <ClockIcon className="h-5 w-5 text-gray-600" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/workflows" className="p-2 hover:bg-gray-100 rounded-md">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">
            {workflow?.name} - Instances
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {instances.length} instance{instances.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search instances..."
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Instances List */}
      <div className="bg-white shadow-sm rounded-lg border">
        {instances.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2">No instances found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {instances
              .filter(instance => {
                if (filters.status && instance.status !== filters.status) return false;
                if (filters.search && !instance.id.includes(filters.search)) return false;
                return true;
              })
              .map((instance) => (
              <div
                key={instance.id}
                className="px-6 py-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(instance.status)}
                    <div>
                      <p className="font-medium text-gray-900">
                        Instance #{instance.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Started by {instance.starter?.username || 'System'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                      instance.status
                    )}`}
                  >
                    {instance.status}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-500 mt-2">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    Started: {format(new Date(instance.startedAt), 'MMM d, yyyy HH:mm')}
                  </span>
                  {instance.completedAt && (
                    <span className="flex items-center gap-1">
                      Completed: {format(new Date(instance.completedAt), 'MMM d, yyyy HH:mm')}
                    </span>
                  )}
                  {instance.currentStep && (
                    <span className="flex items-center gap-1">
                      Current: {instance.currentStep}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => navigate(`/workflows/${id}/instances/${instance.id}`)}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 flex items-center gap-1"
                  >
                    <EyeIcon className="h-4 w-4" />
                    Voir les détails
                  </button>
                  {instance.status === 'running' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel(instance.id);
                      }}
                      className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instance Detail Modal */}
      {selectedInstance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Instance #{selectedInstance.id.slice(-8)}
              </h3>
              <button
                onClick={() => setSelectedInstance(null)}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Timeline */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Status</h4>
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedInstance.status)}
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(
                      selectedInstance.status
                    )}`}
                  >
                    {selectedInstance.status}
                  </span>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Started:</span>{' '}
                    {format(new Date(selectedInstance.startedAt), 'PPpp')}
                  </p>
                  {selectedInstance.completedAt && (
                    <p>
                      <span className="font-medium">Completed:</span>{' '}
                      {format(new Date(selectedInstance.completedAt), 'PPpp')}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Started by:</span>{' '}
                    {selectedInstance.startedBy || 'System'}
                  </p>
                </div>
              </div>

              {/* Current State */}
              {selectedInstance.currentNode && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Current State</h4>
                  <p className="text-sm text-gray-600">
                    Node: <span className="font-mono">{selectedInstance.currentNode}</span>
                  </p>
                </div>
              )}

              {/* Data */}
              {selectedInstance.data && Object.keys(selectedInstance.data).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Instance Data</h4>
                  <pre className="text-xs bg-gray-50 p-4 rounded-md overflow-auto">
                    {JSON.stringify(selectedInstance.data, null, 2)}
                  </pre>
                </div>
              )}

              {/* Error */}
              {selectedInstance.error && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Error</h4>
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-800">{selectedInstance.error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
