# Affichage des Informations Utilisateur dans les Tâches

## Vue d'ensemble

Les endpoints API ont été mis à jour pour retourner les informations complètes des utilisateurs (incluant l'email) lors de la récupération des tâches. Cela permet d'afficher les détails des personnes assignées directement, y compris lors d'un double-clic.

## Modifications Backend

### 1. Service Task - Informations utilisateur enrichies

**Fichier**: `backend/src/services/taskService.js`

Les méthodes suivantes retournent maintenant les informations complètes des utilisateurs:

#### `getTask(taskId)`
```javascript
{
  "id": "task-uuid",
  "assignedTo": "user-uuid",
  "assignee": {
    "id": "user-uuid",
    "username": "john.doe",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "lockedBy": "user2-uuid",
  "lockedByUser": {
    "id": "user2-uuid",
    "username": "jane.smith",
    "email": "jane.smith@example.com",
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "assignedUsers": ["user3-uuid", "user4-uuid"],
  // ... autres champs de la tâche
}
```

#### `getUserTasks(userId, filters)`
Retourne maintenant:
- `assignee` avec email
- `lockedByUser` avec email
- Les UUIDs dans `assignedUsers` (nécessitent un appel API séparé pour obtenir les détails)

### 2. Nouveaux Endpoints API

#### GET `/api/users/basic/:id`
Récupérer les informations de base d'un utilisateur (accessible à tous les utilisateurs authentifiés)

**Requête:**
```http
GET /api/users/basic/user-uuid
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "username": "john.doe",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "service": "IT",
    "role": "user"
  }
}
```

#### GET `/api/users/by-ids?ids=uuid1,uuid2,uuid3`
Récupérer plusieurs utilisateurs à la fois (bulk fetch)

**Requête:**
```http
GET /api/users/by-ids?ids=uuid1,uuid2,uuid3
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid1",
      "username": "user1",
      "email": "user1@example.com",
      "firstName": "First",
      "lastName": "User",
      "service": "Finance",
      "role": "user",
      "status": "approved"
    },
    {
      "id": "uuid2",
      "username": "user2",
      "email": "user2@example.com",
      "firstName": "Second",
      "lastName": "User",
      "service": "HR",
      "role": "manager",
      "status": "approved"
    }
  ]
}
```

## Intégration Frontend

### Exemple 1: Afficher l'email dans la liste des tâches

```jsx
import { useQuery } from '@tanstack/react-query';

const TaskList = () => {
  const { data: tasks } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => fetch('/api/tasks/my-tasks').then(r => r.json())
  });

  return (
    <div>
      {tasks?.data?.map(task => (
        <div key={task.id} className="task-card">
          <h3>{task.taskType}</h3>
          
          {/* Afficher l'assigné avec email */}
          {task.assignee && (
            <div className="assignee">
              <strong>Assigné à:</strong> 
              {task.assignee.firstName} {task.assignee.lastName}
              <span className="email">{task.assignee.email}</span>
            </div>
          )}

          {/* Afficher qui a verrouillé avec email */}
          {task.lockedByUser && (
            <div className="locked-by">
              🔒 Verrouillé par: {task.lockedByUser.firstName} {task.lockedByUser.lastName}
              <span className="email">{task.lockedByUser.email}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
```

### Exemple 2: Double-clic pour voir les détails complets

```jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const UserInfoModal = ({ userId, onClose }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/basic/${userId}`).then(r => r.json()),
    enabled: !!userId
  });

  if (isLoading) return <div>Chargement...</div>;

  const user = data?.data;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Informations utilisateur</h2>
        <div className="user-details">
          <p><strong>Nom:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> 
            <a href={`mailto:${user.email}`}>{user.email}</a>
          </p>
          <p><strong>Service:</strong> {user.service}</p>
          <p><strong>Rôle:</strong> {user.role}</p>
        </div>
        <button onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
};

const TaskCard = ({ task }) => {
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleUserDoubleClick = (userId) => {
    setSelectedUserId(userId);
  };

  return (
    <>
      <div className="task-card">
        {/* Double-clic sur l'assigné */}
        {task.assignee && (
          <div 
            className="user-chip"
            onDoubleClick={() => handleUserDoubleClick(task.assignee.id)}
            style={{ cursor: 'pointer' }}
          >
            👤 {task.assignee.firstName} {task.assignee.lastName}
          </div>
        )}
      </div>

      {selectedUserId && (
        <UserInfoModal 
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </>
  );
};
```

### Exemple 3: Charger les détails des assignedUsers

```jsx
import { useQuery } from '@tanstack/react-query';

const AssignedUsersList = ({ userIds }) => {
  // Bulk fetch des utilisateurs assignés
  const { data, isLoading } = useQuery({
    queryKey: ['users', userIds],
    queryFn: () => {
      const idsParam = userIds.join(',');
      return fetch(`/api/users/by-ids?ids=${idsParam}`).then(r => r.json());
    },
    enabled: userIds.length > 0
  });

  if (isLoading) return <div>Chargement des utilisateurs...</div>;

  const users = data?.data || [];

  return (
    <div className="assigned-users">
      <h4>Utilisateurs assignés:</h4>
      {users.map(user => (
        <div 
          key={user.id} 
          className="user-chip"
          onDoubleClick={() => {
            // Afficher modal avec détails ou copier l'email
            navigator.clipboard.writeText(user.email);
            alert(`Email copié: ${user.email}`);
          }}
        >
          {user.firstName} {user.lastName}
          <span className="email">{user.email}</span>
        </div>
      ))}
    </div>
  );
};

const TaskDetails = ({ taskId }) => {
  const { data: task } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => fetch(`/api/tasks/${taskId}`).then(r => r.json())
  });

  return (
    <div>
      {/* Assigné principal (déjà inclus) */}
      {task?.data?.assignee && (
        <div>
          <strong>Assigné à:</strong> {task.data.assignee.email}
        </div>
      )}

      {/* Autres utilisateurs assignés (besoin de bulk fetch) */}
      {task?.data?.assignedUsers?.length > 0 && (
        <AssignedUsersList userIds={task.data.assignedUsers} />
      )}
    </div>
  );
};
```

### Exemple 4: Composant réutilisable UserChip

```jsx
const UserChip = ({ user, showEmail = true, onDoubleClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleDoubleClick = () => {
    if (onDoubleClick) {
      onDoubleClick(user);
    } else {
      // Comportement par défaut: copier l'email
      navigator.clipboard.writeText(user.email);
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    }
  };

  return (
    <div 
      className="user-chip"
      onDoubleClick={handleDoubleClick}
      style={{ 
        cursor: 'pointer',
        padding: '4px 8px',
        background: '#f0f0f0',
        borderRadius: '4px',
        display: 'inline-block',
        margin: '4px',
        position: 'relative'
      }}
    >
      👤 {user.firstName} {user.lastName}
      {showEmail && (
        <span style={{ marginLeft: '8px', color: '#666', fontSize: '0.9em' }}>
          {user.email}
        </span>
      )}
      {showTooltip && (
        <div className="tooltip">
          ✓ Email copié!
        </div>
      )}
    </div>
  );
};

// Utilisation
<UserChip user={task.assignee} />
```

## Cas d'usage

### 1. Liste de tâches
- Afficher l'assigné avec son email directement
- Double-clic pour copier l'email ou ouvrir une modal

### 2. Détails de tâche
- Afficher tous les utilisateurs assignés avec leurs emails
- Double-clic pour voir plus de détails (service, rôle, etc.)

### 3. Formulaires collaboratifs
- Voir qui est assigné à quelles variables
- Contacter facilement les personnes via leur email

### 4. Verrouillage de formulaires
- Afficher qui a verrouillé le formulaire avec son email
- Contacter cette personne si besoin

## Permissions

### Endpoints publics (tous utilisateurs authentifiés)
- `GET /api/users/basic/:id` - Infos de base d'un utilisateur
- `GET /api/users/by-ids` - Bulk fetch d'utilisateurs

### Endpoints restreints (admin/manager)
- `GET /api/users/:id` - Détails complets incluant le statut, etc.
- `GET /api/users` - Liste tous les utilisateurs
- Autres opérations CRUD

## Sécurité

Les informations sensibles (mot de passe) sont toujours exclues. Les endpoints publics retournent uniquement:
- ID
- Username
- Email
- Prénom/Nom
- Service
- Rôle

Les informations comme le statut d'approbation, les permissions détaillées, etc. nécessitent des droits admin/manager.

## Exemples de Styles CSS

```css
.user-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 16px;
  margin: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-chip:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.user-chip:active {
  transform: translateY(0);
}

.user-chip .email {
  margin-left: 8px;
  color: #666;
  font-size: 0.9em;
}

.locked-by {
  display: flex;
  align-items: center;
  padding: 8px;
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  margin: 8px 0;
}

.locked-by .email {
  margin-left: auto;
  color: #856404;
}
```

## Tests

### Test 1: Récupérer une tâche avec assigné
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/tasks/task-uuid
```

Vérifier que la réponse inclut `assignee.email`

### Test 2: Récupérer les infos d'un utilisateur
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/users/basic/user-uuid
```

### Test 3: Bulk fetch
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/users/by-ids?ids=uuid1,uuid2,uuid3"
```

## Migration

Aucune migration de base de données requise. Les modifications sont uniquement au niveau du code applicatif.

## Compatibilité

- ✅ Compatible avec les endpoints existants
- ✅ Pas de breaking changes
- ✅ Nouvelles routes additives uniquement
- ✅ Rétrocompatible avec le frontend existant

## Résumé

**Ce qui a été ajouté:**
1. ✅ Email inclus dans `getTask()` pour assignee et lockedByUser
2. ✅ Email inclus dans `getUserTasks()` pour assignee et lockedByUser
3. ✅ Nouveau endpoint `GET /api/users/basic/:id` (accessible à tous)
4. ✅ Nouveau endpoint `GET /api/users/by-ids` (bulk fetch, accessible à tous)

**Utilisation:**
- Les tâches retournent maintenant automatiquement les emails
- Double-clic sur un utilisateur → modal avec détails ou copie d'email
- Bulk fetch pour charger les détails de plusieurs assignedUsers
