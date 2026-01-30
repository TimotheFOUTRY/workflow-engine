import React from 'react';

const nodeTypes = [
  // Core Workflow
  {
    type: 'start',
    label: 'Start',
    icon: '▶',
    color: 'bg-green-100 border-green-400 text-green-700',
    description: 'Workflow start point',
    category: 'Core',
  },
  {
    type: 'end',
    label: 'End',
    icon: '■',
    color: 'bg-red-100 border-red-400 text-red-700',
    description: 'Workflow end point',
    category: 'Core',
  },
  
  // Task Actions
  {
    type: 'approval',
    label: 'Approval',
    icon: '✓',
    color: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    description: 'Request approval',
    category: 'Tasks',
  },
  {
    type: 'form',
    label: 'Formulaire',
    icon: '📋',
    color: 'bg-blue-100 border-blue-400 text-blue-700',
    description: 'Task avec formulaire',
    category: 'Tasks',
  },
  
  // Logic & Control
  {
    type: 'condition',
    label: 'Condition',
    icon: '◆',
    color: 'bg-purple-100 border-purple-400 text-purple-700',
    description: 'Conditional branching',
    category: 'Logic',
  },
  {
    type: 'switch',
    label: 'Switch',
    icon: '🔀',
    color: 'bg-indigo-100 border-indigo-400 text-indigo-700',
    description: 'Multi-way branch',
    category: 'Logic',
  },
  {
    type: 'loop',
    label: 'Loop',
    icon: '🔁',
    color: 'bg-violet-100 border-violet-400 text-violet-700',
    description: 'Loop over collection',
    category: 'Logic',
  },
  {
    type: 'parallel',
    label: 'Parallel',
    icon: '⫸',
    color: 'bg-fuchsia-100 border-fuchsia-400 text-fuchsia-700',
    description: 'Run actions in parallel',
    category: 'Logic',
  },
  {
    type: 'timer',
    label: 'Timer',
    icon: '⏱',
    color: 'bg-orange-100 border-orange-400 text-orange-700',
    description: 'Wait/delay step',
    category: 'Logic',
  },
  
  // Notifications
  {
    type: 'email',
    label: 'Send Email',
    icon: '✉️',
    color: 'bg-cyan-100 border-cyan-400 text-cyan-700',
    description: 'Send email notification',
    category: 'Notifications',
  },
  {
    type: 'notification',
    label: 'Notification',
    icon: '🔔',
    color: 'bg-pink-100 border-pink-400 text-pink-700',
    description: 'Send push notification',
    category: 'Notifications',
  },
  {
    type: 'sms',
    label: 'Send SMS',
    icon: '📱',
    color: 'bg-teal-100 border-teal-400 text-teal-700',
    description: 'Send SMS message',
    category: 'Notifications',
  },
  
  // Data Operations
  {
    type: 'variable',
    label: 'Set Variable',
    icon: '💾',
    color: 'bg-slate-100 border-slate-400 text-slate-700',
    description: 'Store/retrieve variable',
    category: 'Data',
  },
  {
    type: 'query',
    label: 'Query Data',
    icon: '🔍',
    color: 'bg-sky-100 border-sky-400 text-sky-700',
    description: 'Query list or database',
    category: 'Data',
  },
  {
    type: 'calculate',
    label: 'Calculate',
    icon: '🧮',
    color: 'bg-emerald-100 border-emerald-400 text-emerald-700',
    description: 'Math operations',
    category: 'Data',
  },
  
  // CRUD Operations
  {
    type: 'create',
    label: 'Create Item',
    icon: '➕',
    color: 'bg-green-100 border-green-500 text-green-700',
    description: 'Create new item',
    category: 'CRUD',
  },
  {
    type: 'update',
    label: 'Update Item',
    icon: '✏️',
    color: 'bg-blue-100 border-blue-500 text-blue-700',
    description: 'Update existing item',
    category: 'CRUD',
  },
  {
    type: 'delete',
    label: 'Delete Item',
    icon: '🗑️',
    color: 'bg-rose-100 border-rose-400 text-rose-700',
    description: 'Delete item',
    category: 'CRUD',
  },
  
  // Integration
  {
    type: 'api',
    label: 'API Call',
    icon: '🔌',
    color: 'bg-amber-100 border-amber-400 text-amber-700',
    description: 'Call REST API',
    category: 'Integration',
  },
  {
    type: 'webhook',
    label: 'Webhook',
    icon: '🪝',
    color: 'bg-lime-100 border-lime-400 text-lime-700',
    description: 'Trigger webhook',
    category: 'Integration',
  },
  {
    type: 'database',
    label: 'Database',
    icon: '🗄️',
    color: 'bg-cyan-100 border-cyan-500 text-cyan-700',
    description: 'Execute SQL query',
    category: 'Integration',
  },
  
  // Document Operations
  {
    type: 'document',
    label: 'Document',
    icon: '📄',
    color: 'bg-orange-100 border-orange-500 text-orange-700',
    description: 'Document operations',
    category: 'Documents',
  },
  {
    type: 'pdf',
    label: 'PDF',
    icon: '📕',
    color: 'bg-red-100 border-red-500 text-red-700',
    description: 'PDF operations',
    category: 'Documents',
  },
  
  // User & Security
  {
    type: 'permission',
    label: 'Permission',
    icon: '🔐',
    color: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    description: 'Set permissions',
    category: 'Users',
  },
  
  // Advanced
  {
    type: 'script',
    label: 'Script',
    icon: '</>',
    color: 'bg-gray-100 border-gray-400 text-gray-700',
    description: 'Execute custom script',
    category: 'Advanced',
  },
  {
    type: 'log',
    label: 'Log',
    icon: '📝',
    color: 'bg-stone-100 border-stone-400 text-stone-700',
    description: 'Log to history',
    category: 'Advanced',
  },
];

const getNodeAttributes = (nodeType) => {
  const attributesByType = {
    approval: [
      { name: 'Assigned To', description: 'Email ou ID de l\'utilisateur qui approuvera' },
      { name: 'Form ID', description: 'Formulaire optionnel à afficher' },
      { name: 'Priority', description: 'Priorité de la tâche (low, medium, high, urgent)' },
      { name: 'Due Days', description: 'Nombre de jours avant échéance' }
    ],
    form: [
      { name: 'Assigned To', description: 'Email ou ID de l\'utilisateur' },
      { name: 'Form ID', description: 'ID du formulaire à afficher' },
      { name: 'Title', description: 'Titre de la tâche' },
      { name: 'Priority', description: 'Priorité de la tâche (low, medium, high, urgent)' },
      { name: 'Due Days', description: 'Nombre de jours avant échéance' }
    ],
    condition: [
      { name: 'Expression', description: 'Condition JavaScript (ex: data.amount > 1000)' },
      { name: 'True Path Label', description: 'Libellé pour la branche vraie' },
      { name: 'False Path Label', description: 'Libellé pour la branche fausse' }
    ],
    timer: [
      { name: 'Duration', description: 'Durée d\'attente (ex: 5 minutes, 2 heures, 1 jour)' },
      { name: 'Type', description: 'Délai ou Planification' }
    ],
    email: [
      { name: 'To', description: 'Adresses email des destinataires' },
      { name: 'Subject', description: 'Objet de l\'email' },
      { name: 'Message', description: 'Contenu du message' }
    ],
    notification: [
      { name: 'Recipients', description: 'IDs des utilisateurs à notifier' },
      { name: 'Message', description: 'Texte de la notification' }
    ],
    sms: [
      { name: 'Recipients', description: 'Numéros de téléphone' },
      { name: 'Message', description: 'Texte du SMS' }
    ],
    loop: [
      { name: 'Loop Type', description: 'Type de boucle: forEach, while, until ou count' },
      { name: 'Collection/Condition', description: 'Source de données ou condition' }
    ],
    switch: [
      { name: 'Switch Variable', description: 'Variable à évaluer' },
      { name: 'Cases', description: 'Valeurs des cas séparées par des virgules' }
    ],
    variable: [
      { name: 'Variable Name', description: 'Nom de la variable' },
      { name: 'Value', description: 'Valeur ou expression' }
    ],
    query: [
      { name: 'Data Source', description: 'Liste/Table, Base de données ou API' },
      { name: 'Query', description: 'Requête SQL ou expression de filtre' }
    ],
    webhook: [
      { name: 'URL', description: 'URL du endpoint webhook' },
      { name: 'Method', description: 'Méthode HTTP (GET, POST, etc.)' },
      { name: 'Headers', description: 'En-têtes de requête (JSON)' },
      { name: 'Body', description: 'Corps de la requête (JSON)' }
    ],
    script: [
      { name: 'Language', description: 'Langage: JavaScript, Python ou Bash' },
      { name: 'Code', description: 'Code du script à exécuter' }
    ],
    log: [
      { name: 'Level', description: 'Niveau de log (debug, info, warning, error)' },
      { name: 'Message', description: 'Message du log' }
    ],
    parallel: [
      { name: 'Branches', description: 'Branches d\'exécution parallèle - connectez plusieurs chemins' }
    ]
  };
  
  return attributesByType[nodeType] || [];
};

export default function NodePalette() {
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [previewNode, setPreviewNode] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const categories = ['All', ...new Set(nodeTypes.map(n => n.category))];
  
  const filteredNodes = nodeTypes
    .filter(n => selectedCategory === 'All' || n.category === selectedCategory)
    .filter(n => 
      searchQuery === '' || 
      n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleNodeClick = (node) => {
    setPreviewNode(previewNode?.type === node.type ? null : node);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
      <div className="p-4 border-b space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Node Palette</h3>
        
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une action..."
            className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        {filteredNodes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Aucune action trouvée</p>
            <p className="text-xs mt-1">Essayez un autre terme de recherche</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNodes.map((node) => {
              const isPreviewActive = previewNode?.type === node.type;
              const attributes = getNodeAttributes(node.type);
              
              return (
                <div key={node.type} className="space-y-1">
                  <div
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type)}
                    onClick={() => handleNodeClick(node)}
                    className={`p-2.5 rounded-md border-2 cursor-pointer transition-all hover:shadow-md ${node.color} ${
                      isPreviewActive ? 'ring-2 ring-indigo-500 ring-offset-1' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-base">{node.icon}</span>
                      <span className="font-medium text-sm">{node.label}</span>
                      {attributes.length > 0 && (
                        <span className="ml-auto text-xs text-gray-500">
                          {isPreviewActive ? '▼' : '▶'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-tight">{node.description}</p>
                  </div>
                  
                  {/* Attributes Preview */}
                  {isPreviewActive && attributes.length > 0 && (
                    <div className="ml-4 p-3 bg-gray-50 border-l-2 border-indigo-300 rounded-r space-y-2">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Attributs disponibles:</p>
                      {attributes.map((attr, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="font-medium text-gray-800">• {attr.name}:</span>
                          <span className="text-gray-600 ml-1">{attr.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="p-3 bg-blue-50 border-t border-blue-200">
        <p className="text-xs text-blue-800">
          💡 {filteredNodes.length} actions disponibles • Cliquez pour voir les attributs
        </p>
      </div>
    </div>
  );
}
