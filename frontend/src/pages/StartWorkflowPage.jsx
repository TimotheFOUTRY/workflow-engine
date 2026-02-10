import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  PlayIcon,
  RocketLaunchIcon,
  ClockIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const StartWorkflowPage = () => {
  const navigate = useNavigate();
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showStartModal, setShowStartModal] = useState(false);

  // Get accessible workflows
  const { data: workflows = [], isLoading, refetch } = useQuery({
    queryKey: ['workflows', 'accessible'],
    queryFn: async () => {
      const response = await api.get('/workflows/accessible');
      return response.data;
    },
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Start workflow mutation
  const startWorkflowMutation = useMutation({
    mutationFn: async ({ workflowId, data }) => {
      const response = await api.post(`/workflows/${workflowId}/start`, { data });
      return response.data;
    },
    onSuccess: (result) => {
      toast.success('Workflow démarré avec succès !');
      setShowStartModal(false);
      setSelectedWorkflow(null);
      // Navigate to the instance monitor
      navigate(`/workflows/${result.workflowId}/instances`);
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors du démarrage du workflow');
    }
  });

  const handleStartWorkflow = (workflow) => {
    setSelectedWorkflow(workflow);
    setShowStartModal(true);
  };

  const confirmStart = () => {
    if (selectedWorkflow) {
      startWorkflowMutation.mutate({
        workflowId: selectedWorkflow.id,
        data: {}
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement des workflows...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <RocketLaunchIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Démarrer un Workflow</h1>
          </div>
          <p className="text-gray-600">
            Sélectionnez un workflow pour le lancer
          </p>
        </div>

        {/* Workflows Grid */}
        {workflows.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <RocketLaunchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun workflow accessible
            </h3>
            <p className="text-gray-500">
              Vous n'avez accès à aucun workflow pour le moment. Contactez un administrateur pour obtenir des permissions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {workflow.name}
                    </h3>
                    {workflow.description && (
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                        {workflow.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                  {workflow.isPublic ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Public
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      <InformationCircleIcon className="h-3 w-3 mr-1" />
                      Restreint
                    </span>
                  )}
                  <span className="flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {new Date(workflow.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleStartWorkflow(workflow)}
                  disabled={startWorkflowMutation.isPending}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Démarrer ce workflow
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Confirmation Modal */}
      {showStartModal && selectedWorkflow && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-4">
                <RocketLaunchIcon className="h-6 w-6 text-blue-600" />
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                Démarrer le workflow ?
              </h3>
              
              <p className="text-sm text-gray-500 text-center mb-6">
                Vous êtes sur le point de démarrer le workflow <strong>{selectedWorkflow.name}</strong>.
              </p>

              {selectedWorkflow.description && (
                <div className="bg-gray-50 rounded-lg p-3 mb-6">
                  <p className="text-sm text-gray-600">
                    {selectedWorkflow.description}
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowStartModal(false);
                    setSelectedWorkflow(null);
                  }}
                  disabled={startWorkflowMutation.isPending}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmStart}
                  disabled={startWorkflowMutation.isPending}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {startWorkflowMutation.isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Démarrage...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Démarrer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartWorkflowPage;
