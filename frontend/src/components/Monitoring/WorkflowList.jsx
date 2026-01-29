import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workflowApi } from '../../services/workflowApi';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function WorkflowList() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadWorkflows();
  }, [search]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const response = await workflowApi.getAllWorkflows(params);
      setWorkflows(response.data || []);
    } catch (error) {
      toast.error('Failed to load workflows');
      console.error(error);
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await workflowApi.deleteWorkflow(id);
      toast.success('Workflow deleted successfully');
      setDeleteConfirm(null);
      loadWorkflows();
    } catch (error) {
      toast.error('Failed to delete workflow');
      console.error(error);
    }
  };

  const handleStart = async (id) => {
    try {
      await workflowApi.startWorkflow(id, {});
      toast.success('Workflow started successfully');
    } catch (error) {
      toast.error('Failed to start workflow');
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-red-100 text-red-800',
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflows</h2>
          <p className="mt-1 text-sm text-gray-500">
            {workflows.length} workflow{workflows.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Link
          to="/workflows/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Create Workflow
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workflows..."
            className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p>No workflows found</p>
            <Link
              to="/workflows/new"
              className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-500"
            >
              <PlusIcon className="h-5 w-5" />
              Create your first workflow
            </Link>
          </div>
        ) : (
          workflows.map((workflow) => (
            <div
              key={workflow._id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    {workflow.name}
                  </h3>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                      workflow.status
                    )}`}
                  >
                    {workflow.status}
                  </span>
                </div>

                {workflow.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {workflow.description}
                  </p>
                )}

                <div className="text-xs text-gray-500 mb-4">
                  <p>Created: {format(new Date(workflow.createdAt), 'MMM d, yyyy')}</p>
                  {workflow.updatedAt && (
                    <p>Updated: {format(new Date(workflow.updatedAt), 'MMM d, yyyy')}</p>
                  )}
                  {workflow.version && <p>Version: {workflow.version}</p>}
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/workflows/${workflow._id}/edit`}
                    className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 flex items-center justify-center gap-1 text-sm"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </Link>
                  <Link
                    to={`/workflows/${workflow._id}/instances`}
                    className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 flex items-center justify-center gap-1 text-sm"
                  >
                    <EyeIcon className="h-4 w-4" />
                    Monitor
                  </Link>
                </div>

                <div className="flex gap-2 mt-2">
                  {workflow.status === 'active' && (
                    <button
                      onClick={() => handleStart(workflow._id)}
                      className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 flex items-center justify-center gap-1 text-sm"
                    >
                      <PlayIcon className="h-4 w-4" />
                      Start
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteConfirm(workflow._id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 flex items-center justify-center gap-1 text-sm"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Workflow</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this workflow? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
