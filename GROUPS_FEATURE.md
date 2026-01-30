# Fonctionnalité Groupes

## Vue d'ensemble

La fonctionnalité de groupes permet aux utilisateurs de créer et gérer des groupes d'utilisateurs avec des permissions basées sur les rôles.

## Règles de gestion

### Utilisateurs standards (role: 'user')
- ✅ Peuvent créer des groupes privés uniquement
- ✅ Peuvent voir tous les groupes publics
- ✅ Peuvent voir leurs propres groupes privés
- ✅ Peuvent modifier/supprimer leurs propres groupes
- ✅ Peuvent ajouter/retirer des membres de leurs groupes

### Administrateurs (role: 'admin')
- ✅ Peuvent créer des groupes publics ou privés
- ✅ Peuvent voir tous les groupes (publics et privés)
- ✅ Peuvent modifier/supprimer n'importe quel groupe
- ✅ Peuvent ajouter/retirer des membres de n'importe quel groupe

## Structure de la base de données

### Table `groups`
```sql
- id: UUID (primary key)
- name: VARCHAR(255) NOT NULL
- description: TEXT
- is_public: BOOLEAN DEFAULT FALSE
- created_by: UUID (foreign key -> users.id)
- members: JSONB (array of user IDs)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## API Endpoints

### Groupes
- `GET /api/groups` - Liste tous les groupes accessibles
- `GET /api/groups/:id` - Récupère un groupe spécifique
- `POST /api/groups` - Crée un nouveau groupe
- `PUT /api/groups/:id` - Modifie un groupe
- `DELETE /api/groups/:id` - Supprime un groupe

### Membres
- `POST /api/groups/:id/members` - Ajoute un membre au groupe
- `DELETE /api/groups/:id/members/:userId` - Retire un membre du groupe

## Frontend

### Page principale
- Route: `/groups`
- Composant: `GroupsPage.jsx`
- Accessible à tous les utilisateurs authentifiés

### Fonctionnalités
- ✅ Affichage en grille des groupes
- ✅ Création de groupe avec modal
- ✅ Édition de groupe (nom, description, visibilité)
- ✅ Suppression de groupe avec confirmation
- ✅ Gestion des membres avec modal dédié
- ✅ Badge visuel pour groupes publics/privés
- ✅ Restrictions basées sur les permissions utilisateur

### Hooks React Query
- `useGroups()` - Liste des groupes
- `useGroup(id)` - Détails d'un groupe
- `useCreateGroup()` - Création
- `useUpdateGroup()` - Modification
- `useDeleteGroup()` - Suppression
- `useAddMember()` - Ajout membre
- `useRemoveMember()` - Retrait membre

## Navigation

Le lien "Groupes" est disponible dans la barre latérale pour tous les utilisateurs authentifiés.

## Migration & Seeding

### Migration SQL
```bash
# La table est créée automatiquement par Sequelize
npm run migrate
```

### Données de test
```bash
# Via Docker
make seed-groups

# Ou directement
npm run seed:groups
```

Les groupes de test créés :
1. **Équipe Développement** (public) - Créé par admin
2. **Administrateurs** (privé) - Créé par admin
3. **Mon Équipe** (privé) - Créé par user
4. **Design & UX** (public) - Créé par admin

## Utilisation

### En tant qu'utilisateur standard
1. Accédez à la page "Groupes"
2. Cliquez sur "Nouveau groupe"
3. Remplissez le nom et la description
4. Le groupe sera automatiquement privé
5. Cliquez sur "Créer"
6. Gérez les membres via le bouton "Membres"

### En tant qu'administrateur
1. Accédez à la page "Groupes"
2. Cliquez sur "Nouveau groupe"
3. Remplissez le nom et la description
4. **Cochez "Groupe public" si désiré**
5. Cliquez sur "Créer"
6. Vous pouvez aussi modifier/supprimer tous les groupes existants

## Sécurité

- ✅ Toutes les routes nécessitent l'authentification
- ✅ Validation des permissions côté backend
- ✅ Le créateur d'un groupe ne peut pas être retiré
- ✅ Les utilisateurs standards ne peuvent pas créer de groupes publics
- ✅ Les utilisateurs ne voient que les groupes auxquels ils ont accès

## Fichiers créés/modifiés

### Backend
- `backend/src/models/group.model.js` - Modèle Sequelize
- `backend/src/controllers/group.controller.js` - Contrôleur
- `backend/src/routes/group.routes.js` - Routes API
- `backend/src/migrations/004-add-groups.sql` - Migration SQL
- `backend/src/migrations/seed-groups.js` - Script de seed
- `backend/src/app.js` - Ajout route /api/groups
- `backend/src/models/index.js` - Export du modèle Group
- `backend/package.json` - Ajout script seed:groups

### Frontend
- `frontend/src/pages/GroupsPage.jsx` - Page principale
- `frontend/src/services/groupApi.js` - API client
- `frontend/src/hooks/useGroups.js` - Hooks React Query
- `frontend/src/App.jsx` - Route /groups
- `frontend/src/components/Layout/Layout.jsx` - Ajout navigation

### Configuration
- `Makefile` - Commande seed-groups
- `GROUPS_FEATURE.md` - Cette documentation

## Tests

Pour tester la fonctionnalité :

1. Lancez l'environnement de développement :
```bash
make dev-d
```

2. Seedez les données de test (incluant utilisateurs) :
```bash
make seed-test
```

3. Ajoutez des groupes de test :
```bash
make seed-groups
```

4. Connectez-vous avec :
   - Admin: `admin@workflow.com` / `admin123`
   - User: `john.doe@workflow.com` / `password123`

5. Accédez à `/groups` dans l'interface

## Évolutions possibles

- [ ] Ajouter des rôles au sein des groupes (admin, membre, etc.)
- [ ] Permettre aux membres de quitter un groupe
- [ ] Ajouter des notifications lors de l'ajout à un groupe
- [ ] Recherche et filtres avancés
- [ ] Import/export de groupes
- [ ] Statistiques d'utilisation des groupes
- [ ] Association de groupes aux workflows/tâches
