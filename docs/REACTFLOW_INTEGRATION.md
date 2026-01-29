# ReactFlow Integration Guide

## Overview
Le workflow designer utilise **ReactFlow** (v11.10.1) pour créer une interface visuelle de conception de workflows drag-and-drop de type Nintex/Power Automate.

## Fonctionnalités Implémentées

### 1. **Composants de Base**
- **Designer.jsx** : Canvas principal ReactFlow avec drag & drop
- **NodePalette.jsx** : Palette de nodes disponibles (Start, Task, Approval, Condition, Timer, End)
- **NodeConfig.jsx** : Panneau de configuration des propriétés de nodes

### 2. **Nodes Personnalisés**
Chaque type de node possède :
- **Handles** : Points de connexion (top = target, bottom = source)
- **Styles** : Couleurs distinctives par type
- **Icons** : Indicateurs visuels (▶, 📋, ✓, ◆, ⏱, ■)
- **Hover effects** : Shadow et background au survol

Types de nodes :
```javascript
- start: Point de départ du workflow (vert)
- task: Tâche assignée (bleu)
- approval: Étape d'approbation (jaune)
- condition: Branchement conditionnel (violet)
- timer: Délai/attente (orange)
- end: Fin du workflow (rouge)
```

### 3. **Edges (Connexions)**
- **Type** : `smoothstep` pour des courbes fluides
- **Animated** : Animation des connexions
- **Style** : Couleur indigo (#6366f1), largeur 2px
- **Markers** : Flèches fermées aux extrémités

### 4. **Contrôles et Navigation**
- **Zoom In/Out** : Boutons + / - dans le Panel supérieur droit
- **Fit View** : Ajustement automatique pour voir tous les nodes
- **MiniMap** : Carte de navigation en bas à droite
- **Background Grid** : Grille 15x15px avec snap

### 5. **Interactions Utilisateur**

#### Drag & Drop
```javascript
// Depuis NodePalette vers Canvas
onDragStart={(e) => e.dataTransfer.setData('application/reactflow', nodeType)}
onDrop={(e) => {
  const type = e.dataTransfer.getData('application/reactflow');
  // Créer le node à la position du drop
}}
```

#### Sélection et Édition
- **Click** : Sélectionner un node → affiche NodeConfig
- **Shift + Click** : Sélection multiple
- **Delete** : Supprimer nodes/edges sélectionnés
- **Drag** : Déplacer les nodes

#### Connexions
- **Drag** depuis un Handle source vers un Handle target
- **Auto-validation** : ReactFlow gère la validité des connexions

### 6. **Panneau d'Information**
Panel bottom-left affichant :
- Nombre de nodes
- Nombre de connexions
- Raccourcis clavier

### 7. **Persistance**
```javascript
const workflowData = {
  name: workflowName,
  description: workflowDescription,
  definition: {
    nodes: nodes,  // Positions, types, data
    edges: edges   // Connexions entre nodes
  },
  status: 'draft'
};
```

## Architecture

```
frontend/src/components/WorkflowDesigner/
├── Designer.jsx          # Canvas ReactFlow principal
├── NodePalette.jsx       # Drag source pour les nodes
└── NodeConfig.jsx        # Formulaire de configuration
```

### Designer.jsx Structure
```jsx
<ReactFlowProvider>
  <DesignerContent>
    <Header>
      <WorkflowName />
      <WorkflowDescription />
      <SaveButton />
    </Header>
    
    <Layout>
      <NodePalette />
      
      <ReactFlow>
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-right">
          <ZoomControls />
        </Panel>
        <Panel position="bottom-left">
          <InfoPanel />
        </Panel>
      </ReactFlow>
      
      {selectedNode && <NodeConfig />}
    </Layout>
  </DesignerContent>
</ReactFlowProvider>
```

## Configuration ReactFlow

### Hooks Utilisés
```javascript
const { fitView, zoomIn, zoomOut } = useReactFlow();
const [nodes, setNodes, onNodesChange] = useNodesState([]);
const [edges, setEdges, onEdgesChange] = useEdgesState([]);
```

### Props ReactFlow
```javascript
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
/>
```

## Améliorations Futures

### 1. **Undo/Redo**
Implémenter un historique des états avec `useNodesState` et `useEdgesState`

### 2. **Validation**
- Vérifier qu'il existe au moins un node Start et End
- Valider que tous les nodes sont connectés
- Détecter les boucles infinies

### 3. **Auto-Layout**
Utiliser des algorithmes comme Dagre pour positionner automatiquement les nodes

### 4. **Templates**
Créer des workflows prédéfinis (Approval simple, Multi-stage approval, etc.)

### 5. **Conditional Edges**
Ajouter des labels sur les edges (Approved/Rejected, Yes/No)

### 6. **Grouping**
Permettre de regrouper des nodes dans des sous-processus

### 7. **Export/Import**
- Export SVG pour documentation
- Export JSON pour partage
- Import de templates

## Ressources

- **Documentation ReactFlow** : https://reactflow.dev/
- **Examples** : https://reactflow.dev/examples
- **API Reference** : https://reactflow.dev/api-reference

## Usage

### Créer un nouveau workflow
```bash
1. Aller sur /workflows
2. Cliquer "Create Workflow"
3. Drag & drop des nodes depuis la palette
4. Connecter les nodes en faisant glisser depuis un Handle
5. Configurer chaque node en cliquant dessus
6. Sauvegarder avec le bouton "Save"
```

### Éditer un workflow existant
```bash
1. Liste des workflows → Click sur l'icône Edit
2. Modifier les nodes/edges
3. Sauvegarder les changements
```

## Troubleshooting

### Les connexions ne s'affichent pas
- Vérifier que les Handles sont bien définis avec Position.Top et Position.Bottom
- S'assurer que les IDs des nodes sont uniques

### Le drag & drop ne fonctionne pas
- Vérifier que `onDragOver` a `event.preventDefault()`
- Confirmer que `dataTransfer.setData` et `getData` utilisent le même type

### Les nodes ne se sauvegardent pas
- Vérifier que la structure `definition: { nodes, edges }` est correcte
- Confirmer que `workflowApi.createWorkflow/updateWorkflow` est appelé

### Performance avec beaucoup de nodes
- Utiliser `memo` pour les composants de nodes
- Implémenter la virtualisation avec `nodeExtent`
- Désactiver les animations sur les gros workflows
