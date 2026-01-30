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
  Panel,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import NodePalette from './NodePalette';
import NodeConfig from './NodeConfig';
import { workflowApi } from '../../services/workflowApi';
import toast from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  ArrowUturnLeftIcon, 
  ArrowUturnRightIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline';

// Custom Node Components with Handles
const CustomNode = ({ data, type, color, icon, title, isStart = false, isEnd = false }) => (
  <div className={`px-4 py-3 shadow-lg rounded-lg border-2 ${color} min-w-[120px] transition-all hover:shadow-xl`}>
    {!isStart && (
      <Handle 
        type="target" 
        position={Position.Top}
        id="target-top"
        className="w-3 h-3 !bg-indigo-500"
        isConnectable={true}
      />
    )}
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <div>
        <div className="font-bold text-sm">{title}</div>
        <div className="text-xs mt-1 text-gray-600">{data.label}</div>
      </div>
    </div>
    {!isEnd && (
      <Handle 
        type="source" 
        position={Position.Bottom}
        id="source-bottom"
        className="w-3 h-3 !bg-indigo-500"
        isConnectable={true}
      />
    )}
  </div>
);

const nodeTypes = {
  start: (props) => (
    <CustomNode 
      {...props} 
      color="bg-green-50 border-green-400 hover:bg-green-100" 
      icon="▶" 
      title="Start"
      isStart={true}
    />
  ),
  approval: (props) => (
    <CustomNode 
      {...props} 
      color="bg-yellow-50 border-yellow-400 hover:bg-yellow-100" 
      icon="✓" 
      title="Approval" 
    />
  ),
  form: (props) => (
    <CustomNode 
      {...props} 
      color="bg-blue-50 border-blue-400 hover:bg-blue-100" 
      icon="📋" 
      title="Formulaire" 
    />
  ),
  condition: (props) => (
    <CustomNode 
      {...props} 
      color="bg-purple-50 border-purple-400 hover:bg-purple-100" 
      icon="◆" 
      title="Condition" 
    />
  ),
  timer: (props) => (
    <CustomNode 
      {...props} 
      color="bg-orange-50 border-orange-400 hover:bg-orange-100" 
      icon="⏱" 
      title="Timer" 
    />
  ),
  end: (props) => (
    <CustomNode 
      {...props} 
      color="bg-red-50 border-red-400 hover:bg-red-100" 
      icon="■" 
      title="End"
      isEnd={true}
    />
  ),
  // Notifications
  email: (props) => (
    <CustomNode 
      {...props} 
      color="bg-cyan-50 border-cyan-400 hover:bg-cyan-100" 
      icon="✉️" 
      title="Email" 
    />
  ),
  notification: (props) => (
    <CustomNode 
      {...props} 
      color="bg-pink-50 border-pink-400 hover:bg-pink-100" 
      icon="🔔" 
      title="Notification" 
    />
  ),
  sms: (props) => (
    <CustomNode 
      {...props} 
      color="bg-teal-50 border-teal-400 hover:bg-teal-100" 
      icon="📱" 
      title="SMS" 
    />
  ),
  // Logic & Control
  loop: (props) => (
    <CustomNode 
      {...props} 
      color="bg-violet-50 border-violet-400 hover:bg-violet-100" 
      icon="🔁" 
      title="Loop" 
    />
  ),
  parallel: (props) => (
    <CustomNode 
      {...props} 
      color="bg-fuchsia-50 border-fuchsia-400 hover:bg-fuchsia-100" 
      icon="⫸" 
      title="Parallel" 
    />
  ),
  switch: (props) => (
    <CustomNode 
      {...props} 
      color="bg-indigo-50 border-indigo-400 hover:bg-indigo-100" 
      icon="🔀" 
      title="Switch" 
    />
  ),
  // Data Operations
  variable: (props) => (
    <CustomNode 
      {...props} 
      color="bg-slate-50 border-slate-400 hover:bg-slate-100" 
      icon="💾" 
      title="Variable" 
    />
  ),
  query: (props) => (
    <CustomNode 
      {...props} 
      color="bg-sky-50 border-sky-400 hover:bg-sky-100" 
      icon="🔍" 
      title="Query" 
    />
  ),
  calculate: (props) => (
    <CustomNode 
      {...props} 
      color="bg-emerald-50 border-emerald-400 hover:bg-emerald-100" 
      icon="🧮" 
      title="Calculate" 
    />
  ),
  // CRUD Operations
  create: (props) => (
    <CustomNode 
      {...props} 
      color="bg-green-50 border-green-500 hover:bg-green-100" 
      icon="➕" 
      title="Create Item" 
    />
  ),
  update: (props) => (
    <CustomNode 
      {...props} 
      color="bg-blue-50 border-blue-500 hover:bg-blue-100" 
      icon="✏️" 
      title="Update Item" 
    />
  ),
  delete: (props) => (
    <CustomNode 
      {...props} 
      color="bg-rose-50 border-rose-400 hover:bg-rose-100" 
      icon="🗑️" 
      title="Delete Item" 
    />
  ),
  // Integration
  api: (props) => (
    <CustomNode 
      {...props} 
      color="bg-amber-50 border-amber-400 hover:bg-amber-100" 
      icon="🔌" 
      title="API Call" 
    />
  ),
  webhook: (props) => (
    <CustomNode 
      {...props} 
      color="bg-lime-50 border-lime-400 hover:bg-lime-100" 
      icon="🪝" 
      title="Webhook" 
    />
  ),
  database: (props) => (
    <CustomNode 
      {...props} 
      color="bg-cyan-50 border-cyan-500 hover:bg-cyan-100" 
      icon="🗄️" 
      title="Database" 
    />
  ),
  // Document Operations
  document: (props) => (
    <CustomNode 
      {...props} 
      color="bg-orange-50 border-orange-500 hover:bg-orange-100" 
      icon="📄" 
      title="Document" 
    />
  ),
  pdf: (props) => (
    <CustomNode 
      {...props} 
      color="bg-red-50 border-red-500 hover:bg-red-100" 
      icon="📕" 
      title="PDF" 
    />
  ),
  // User & Permissions
  user: (props) => (
    <CustomNode 
      {...props} 
      color="bg-purple-50 border-purple-500 hover:bg-purple-100" 
      icon="👤" 
      title="User Action" 
    />
  ),
  permission: (props) => (
    <CustomNode 
      {...props} 
      color="bg-yellow-50 border-yellow-500 hover:bg-yellow-100" 
      icon="🔐" 
      title="Permission" 
    />
  ),
  // Advanced
  script: (props) => (
    <CustomNode 
      {...props} 
      color="bg-gray-50 border-gray-400 hover:bg-gray-100" 
      icon="</>" 
      title="Script" 
    />
  ),
  log: (props) => (
    <CustomNode 
      {...props} 
      color="bg-stone-50 border-stone-400 hover:bg-stone-100" 
      icon="📝" 
      title="Log" 
    />
  ),
};

function DesignerContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fitView, zoomIn, zoomOut, screenToFlowPosition } = useReactFlow();
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
      const response = await workflowApi.getWorkflow(id);
      const workflow = response.data || response;
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
            style: { stroke: '#6366f1', strokeWidth: 2 },
            markerEnd: { 
              type: MarkerType.ArrowClosed,
              color: '#6366f1',
            },
          },
          eds
        )
      ),
    [setEdges]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: type.charAt(0).toUpperCase() + type.slice(1), config: {} },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
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

  const onNodesDelete = useCallback(
    (deleted) => {
      // Close config panel if deleted node was selected
      if (selectedNode && deleted.some(node => node.id === selectedNode.id)) {
        setSelectedNode(null);
      }
    },
    [selectedNode]
  );

  const onEdgesDelete = useCallback(() => {
    // Optional: Add logic when edges are deleted
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white shadow-sm border-b mb-2 sm:mb-4 p-2 sm:p-4 rounded-lg flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4 flex-1">
            <button
              onClick={() => navigate('/workflows')}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-md flex-shrink-0"
            >
              <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <div className="flex-1">
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="text-base sm:text-lg font-semibold w-full border-0 border-b-2 border-transparent hover:border-gray-300 focus:border-indigo-500 focus:ring-0 px-1 sm:px-2 py-1"
                placeholder="Workflow Name"
              />
              <input
                type="text"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                className="text-xs sm:text-sm text-gray-500 w-full border-0 border-b-2 border-transparent hover:border-gray-300 focus:border-indigo-500 focus:ring-0 px-1 sm:px-2 py-1 mt-1"
                placeholder="Description"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 text-sm whitespace-nowrap"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-2 sm:gap-4 flex-1 min-h-0">{/* Node Palette - Hidden on mobile by default, can be toggled */}
        <div className="hidden lg:block lg:w-64 flex-shrink-0">
          <NodePalette />
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border relative h-[500px] lg:h-full">
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
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Shift"
            snapToGrid
            snapGrid={[15, 15]}
            connectionMode="loose"
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#6366f1', strokeWidth: 2 },
              markerEnd: { 
                type: MarkerType.ArrowClosed,
                color: '#6366f1',
              },
            }}
          >
            <Background gap={15} size={1} />
            <Controls showInteractive={false} />
            <MiniMap 
              nodeStrokeWidth={3}
              zoomable
              pannable
            />
            
            {/* Custom Controls Panel */}
            <Panel position="top-right" className="bg-white rounded-lg shadow-lg border p-1.5 sm:p-2 flex gap-1.5 sm:gap-2">
              <button
                onClick={() => zoomIn()}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Zoom In"
              >
                <MagnifyingGlassPlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => zoomOut()}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Zoom Out"
              >
                <MagnifyingGlassMinusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => fitView({ padding: 0.2 })}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Fit View"
              >
                <Square3Stack3DIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </Panel>

            {/* Info Panel - Hidden on small screens */}
            <Panel position="bottom-left" className="hidden sm:block bg-white rounded-lg shadow-lg border p-2 sm:p-3">
              <div className="text-xs text-gray-600 space-y-1">
                <div>Nodes: {nodes.length}</div>
                <div>Connections: {edges.length}</div>
                <div className="pt-2 border-t mt-2 space-y-1">
                  <div>💡 Drag nodes from palette</div>
                  <div>🗑️ Press Delete to remove</div>
                  <div>⇧ Shift + Click for multi-select</div>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Node Configuration */}
        {selectedNode && (
          <>
            {/* Desktop: sidebar */}
            <div className="hidden lg:block lg:w-80 flex-shrink-0">
              <NodeConfig
                node={selectedNode}
                nodes={nodes}
                onUpdate={(data) => updateNodeData(selectedNode.id, data)}
                onClose={() => setSelectedNode(null)}
              />
            </div>
            
            {/* Mobile/Tablet: Modal overlay */}
            <div className="lg:hidden fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex items-end sm:items-center justify-center">
              <div className="bg-white w-full sm:max-w-lg sm:mx-4 rounded-t-xl sm:rounded-xl shadow-xl max-h-[80vh] overflow-hidden">
                <NodeConfig
                  node={selectedNode}
                  nodes={nodes}
                  onUpdate={(data) => updateNodeData(selectedNode.id, data)}
                  onClose={() => setSelectedNode(null)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Wrapper with ReactFlowProvider
export default function Designer() {
  return (
    <ReactFlowProvider>
      <DesignerContent />
    </ReactFlowProvider>
  );
}
