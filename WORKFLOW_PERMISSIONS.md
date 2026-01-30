# Système de Permissions des Workflows

Le système de permissions permet de contrôler qui peut voir et démarrer chaque workflow.

## Fonctionnalités

### 1. Page "Démarrer un Workflow" (`/workflows/start`)
- Liste tous les workflows accessibles pour l'utilisateur actuel
- Affiche le statut (Public ou Restreint)
- Permet de lancer un workflow en un clic
- Modal de confirmation avant le démarrage
- Navigation automatique vers le monitoring de l'instance

### 2. Gestion des Permissions (Workflow Designer)
- Bouton "Permissions" dans le designer (visible uniquement pour workflows existants)
- Modal de configuration des permissions
- 3 niveaux d'accès :
  - **Public** : Tous les utilisateurs peuvent voir et démarrer
  - **Utilisateurs spécifiques** : Sélection individuelle des utilisateurs autorisés
  - **Groupes** : Sélection des groupes autorisés (tous les membres du groupe ont accès)

### 3. Filtrage Automatique
- Les workflows sont filtrés selon les permissions de l'utilisateur
- Les administrateurs voient tous les workflows
- Les créateurs voient toujours leurs propres workflows
- Les utilisateurs voient :
  - Workflows publics
  - Workflows où ils sont explicitement autorisés
  - Workflows de leurs groupes

## Architecture Technique

### Base de données
```sql
ALTER TABLE workflows ADD COLUMN:
- allowed_users UUID[]      -- Liste des IDs utilisateurs autorisés
- allowed_groups UUID[]     -- Liste des IDs groupes autorisés
- is_public BOOLEAN         -- Si true, accessible à tous
```

**Indexes pour performance :**
- GIN index sur `allowed_users`
- GIN index sur `allowed_groups`
- Index B-tree sur `is_public`

### Backend

#### Modèle Workflow
```javascript
{
  allowedUsers: Array<UUID>,
  allowedGroups: Array<UUID>,
  isPublic: Boolean
}
```

#### Endpoints API

**GET `/api/workflows/accessible`**
- Retourne les workflows accessibles par l'utilisateur actuel
- Filtrage selon permissions + rôle + groupes
- Utilisé par la page "Démarrer un Workflow"

**PUT `/api/workflows/:id/permissions`**
```json
{
  "allowedUsers": ["uuid1", "uuid2"],
  "allowedGroups": ["uuid3", "uuid4"],
  "isPublic": false
}
```

**GET `/api/workflows/:id/check-access`**
- Vérifie si l'utilisateur a accès au workflow
- Retourne `{ hasAccess: true, reason: 'admin|public|creator|allowed_user|allowed_group' }`

#### Logique de filtrage
```javascript
// Règles de permission (ordre de priorité)
1. Admin → Accès total
2. Public (isPublic=true) → Accès pour tous
3. Créateur (createdBy=userId) → Accès total
4. Utilisateur autorisé (allowedUsers contient userId) → Accès
5. Groupe autorisé (allowedGroups overlap avec groupes de l'utilisateur) → Accès
6. Sinon → Pas d'accès
```

### Frontend

#### Composants

**`StartWorkflowPage.jsx`**
- Grille de cartes de workflows accessibles
- Badge "Public" ou "Restreint"
- Bouton "Démarrer ce workflow"
- Modal de confirmation avec description
- Navigation vers `/workflows/:id/instances` après démarrage

**`WorkflowPermissions.jsx`**
- Toggle "Workflow public"
- Liste des utilisateurs avec checkboxes
- Liste des groupes avec checkboxes
- Résumé des permissions en temps réel
- Mise à jour automatique via API

**`Designer.jsx`**
- Bouton "Permissions" dans le header
- Modal plein écran avec `WorkflowPermissions`
- Sauvegarde automatique des permissions
- Visible uniquement pour workflows existants (pas pour "nouveau workflow")

#### Hooks & API

```javascript
// workflowApi.js
getAccessibleWorkflows()
updateWorkflowPermissions(id, permissions)
checkWorkflowAccess(id)
```

## Utilisation

### Créer un workflow public
1. Créer/Éditer un workflow
2. Cliquer sur "Permissions"
3. Cocher "Workflow public"
4. Fermer le modal (sauvegarde automatique)

### Restreindre à des utilisateurs spécifiques
1. Créer/Éditer un workflow
2. Cliquer sur "Permissions"
3. Décocher "Workflow public"
4. Cocher les utilisateurs dans la liste
5. Fermer le modal

### Autoriser par groupe
1. Créer/Éditer un workflow
2. Cliquer sur "Permissions"
3. Décocher "Workflow public"
4. Cocher les groupes dans la liste
5. Tous les membres du groupe auront accès

### Démarrer un workflow
1. Aller dans le menu "Démarrer Workflow"
2. Voir la liste des workflows accessibles
3. Cliquer sur "Démarrer ce workflow"
4. Confirmer dans le modal
5. Être redirigé vers le monitoring de l'instance

## Permissions par défaut

Lors de la création d'un workflow :
- `isPublic = false`
- `allowedUsers = []`
- `allowedGroups = []`

**Qui a accès par défaut ?**
- Le créateur du workflow
- Les administrateurs

## Cas d'usage

### 1. Workflow RH (privé)
```json
{
  "isPublic": false,
  "allowedGroups": ["uuid-groupe-rh"],
  "allowedUsers": []
}
```
→ Accessible uniquement au groupe RH

### 2. Workflow de demande de congés (public)
```json
{
  "isPublic": true,
  "allowedGroups": [],
  "allowedUsers": []
}
```
→ Accessible à tous les employés

### 3. Workflow comptabilité (utilisateurs spécifiques)
```json
{
  "isPublic": false,
  "allowedUsers": ["uuid-comptable1", "uuid-comptable2"],
  "allowedGroups": []
}
```
→ Accessible uniquement à ces 2 comptables

### 4. Workflow projet (groupe + utilisateurs)
```json
{
  "isPublic": false,
  "allowedGroups": ["uuid-equipe-projet-x"],
  "allowedUsers": ["uuid-chef-projet", "uuid-client"]
}
```
→ Accessible à l'équipe projet + chef de projet + client

## Navigation

- **Menu** : "Démarrer Workflow" → `/workflows/start`
- **Workflows** : Liste complète (admin/créateurs) → `/workflows`
- **Designer** : Bouton "Permissions" → Modal de configuration
- **Après démarrage** : Redirection vers `/workflows/:id/instances`

## Sécurité

### Backend
- Toutes les routes nécessitent authentification (`authenticate` middleware)
- Vérification des permissions avant modification
- Seul le créateur ou admin peut modifier les permissions
- Filtrage SQL avec opérateurs Sequelize (`Op.contains`, `Op.overlap`)

### Frontend
- Routes protégées par `ProtectedRoute`
- Bouton "Permissions" visible uniquement pour workflows existants
- Validation côté serveur systématique

## Performance

### Optimisations
- **Index GIN** sur arrays UUID (recherche rapide dans `allowed_users`/`allowed_groups`)
- **Requête unique** : JOIN avec User.groups pour récupérer tous les groupes en une fois
- **Cache React Query** : 30 secondes pour la liste des workflows accessibles
- **Pagination backend** : Limite à 100 workflows retournés

### Requête optimisée
```sql
SELECT * FROM workflows 
WHERE is_public = true
  OR created_by = $userId
  OR allowed_users @> ARRAY[$userId]
  OR allowed_groups && ARRAY[$userGroupIds]
ORDER BY name ASC;
```

## Migration

Pour appliquer le système de permissions à une base existante :

```bash
# Ajouter les colonnes
ALTER TABLE workflows 
ADD COLUMN allowed_users UUID[] DEFAULT '{}',
ADD COLUMN allowed_groups UUID[] DEFAULT '{}',
ADD COLUMN is_public BOOLEAN DEFAULT false;

# Créer les indexes
CREATE INDEX idx_workflows_allowed_users ON workflows USING GIN(allowed_users);
CREATE INDEX idx_workflows_allowed_groups ON workflows USING GIN(allowed_groups);
CREATE INDEX idx_workflows_is_public ON workflows(is_public);

# Par défaut, rendre tous les workflows existants publics (optionnel)
UPDATE workflows SET is_public = true;
```

## Roadmap

### Phase 2
- [ ] Permissions sur les actions (view vs start vs edit)
- [ ] Permissions sur les instances (qui peut voir les instances)
- [ ] Logs d'audit des changements de permissions
- [ ] Notification lors de l'ajout/retrait de permissions

### Phase 3
- [ ] Rôles personnalisés (viewer, starter, editor, owner)
- [ ] Héritage de permissions (workflow templates)
- [ ] Permissions conditionnelles (horaires, départements, etc.)
- [ ] API de synchronisation avec AD/LDAP
