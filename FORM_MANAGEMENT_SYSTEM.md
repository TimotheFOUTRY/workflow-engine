# Système de Gestion de Formulaires dans les Workflows

## Vue d'ensemble

Le système permet aux utilisateurs de remplir des formulaires dans le cadre de tâches de workflow avec les fonctionnalités suivantes:
- Sauvegarde partielle des formulaires
- Verrouillage concurrent pour éviter les conflits d'édition
- Assignation de variables spécifiques à des utilisateurs
- Notifications automatiques lors des sauvegardes et soumissions
- Support pour plusieurs utilisateurs assignés à une même tâche

## Architecture

### Base de données

**Table `tasks` - Nouveaux champs:**
```sql
- locked_by: UUID (référence users.id) - Utilisateur qui a verrouillé le formulaire
- locked_at: TIMESTAMP - Moment du verrouillage
- form_data: JSONB - Données du formulaire (incluant sauvegardes partielles)
- form_progress: INTEGER (0-100) - Pourcentage de complétion du formulaire
- assigned_users: UUID[] - Tableau des utilisateurs assignés à la tâche
```

### Services

#### FormLockService (`services/formLockService.js`)

Service principal pour la gestion des formulaires avec les méthodes suivantes:

**Verrouillage:**
- `lockForm(taskId, userId)` - Verrouille un formulaire pour édition exclusive
- `unlockForm(taskId, userId, force)` - Déverrouille un formulaire
- `canEditForm(taskId, userId)` - Vérifie si un utilisateur peut éditer
- `cleanExpiredLocks()` - Nettoie les verrous expirés (timeout: 15 minutes)

**Gestion des champs:**
- `canEditField(formSchema, fieldName, userId)` - Vérifie les permissions par champ
- `getEditableFields(formSchema, userId)` - Liste des champs éditables pour un utilisateur

**Sauvegarde et soumission:**
- `saveFormDraft(taskId, userId, formData, progress)` - Sauvegarde partielle + notifications
- `submitForm(taskId, userId, formData)` - Soumission finale + complétion de tâche
- `sendDraftNotifications(task, userId)` - Envoie les notifications de sauvegarde
- `sendCompletionNotifications(task, userId)` - Envoie les notifications de complétion

### Contrôleur

#### TaskController (`controllers/task.controller.js`)

**Nouveaux endpoints:**

```javascript
POST /api/tasks/:id/lock          // Verrouiller un formulaire
POST /api/tasks/:id/unlock        // Déverrouiller un formulaire
POST /api/tasks/:id/save-draft    // Sauvegarder un brouillon
POST /api/tasks/:id/submit-form   // Soumettre le formulaire complet
GET  /api/tasks/:id/form-access   // Vérifier les accès et champs éditables
GET  /api/tasks/:id/lock-status   // Obtenir le statut du verrouillage
```

## Flux de travail

### 1. Ouverture d'un formulaire

```
Client                          Backend                         Database
  |                                |                                |
  |--GET /api/tasks/:id/form-access->                              |
  |                                |--Query task + form schema---->|
  |                                |<--Return task data-------------|
  |<--Return: canEdit, editableFields, formData, lockedBy----------|
  |                                |                                |
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "canEdit": true,
    "reason": null,
    "editableFields": ["field1", "field2", "field3"],
    "formData": { "field1": "value1" },
    "formProgress": 30,
    "lockedBy": null,
    "lockedAt": null
  }
}
```

### 2. Verrouillage du formulaire

```
Client                          Backend                         Database
  |                                |                                |
  |--POST /api/tasks/:id/lock----->|                                |
  |                                |--Check existing lock---------->|
  |                                |<--Return lock status-----------|
  |                                |--Update locked_by, locked_at-->|
  |<--Success or "locked by other user"----------------------------|
```

### 3. Sauvegarde partielle

```
Client                          Backend                         Database/Queue
  |                                |                                |
  |--POST /api/tasks/:id/save-draft->                              |
  |   { formData, progress }       |                                |
  |                                |--Validate field permissions--->|
  |                                |--Merge with existing data----->|
  |                                |--Update task------------------->|
  |                                |--Unlock form------------------->|
  |                                |--Send notifications----------->|
  |<--Success + updated task-------|                                |
```

**Notifications envoyées:**
- Au propriétaire du workflow (createdBy)
- À tous les utilisateurs assignés (assignedUsers + assignedTo)
- Type: `form_draft_saved`
- Message: "[User] a sauvegardé un formulaire partiellement complété (X% complété)"

### 4. Soumission finale

```
Client                          Backend                         Database/Queue
  |                                |                                |
  |--POST /api/tasks/:id/submit-form->                             |
  |   { formData }                 |                                |
  |                                |--Validate completeness-------->|
  |                                |--Update task------------------->|
  |                                |--Set status = 'completed'----->|
  |                                |--Set formProgress = 100-------->|
  |                                |--Unlock form------------------->|
  |                                |--Send notifications----------->|
  |<--Success + completed task-----|                                |
```

**Notifications envoyées:**
- À tous les utilisateurs assignés (sauf celui qui soumet)
- Type: `task_completed`
- Message: "[User] a complété le formulaire"

## Assignation de variables à des utilisateurs

### Structure du schéma de formulaire

Pour restreindre l'édition de certains champs à des utilisateurs spécifiques:

```json
{
  "type": "object",
  "properties": {
    "nomComplet": {
      "type": "string",
      "title": "Nom complet",
      "assignedUsers": []  // Vide = tous peuvent éditer
    },
    "montantBudget": {
      "type": "number",
      "title": "Montant du budget",
      "assignedUsers": ["user-uuid-1", "user-uuid-2"]  // Seulement ces utilisateurs
    },
    "approbationManager": {
      "type": "boolean",
      "title": "Approbation du manager",
      "assignedUsers": ["manager-uuid"]  // Seulement le manager
    }
  }
}
```

### Comportement

1. **Sans assignation (`assignedUsers` vide ou absent)**: Tous les utilisateurs assignés à la tâche peuvent éditer le champ

2. **Avec assignation**: Seuls les utilisateurs listés dans `assignedUsers` peuvent éditer le champ
   - Le frontend doit récupérer `editableFields` via `/api/tasks/:id/form-access`
   - Les champs non éditables doivent être affichés en lecture seule
   - Le backend filtre automatiquement les données lors de la sauvegarde

3. **Validation côté serveur**: Le service `FormLockService` valide les permissions et ignore les champs non autorisés

## Gestion du verrouillage

### Timeout automatique

- **Durée**: 15 minutes (configurable via `LOCK_TIMEOUT`)
- **Comportement**: Si un utilisateur quitte sans déverrouiller, le verrou expire automatiquement
- **Nettoyage**: Appeler périodiquement `formLockService.cleanExpiredLocks()`

### Prévention des conflits

1. **Tentative de verrouillage**: Le système vérifie si le formulaire est déjà verrouillé
2. **Si verrouillé par un autre**: Retourne HTTP 409 avec les détails du verrou
3. **Si verrouillé mais expiré**: Libère automatiquement et accorde le nouveau verrou
4. **Lors de la sauvegarde**: Le formulaire est automatiquement déverrouillé

### Cas d'usage typique

```javascript
// 1. Utilisateur A ouvre le formulaire
GET /api/tasks/123/form-access
// canEdit: true, lockedBy: null

// 2. Utilisateur A verrouille
POST /api/tasks/123/lock
// Success

// 3. Utilisateur B tente d'ouvrir
GET /api/tasks/123/form-access
// canEdit: false, reason: "Form is locked by another user"
// lockedBy: { id: "...", username: "userA" }

// 4. Utilisateur A sauvegarde
POST /api/tasks/123/save-draft
// Success, verrou libéré automatiquement

// 5. Utilisateur B peut maintenant éditer
GET /api/tasks/123/form-access
// canEdit: true, lockedBy: null
```

## Notifications

### Types de notifications

1. **`form_draft_saved`** - Formulaire sauvegardé partiellement
   - Destinataires: Propriétaire du workflow + utilisateurs assignés
   - Priorité: Medium
   - Inclut: Pourcentage de complétion

2. **`task_completed`** - Formulaire complété
   - Destinataires: Utilisateurs assignés (sauf celui qui soumet)
   - Priorité: High

### Format des notifications

```json
{
  "userId": "recipient-uuid",
  "type": "form_draft_saved",
  "title": "Formulaire sauvegardé",
  "message": "John Doe a sauvegardé un formulaire partiellement complété (45% complété)",
  "relatedTaskId": "task-uuid",
  "relatedWorkflowInstanceId": "instance-uuid",
  "priority": "medium",
  "createdAt": "2026-02-03T10:30:00Z"
}
```

## Permissions et sécurité

### Contrôles d'accès

1. **Assignation à la tâche**: L'utilisateur doit être dans `assignedUsers` ou être `assignedTo`
2. **Statut de la tâche**: Ne peut éditer que si statut = 'pending' ou 'in_progress'
3. **Verrouillage**: Ne peut éditer que s'il détient le verrou ou si aucun verrou actif
4. **Champs spécifiques**: Ne peut éditer que les champs pour lesquels il est autorisé

### Validation des données

- **Côté client**: Validation basique + affichage des champs en lecture seule
- **Côté serveur**: 
  - Filtrage strict des champs éditables
  - Fusion avec les données existantes (ne pas écraser les champs protégés)
  - Validation du schéma de formulaire (TODO: implémenter validation complète)

## Intégration Frontend

### Exemple React

```javascript
// 1. Charger les informations d'accès
const { data: accessInfo } = await api.get(`/api/tasks/${taskId}/form-access`);

if (!accessInfo.canEdit) {
  // Afficher message: formulaire verrouillé ou pas de permission
  return <LockedFormMessage lockedBy={accessInfo.lockedBy} />;
}

// 2. Verrouiller le formulaire
await api.post(`/api/tasks/${taskId}/lock`);

// 3. Afficher le formulaire avec champs éditables
const formSchema = {
  properties: Object.fromEntries(
    accessInfo.editableFields.map(field => [
      field,
      originalSchema.properties[field]
    ])
  )
};

// 4. Sauvegarder périodiquement (auto-save)
const handleAutoSave = async (formData) => {
  const progress = calculateProgress(formData);
  await api.post(`/api/tasks/${taskId}/save-draft`, {
    formData,
    progress
  });
};

// 5. Soumettre le formulaire complet
const handleSubmit = async (formData) => {
  await api.post(`/api/tasks/${taskId}/submit-form`, { formData });
  // Rediriger vers la liste des tâches
};

// 6. Déverrouiller en cas d'annulation
const handleCancel = async () => {
  await api.post(`/api/tasks/${taskId}/unlock`);
};
```

## Bonnes pratiques

1. **Auto-save**: Implémenter une sauvegarde automatique toutes les 30-60 secondes
2. **Déverrouillage**: Toujours déverrouiller lors de la fermeture du formulaire
3. **Heartbeat**: Envoyer un ping périodique pour maintenir le verrou actif (si implémenté)
4. **Affichage temps réel**: Afficher qui a verrouillé le formulaire et depuis quand
5. **Messages clairs**: Indiquer clairement quels champs sont éditables et pourquoi
6. **Gestion d'erreurs**: Gérer les cas de verrouillage expiré pendant l'édition

## Migration

Pour appliquer cette fonctionnalité sur une installation existante:

```bash
# Exécuter la migration SQL
docker compose exec -T postgres psql -U workflow_user -d workflow_db < backend/src/migrations/007-add-task-form-features.sql

# Redémarrer le backend pour charger les nouveaux modèles
docker compose restart backend
```

## Tests recommandés

1. **Verrouillage concurrent**: Deux utilisateurs essaient de verrouiller simultanément
2. **Expiration de verrou**: Attendre 15+ minutes et vérifier le déverrouillage automatique
3. **Permissions de champs**: Vérifier que les utilisateurs ne peuvent éditer que leurs champs
4. **Notifications**: Vérifier l'envoi correct des notifications
5. **Fusion de données**: Vérifier que les données partielles sont correctement fusionnées
6. **Soumission finale**: Vérifier que la tâche est complétée et le workflow continue

## Limitations connues

1. **Validation de schéma**: La validation complète du formulaire n'est pas encore implémentée dans `submitForm`
2. **Heartbeat**: Pas de système de heartbeat pour maintenir les verrous actifs
3. **Historique**: Pas de tracking des versions des sauvegardes partielles
4. **Rollback**: Impossible de revenir à une version antérieure du brouillon

## Améliorations futures

1. Implémenter la validation complète basée sur le schéma JSON
2. Ajouter un système de heartbeat pour les verrous actifs
3. Historique des versions de formulaires
4. Support pour les formulaires multi-pages
5. Indicateur visuel temps réel des utilisateurs en ligne sur un formulaire
6. Export/import de brouillons de formulaires
