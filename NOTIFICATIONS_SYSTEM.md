# Système de Notifications

Le système de notifications permet de recevoir des alertes en temps réel basées sur les événements RabbitMQ du workflow engine.

## Architecture

### Backend

#### 1. Modèle de données (`notification.model.js`)
```javascript
{
  id: UUID,
  userId: UUID (nullable - null pour notifications système),
  type: ENUM [
    'workflow_started',
    'workflow_completed',
    'workflow_failed',
    'task_assigned',
    'task_completed',
    'task_overdue',
    'system',
    'info',
    'warning',
    'error'
  ],
  title: STRING,
  message: TEXT,
  data: JSONB (données additionnelles),
  read: BOOLEAN,
  readAt: TIMESTAMP,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

#### 2. Service de notifications (`notificationService.js`)
- **Écoute RabbitMQ** : Consomme les événements des queues `WORKFLOW_EVENTS` et `TASK_QUEUE`
- **Création automatique** : Crée des notifications en base de données pour chaque événement
- **Mapping intelligent** : Convertit les types d'événements RabbitMQ en types de notifications

**Événements workflow écoutés :**
- `workflow.started` → Notification "Workflow démarré"
- `workflow.completed` → Notification "Workflow terminé"
- `workflow.failed` → Notification "Workflow échoué"

**Événements task écoutés :**
- `task.assigned` → Notification "Nouvelle tâche assignée"
- `task.completed` → Notification "Tâche terminée"
- `task.overdue` → Notification "Tâche en retard"

#### 3. API Endpoints (`notification.routes.js`)
```
GET    /api/notifications              - Liste des notifications (avec query ?unreadOnly=true)
GET    /api/notifications/unread-count - Nombre de notifications non lues
PUT    /api/notifications/:id/read     - Marquer comme lu
PUT    /api/notifications/mark-all-read- Tout marquer comme lu
DELETE /api/notifications/:id          - Supprimer une notification
```

### Frontend

#### 1. Hook React Query (`useNotifications.js`)
```javascript
const {
  notifications,      // Liste des notifications
  unreadCount,        // Nombre non lu
  isLoading,          // État de chargement
  markAsRead,         // Marquer comme lu
  markAllAsRead,      // Tout marquer comme lu
  deleteNotification  // Supprimer
} = useNotifications();
```

**Auto-refresh** :
- Liste des notifications : toutes les 30 secondes
- Compteur non lu : toutes les 10 secondes

#### 2. Composants

**NotificationsPage** (`/notifications`)
- Affiche toutes les notifications
- Filtres : Toutes / Non lues / Lues
- Actions : Marquer comme lu, Supprimer
- Navigation automatique vers workflow/task
- Indicateur visuel pour notifications non lues
- Formatage de date relatif (Il y a X min/heures/jours)

**NotificationBell** (dans le header)
- Icône cloche avec badge de compteur
- Badge rouge avec nombre de notifications non lues
- Lien vers la page de notifications
- Affiche "99+" si plus de 99 notifications

#### 3. Design

**Couleurs par type de notification :**
- `workflow_completed`, `task_completed` : Vert (success)
- `workflow_failed`, `task_overdue` : Rouge (error)
- `workflow_started`, `task_assigned` : Bleu (info)
- `warning` : Jaune
- Par défaut : Gris

**Icônes :**
- Success : CheckCircleIcon
- Error : XCircleIcon
- Info : BellIcon
- Warning : ExclamationTriangleIcon
- Default : InformationCircleIcon

## Installation

### 1. Base de données
```bash
# Exécuter la migration
psql -U postgres -d workflow_engine -f backend/src/migrations/005-add-notifications.sql
```

Ou depuis Node.js (déjà inclus dans le démarrage) :
```javascript
await sequelize.sync(); // Crée automatiquement la table
```

### 2. Configuration RabbitMQ
Le service de notifications démarre automatiquement au lancement du serveur :
```javascript
// Dans server.js
await notificationService.startListening();
```

## Utilisation

### Créer une notification système
```javascript
const notificationService = require('./services/notificationService');

await notificationService.createSystemNotification({
  type: 'system',
  title: 'Maintenance planifiée',
  message: 'Le système sera en maintenance ce soir de 22h à 23h',
  data: { maintenanceStart: '2024-01-15T22:00:00Z' }
});
```

### Créer une notification pour un utilisateur
```javascript
await notificationService.createNotification({
  userId: 'uuid-user-id',
  type: 'info',
  title: 'Nouvelle fonctionnalité',
  message: 'Découvrez notre nouveau système de notifications !',
  data: { feature: 'notifications' }
});
```

### Tester avec RabbitMQ
Les notifications sont créées automatiquement quand vous :
1. **Démarrez un workflow** → Notification "Workflow démarré"
2. **Complétez un workflow** → Notification "Workflow terminé"
3. **Un workflow échoue** → Notification "Workflow échoué"
4. **Assignez une tâche** → Notification à l'assigné
5. **Complétez une tâche** → Notification au créateur du workflow

## Navigation

Les notifications sont cliquables et naviguent automatiquement vers :
- **Notifications de workflow** → `/workflows/:workflowInstanceId/instances`
- **Notifications de tâche** → `/tasks`

## Performance

### Optimisations frontend
- **Polling intelligent** : 30s pour la liste, 10s pour le compteur
- **React Query cache** : Évite les requêtes inutiles
- **Invalidation ciblée** : Seules les queries modifiées sont rafraîchies

### Optimisations backend
- **Index SQL** : Sur user_id, read, created_at, type
- **Limite de résultats** : Maximum 100 notifications retournées
- **Consumer async** : RabbitMQ events traités en background

## Roadmap

### Phase 2 (à venir)
- [ ] WebSocket pour notifications temps réel (sans polling)
- [ ] Notifications push navigateur (Web Push API)
- [ ] Préférences utilisateur (types de notifications à recevoir)
- [ ] Snooze/Rappel pour notifications importantes
- [ ] Groupement de notifications similaires
- [ ] Pagination pour historique complet
- [ ] Export des notifications (CSV, PDF)

### Phase 3 (futur)
- [ ] Notifications email (résumé quotidien/hebdomadaire)
- [ ] Notifications Slack/Teams webhook
- [ ] Règles de notification personnalisées
- [ ] Templates de notifications personnalisables
- [ ] Analytics sur les notifications (taux de lecture, temps de réaction)
