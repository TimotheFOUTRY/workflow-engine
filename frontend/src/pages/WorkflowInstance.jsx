import { useParams, useNavigate } from 'react-router-dom';
import { useInstance, useSubscribeToInstance, useUnsubscribeFromInstance } from '../hooks/useInstances';
import ReactFlow, {
  Background,
  Controls,
  MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  ArrowLeftIcon,
  BellIcon,
  BellSlashIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const statusColors = {
  running: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
};

const statusIcons = {
  running: ClockIcon,
  completed: CheckCircleIcon,
  failed: XCircleIcon,
  cancelled: XCircleIcon
};

function WorkflowInstance() {
  const { workflowId, instanceId } = useParams();
  const navigate = useNavigate();
  const { data: instance, isLoading, error } = useInstance(instanceId);
  const subscribeMutation = useSubscribeToInstance();
  const unsubscribeMutation = useUnsubscribeFromInstance();

  const handleSubscribe = () => {
    if (instance?.isSubscribed) {
      unsubscribeMutation.mutate(instanceId);
    } else {
      subscribeMutation.mutate(instanceId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Chargement de l'instance...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Erreur: {error.message}</div>
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Instance non trouvée</div>
      </div>
    );
  }

  const StatusIcon = statusIcons[instance.status] || ClockIcon;

  // Color nodes based on execution state
  const executedNodeIds = new Set(
    instance.history
      .filter(h => h.action === 'node_executed' || h.action === 'node_completed')
      .map(h => h.data?.nodeId)
  );

  const currentNodeId = instance.currentStep;

  const coloredNodes = instance.workflow.definition.nodes?.map(node => ({
    ...node,
    data: {
      ...node.data,
      executed: executedNodeIds.has(node.id),
      current: node.id === currentNodeId
    },
    style: {
      ...node.style,
      background: executedNodeIds.has(node.id)
        ? '#10b981'
        : node.id === currentNodeId
        ? '#3b82f6'
        : '#f3f4f6',
      color: executedNodeIds.has(node.id) || node.id === currentNodeId ? '#fff' : '#111',
      borderColor: node.id === currentNodeId ? '#2563eb' : '#d1d5db',
      borderWidth: node.id === currentNodeId ? 3 : 1
    }
  })) || [];

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Sidebar - History Timeline */}
      <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <button
            onClick={() => navigate(`/workflows`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Retour
          </button>

          {/* Instance Info */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {instance.workflow.name}
            </h1>
            <p className="text-sm text-gray-500 mb-4">
              Instance #{instanceId.slice(0, 8)}
            </p>

            {/* Status Badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[instance.status]}`}>
                <StatusIcon className="w-4 h-4 mr-1" />
                {instance.status === 'running' && 'En cours'}
                {instance.status === 'completed' && 'Terminé'}
                {instance.status === 'failed' && 'Échoué'}
                {instance.status === 'cancelled' && 'Annulé'}
              </span>

              {/* Progress */}
              {instance.status === 'running' && (
                <span className="text-sm text-gray-600">
                  {instance.progress}%
                </span>
              )}
            </div>

            {/* Subscribe Button */}
            <button
              onClick={handleSubscribe}
              disabled={subscribeMutation.isLoading || unsubscribeMutation.isLoading}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                instance.isSubscribed
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {instance.isSubscribed ? (
                <>
                  <BellSlashIcon className="w-4 h-4" />
                  Se désabonner
                </>
              ) : (
                <>
                  <BellIcon className="w-4 h-4" />
                  S'abonner aux notifications
                </>
              )}
            </button>
          </div>

          {/* Timeline */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Historique</h2>
            <div className="space-y-4">
              {instance.history.map((event, index) => (
                <div key={event.id} className="relative pl-6">
                  {/* Timeline Line */}
                  {index < instance.history.length - 1 && (
                    <div className="absolute left-1.5 top-6 bottom-0 w-0.5 bg-gray-200" />
                  )}

                  {/* Timeline Dot */}
                  <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ${
                    event.action.includes('completed') || event.action.includes('executed')
                      ? 'bg-green-500'
                      : event.action.includes('failed') || event.action.includes('rejected')
                      ? 'bg-red-500'
                      : event.action.includes('started')
                      ? 'bg-blue-500'
                      : 'bg-gray-400'
                  }`} />

                  {/* Event Content */}
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {event.stepName}
                    </div>
                    <div className="text-gray-500">
                      {event.action === 'workflow_started' && 'Workflow démarré'}
                      {event.action === 'node_executed' && 'Nœud exécuté'}
                      {event.action === 'node_completed' && 'Nœud complété'}
                      {event.action === 'form_task_created' && 'Tâche de formulaire créée'}
                      {event.action === 'task_created' && 'Tâche créée'}
                      {event.action === 'task_completed' && 'Tâche complétée'}
                      {event.action === 'task_rejected' && 'Tâche rejetée'}
                      {event.action === 'approval_started' && 'Approbation démarrée'}
                      {event.action === 'condition_evaluated' && 'Condition évaluée'}
                      {event.action === 'variable_set' && 'Variable définie'}
                      {event.action === 'workflow_completed' && 'Workflow terminé'}
                      {event.action === 'workflow_failed' && 'Workflow échoué'}
                      {event.action === 'workflow_cancelled' && 'Workflow annulé'}
                    </div>
                    {event.user && (
                      <div className="text-xs text-gray-400 mt-1">
                        Par {event.user.firstName} {event.user.lastName}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(event.createdAt).toLocaleString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - ReactFlow Visualization */}
      <div className="flex-1">
        {coloredNodes.length > 0 ? (
          <ReactFlow
            nodes={coloredNodes}
            edges={instance.workflow.definition.edges || []}
            fitView
            attributionPosition="bottom-left"
          >
            <Background />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                if (executedNodeIds.has(node.id)) return '#10b981';
                if (node.id === currentNodeId) return '#3b82f6';
                return '#f3f4f6';
              }}
            />
          </ReactFlow>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Aucune définition de workflow</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkflowInstance;
