# Système d'Exécution de Workflow - Guide Complet

## 🎯 Vue d'ensemble

Le système d'exécution de workflow a été complètement implémenté avec les fonctionnalités suivantes:

### ✅ Fonctionnalités implémentées

1. **Moteur de workflow ReactFlow**
   - Exécution nœud par nœud suivant le graphe ReactFlow
   - Support de tous les types de nœuds (start, variable, form, task, approval, condition, timer, notification, end)
   - Compatibilité avec l'ancien format (steps/transitions)

2. **Création de tâches automatiques**
   - Tâches créées pour les nœuds de type "form" avec assignation
   - Notifications automatiques aux utilisateurs assignés
   - Support d'assignation multiple

3. **Historique complet**
   - Chaque action est enregistrée dans WorkflowHistory
   - Timeline complète avec horodatage et utilisateur
   - Actions trackées: démarrage, exécution de nœud, création/complétion de tâche, etc.

4. **Événements RabbitMQ**
   - `workflow.started` - Workflow démarré
   - `workflow.node.started` - Nœud commence l'exécution
   - `workflow.node.completed` - Nœud terminé
   - `workflow.completed` - Workflow terminé
   - `workflow.failed` - Workflow en erreur
   - `task.created` - Tâche créée
   - `task.completed` - Tâche complétée

5. **Système d'abonnement**
   - Table `workflow_subscriptions` créée
   - API pour s'abonner/se désabonner
   - Notifications automatiques aux abonnés lors de changements d'état

6. **Interfaces utilisateur**
   - Page de suivi d'instance avec ReactFlow coloré
   - Timeline d'historique en temps réel
   - Page de complétion de tâche avec formulaire dynamique
   - Liste des instances par workflow

## 🚀 Comment tester

### 1. Créer un workflow avec ReactFlow

1. Aller sur `/workflows/new`
2. Créer un workflow simple:
   ```
   [Start] → [Variable] → [Form] → [End]
   ```
3. Configurer le nœud Form:
   - Cliquer sur le nœud Form
   - Dans le panneau de configuration, définir:
     * `assignedTo`: ID d'un utilisateur (UUID)
     * `formFields`: Tableau de champs de formulaire
     * Exemple:
       ```json
       {
         "assignedTo": "USER_UUID_HERE",
         "formFields": [
           {
             "name": "nom",
             "label": "Nom",
             "type": "text",
             "required": true
           },
           {
             "name": "email",
             "label": "Email",
             "type": "email",
             "required": true
           },
           {
             "name": "description",
             "label": "Description",
             "type": "textarea",
             "required": false
           }
         ]
       }
       ```
4. Sauvegarder le workflow

### 2. Démarrer une instance

1. Aller sur `/workflows`
2. Cliquer sur "Start" sur votre workflow
3. Le système va:
   - Créer une instance dans la base de données
   - Commencer l'exécution au nœud Start
   - Progresser automatiquement jusqu'au nœud Form
   - Créer une tâche pour l'utilisateur assigné
   - Envoyer une notification à l'utilisateur

### 3. Suivre l'exécution

1. Cliquer sur "Monitor" sur le workflow
2. Voir la liste des instances
3. Cliquer sur "Voir les détails" sur une instance
4. Sur la page de suivi:
   - **Timeline à gauche**: Historique complet des événements
   - **Graphe ReactFlow à droite**: Visualisation avec nœuds colorés
     * Vert: Nœuds exécutés
     * Bleu: Nœud en cours
     * Gris: Nœuds en attente
   - **Bouton S'abonner**: Recevoir des notifications pour cette instance

### 4. Compléter une tâche

1. Aller sur `/tasks`
2. Cliquer sur une tâche en attente
3. Ou directement: `/tasks/:taskId/complete`
4. Remplir le formulaire (champs définis dans le nœud Form)
5. Soumettre
6. Le workflow continue automatiquement au nœud suivant

### 5. Vérifier les notifications

1. Aller sur `/notifications`
2. Voir les notifications pour:
   - Tâches assignées
   - Mises à jour de workflow (si abonné)
   - Approbations requises

## 📊 Base de données

### Nouvelles tables

**workflow_subscriptions**
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
instance_id UUID REFERENCES workflow_instances(id)
created_at TIMESTAMP
updated_at TIMESTAMP
UNIQUE(user_id, instance_id)
```

### Tables existantes utilisées

- `workflows`: Définitions de workflow (avec nodes/edges ReactFlow)
- `workflow_instances`: Instances en cours d'exécution
- `workflow_history`: Historique complet de chaque instance
- `tasks`: Tâches créées par le workflow
- `notifications`: Notifications utilisateur

## 🔧 API Endpoints

### Instances

- `GET /api/instances/:id` - Détails d'une instance avec historique et tâches
- `GET /api/instances/workflow/:workflowId` - Toutes les instances d'un workflow
- `POST /api/instances/:id/subscribe` - S'abonner aux notifications
- `DELETE /api/instances/:id/subscribe` - Se désabonner

### Tâches

- `GET /api/tasks/:id` - Détails d'une tâche
- `POST /api/tasks/:id/complete` - Compléter une tâche
  ```json
  {
    "decision": "approved|rejected", // Pour les approbations
    "taskData": {
      "field1": "value1",
      "field2": "value2"
    }
  }
  ```

## 🎨 Frontend - Pages créées

1. **WorkflowInstance** (`/workflows/:workflowId/instances/:instanceId`)
   - Visualisation ReactFlow avec coloration des nœuds
   - Timeline d'historique
   - Bouton d'abonnement
   - Barre de progression
   - Badge de statut

2. **TaskComplete** (`/tasks/:taskId/complete`)
   - Formulaire dynamique basé sur formFields
   - Validation des champs
   - Support de tous les types de champs (text, email, number, textarea, select, checkbox, radio)
   - Boutons d'approbation pour les tâches de type "approval"

3. **InstanceMonitor** (mis à jour) (`/workflows/:id/instances`)
   - Liste de toutes les instances
   - Filtres par statut et recherche
   - Lien vers la page détaillée de chaque instance

## 🔄 Workflow Engine

### Types de nœuds supportés

1. **start** - Point de départ
   - Enregistre le démarrage
   - Passe au nœud suivant

2. **variable** - Stocke des données
   - Enregistre les données dans `instanceData`
   - Passe au nœud suivant

3. **form** - Crée une tâche de formulaire
   - Crée une tâche pour chaque utilisateur assigné
   - Envoie une notification
   - **ATTEND** la complétion de la tâche
   - Continue après complétion

4. **task** - Crée une tâche simple
   - Similaire à form mais sans formulaire spécifique

5. **approval** - Crée une tâche d'approbation
   - Support séquentiel ou parallèle
   - **ATTEND** les approbations

6. **condition** - Branchement conditionnel
   - Évalue une condition sur instanceData
   - Suit l'edge correspondant au résultat

7. **timer** - Délai
   - Attend un délai en millisecondes
   - Continue après le délai

8. **notification/email/sms** - Envoie des notifications
   - Crée des notifications pour les destinataires
   - Continue immédiatement

9. **end** - Terminaison
   - Marque l'instance comme "completed"
   - Notifie les abonnés

## 📝 Exemple de workflow complet

```json
{
  "nodes": [
    {
      "id": "start-1",
      "type": "start",
      "position": {"x": 100, "y": 100},
      "data": {"label": "Début"}
    },
    {
      "id": "var-1",
      "type": "variable",
      "position": {"x": 100, "y": 200},
      "data": {
        "label": "Variables initiales",
        "config": {
          "requestType": "nouveau_projet",
          "priority": "high"
        }
      }
    },
    {
      "id": "form-1",
      "type": "form",
      "position": {"x": 100, "y": 300},
      "data": {
        "label": "Saisie des informations",
        "config": {
          "assignedTo": "USER_UUID",
          "priority": "high",
          "instructions": "Veuillez remplir les informations du projet",
          "formFields": [
            {
              "name": "projectName",
              "label": "Nom du projet",
              "type": "text",
              "required": true
            },
            {
              "name": "budget",
              "label": "Budget",
              "type": "number",
              "required": true,
              "min": 0
            },
            {
              "name": "description",
              "label": "Description",
              "type": "textarea",
              "rows": 5
            }
          ]
        }
      }
    },
    {
      "id": "approval-1",
      "type": "approval",
      "position": {"x": 100, "y": 400},
      "data": {
        "label": "Approbation manager",
        "config": {
          "approvers": ["MANAGER_UUID"],
          "approvalType": "sequential",
          "priority": "high"
        }
      }
    },
    {
      "id": "end-1",
      "type": "end",
      "position": {"x": 100, "y": 500},
      "data": {"label": "Fin"}
    }
  ],
  "edges": [
    {"id": "e1", "source": "start-1", "target": "var-1"},
    {"id": "e2", "source": "var-1", "target": "form-1"},
    {"id": "e3", "source": "form-1", "target": "approval-1"},
    {"id": "e4", "source": "approval-1", "target": "end-1"}
  ]
}
```

## 🐛 Débogage

### Vérifier les logs backend

```bash
docker logs -f workflow-backend-dev
```

### Vérifier l'état d'une instance

```sql
SELECT * FROM workflow_instances WHERE id = 'INSTANCE_UUID';
SELECT * FROM workflow_history WHERE instance_id = 'INSTANCE_UUID' ORDER BY created_at;
SELECT * FROM tasks WHERE instance_id = 'INSTANCE_UUID';
```

### Vérifier RabbitMQ

Les événements sont publiés dans la queue `WORKFLOW_EVENTS`

```bash
docker exec workflow-rabbitmq-dev rabbitmqctl list_queues
```

## 🎉 Résumé des changements

### Backend

1. **Nouveau moteur de workflow** (`workflowEngine.js`)
   - 830 lignes de code
   - Support ReactFlow complet
   - Compatibilité backward avec l'ancien format

2. **Nouveau modèle** (`workflowSubscription.model.js`)
   - Gestion des abonnements

3. **Nouvelles routes** (`instance.routes.js`)
   - 4 endpoints pour les instances

4. **Migration** (`005-add-subscriptions.sql`)
   - Table workflow_subscriptions

### Frontend

1. **Nouveau hook** (`useInstances.js`)
   - useInstance
   - useInstancesByWorkflow
   - useSubscribeToInstance
   - useUnsubscribeFromInstance

2. **Nouveau service** (`instanceApi.js`)
   - 4 méthodes API

3. **Nouvelle page** (`WorkflowInstance.jsx`)
   - 310 lignes
   - ReactFlow avec coloration
   - Timeline historique
   - Abonnement

4. **Nouvelle page** (`TaskComplete.jsx`)
   - 350 lignes
   - Formulaire dynamique complet
   - Validation
   - Support de tous les types de champs

5. **Page mise à jour** (`InstanceMonitor.jsx`)
   - Utilise le nouveau hook
   - Lien vers page détaillée

## ✅ Checklist de test

- [ ] Créer un workflow avec nœud Form
- [ ] Configurer assignedTo avec votre UUID utilisateur
- [ ] Ajouter des formFields dans la config
- [ ] Sauvegarder le workflow
- [ ] Démarrer une instance
- [ ] Vérifier qu'une tâche apparaît dans /tasks
- [ ] Vérifier qu'une notification est reçue
- [ ] Ouvrir la page de suivi d'instance
- [ ] Vérifier la timeline et les nœuds colorés
- [ ] S'abonner à l'instance
- [ ] Compléter la tâche sur /tasks/:id/complete
- [ ] Vérifier que le workflow continue
- [ ] Vérifier que l'historique est mis à jour
- [ ] Vérifier la notification de complétion
- [ ] Vérifier que l'instance se termine

## 📚 Documentation technique

### Flux d'exécution

1. `startWorkflow()` - Crée l'instance, trouve le nœud start
2. `executeNextStep()` - Dispatcher vers executeNextNode ou executeNextStepLegacy
3. `executeNextNode()` - Identifie le type de nœud et appelle le processeur approprié
4. `processXXXNode()` - Traite le nœud spécifique
5. `moveToNextNode()` - Trouve le prochain nœud via les edges
6. Boucle jusqu'à atteindre un nœud "end" ou un nœud qui attend (form, approval)

### Complétion de tâche

1. Utilisateur remplit le formulaire
2. `completeTask()` dans workflowEngine
3. Met à jour la tâche, l'historique, instanceData
4. Publie événement RabbitMQ
5. Notifie les abonnés
6. Continue vers le nœud suivant via `moveToNextNode()`

### Notifications aux abonnés

1. `notifySubscribers()` appelé à chaque changement important
2. Récupère tous les abonnements pour cette instance
3. Crée une notification pour chaque abonné
4. Publie événement RabbitMQ

---

**Système complet et opérationnel** ✅
