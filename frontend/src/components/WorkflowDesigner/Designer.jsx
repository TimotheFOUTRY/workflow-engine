import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import NodePalette from './NodePalette';
import NodeConfig from './NodeConfig';
import { workflowApi } from '../../services/workflowApi';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const nodeTypes = {
  start: ({ data }) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-green-100 border-2 border-green-400">
      <div className="font-bold text-green-700">▶ Start</div>
      <div className="text-xs text-gray-600">{data.label}</div>
    </div>
  ),
  task: ({ data }) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-blue-100 border-2 border-blue-400">
      <div className="font-bold text-blue-700">📋 Task</div>
      <div className="text-xs text-gray-700">{data.label}</div>
    </div>
  ),
  approval: ({ data }) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-yellow-100 border-2 border-yellow-400">
      <div className="font-bold text-yellow-700">✓ Approval</div>
      <div className="text-xs text-gray-700">{data.label}</div>
    </div>
  ),
  condition: ({ data }) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-purple-100 border-2 border-purple-400 rotate-45">
      <div className="-rotate-45">
        <div className="font-bold text-purple-700 text-center">◆</div>
        <div className="text-xs text-gray-700 text-center">{data.label}</div>
      </div>
    </div>
  ),
  timer: ({ data }) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-orange-100 border-2 border-orange-400">
      <div className="font-bold text-orange-700">⏱ Timer</div>
      <div className="text-xs text-gray-700">{data.label}</div>
    </div>
  ),
  end: ({ data }) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-red-100 border-2 border-red-400">
      <div className="font-bold text-red-700">■ End</div>
      <div className="text-xs text-gray-600">{data.label}</div>
    </div>
  ),
};

export default function Designer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadWorkflow();
    } else {
      // Initialize with a start node
      const startNode = {
        id: 'start-1',
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: 'Start', config: {} },
      };
      setNodes([startNode]);
    }
  }, [id]);

  const loadWorkflow = async () => {
    try {
      const workflow = await workflowApi.getWorkflow(id);
      setWorkflowName(workflow.name);
      setWorkflowDescription(workflow.description || '');
      
      if (workflow.definition?.nodes) {
        setNodes(workflow.definition.nodes);
      }
      if (workflow.definition?.edges) {
        setEdges(workflow.definition.edges);
      }
    } catch (error) {
      toast.error('Failed to load workflow');
      console.error(error);
    }
  };

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      ),
    [setEdges]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = event.target.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (!type) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 50,
        y: event.clientY - reactFlowBounds.top - 20,
      };

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: type.charAt(0).toUpperCase() + type.slice(1), config: {} },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const updateNodeData = useCallback(
    (nodeId, newData) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
        )
      );
    },
    [setNodes]
  );

  const handleSave = async () => {
    if (!workflowName.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    try {
      setSaving(true);
      const workflowData = {
        name: workflowName,
        description: workflowDescription,
        definition: {
          nodes,
          edges,
        },
        status: 'draft',
      };

      if (id) {
        await workflowApi.updateWorkflow(id, workflowData);
        toast.success('Workflow updated successfully');
      } else {
        const result = await workflowApi.createWorkflow(workflowData);
        toast.success('Workflow created successfully');
        navigate(`/workflows/${result._id}/edit`);
      }
    } catch (error) {
      toast.error('Failed to save workflow');
      console.error(error);
    } finally {
      setSaving(false);
    }
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
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="text-lg font-semibold w-full border-0 border-b-2 border-transparent hover:border-gray-300 focus:border-indigo-500 focus:ring-0 px-2 py-1"
                placeholder="Workflow Name"
              />
              <input
                type="text"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                className="text-sm text-gray-500 w-full border-0 border-b-2 border-transparent hover:border-gray-300 focus:border-indigo-500 focus:ring-0 px-2 py-1 mt-1"
                placeholder="Description"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex gap-4 h-full">
        {/* Node Palette */}
        <div className="w-64 flex-shrink-0">
          <NodePalette />
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Node Configuration */}
        {selectedNode && (
          <div className="w-80 flex-shrink-0">
            <NodeConfig
              node={selectedNode}
              onUpdate={(data) => updateNodeData(selectedNode.id, data)}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
