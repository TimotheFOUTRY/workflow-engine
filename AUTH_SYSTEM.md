# Système d'authentification - Workflow Engine

## 🔐 Vue d'ensemble

Système complet d'authentification JWT avec gestion des utilisateurs, validation des comptes et contrôle d'accès basé sur les rôles.

## 📋 Fonctionnalités

### Authentification
- ✅ Connexion par email/mot de passe
- ✅ Inscription avec validation de compte
- ✅ Tokens JWT avec refresh token
- ✅ Déconnexion sécurisée
- ✅ Protection CORS en développement/production

### Gestion des utilisateurs
- ✅ 3 rôles: Admin, Manager, Utilisateur
- ✅ 3 statuts: En attente, Approuvé, Rejeté
- ✅ Validation manuelle des comptes par admin
- ✅ Création manuelle de comptes par admin
- ✅ Modification des utilisateurs
- ✅ Suppression des utilisateurs
- ✅ Recherche et filtrage

### Pages disponibles

#### Pages publiques
- `/login` - Connexion
- `/register` - Inscription

#### Pages utilisateur (authentifiées)
- `/dashboard` - Tableau de bord
- `/tasks` - Liste des tâches
- `/workflows` - Liste des workflows

#### Pages admin (role admin requis)
- `/admin` - Tableau de bord admin
- `/admin/users` - Gestion des utilisateurs
- `/admin/users/create` - Créer un utilisateur
- `/admin/users/pending` - Utilisateurs en attente
- `/admin/analytics` - Statistiques

## 🚀 Démarrage rapide

### 1. Lancer les services

```bash
make dev-d
```

### 2. Créer l'utilisateur admin par défaut

```bash
docker exec -it workflow-backend-dev npm run seed
```

**Identifiants admin par défaut:**
- Email: `admin@workflow.com`
- Mot de passe: `admin123`

⚠️ **Changez ce mot de passe après la première connexion !**

### 3. Accéder à l'application

Ouvrez votre navigateur sur: http://localhost:3000

## 📝 Flux d'utilisation

### Inscription d'un nouvel utilisateur

1. L'utilisateur va sur `/register`
2. Remplit le formulaire d'inscription
3. Le compte est créé avec le statut "En attente"
4. L'utilisateur reçoit un message indiquant que son compte est en attente d'approbation

### Approbation par l'admin

1. L'admin se connecte avec son compte
2. Va sur `/admin/users/pending`
3. Voit la liste des utilisateurs en attente
4. Approuve ou rejette les demandes
5. Les utilisateurs approuvés peuvent maintenant se connecter

### Connexion

1. L'utilisateur va sur `/login`
2. Entre son email et mot de passe
3. Si approuvé et actif, il accède au dashboard
4. Sinon, un message d'erreur approprié s'affiche

## 🔑 API Endpoints

### Authentication (`/api/auth`)

| Méthode | Endpoint | Description | Public |
|---------|----------|-------------|--------|
| POST | `/register` | Inscription | ✅ |
| POST | `/login` | Connexion | ✅ |
| POST | `/refresh` | Rafraîchir le token | ✅ |
| GET | `/me` | Utilisateur actuel | 🔒 |
| POST | `/logout` | Déconnexion | 🔒 |

### Users (`/api/users`)

| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| GET | `/` | Liste des utilisateurs | Admin/Manager |
| GET | `/pending` | Utilisateurs en attente | Admin |
| GET | `/statistics` | Statistiques | Admin |
| GET | `/:id` | Détails utilisateur | Admin/Manager |
| POST | `/` | Créer un utilisateur | Admin |
| PUT | `/:id` | Modifier un utilisateur | Admin |
| DELETE | `/:id` | Supprimer un utilisateur | Admin |
| POST | `/:id/approve` | Approuver | Admin |
| POST | `/:id/reject` | Rejeter | Admin |

## 🎭 Rôles et permissions

### Utilisateur (user)
- Accès au dashboard
- Gestion de ses propres tâches
- Consultation des workflows

### Manager
- Tout ce qu'un utilisateur peut faire
- Consultation de la liste des utilisateurs
- Gestion avancée des workflows

### Admin
- Accès complet
- Gestion des utilisateurs
- Validation des comptes
- Statistiques système
- Configuration

## 🛡️ Sécurité

### Tokens JWT
- Durée de vie: 24h (configurable via `JWT_EXPIRES_IN`)
- Refresh token: 7 jours (configurable via `JWT_REFRESH_EXPIRES_IN`)
- Secret: Défini dans `JWT_SECRET` (environnement)

### Mots de passe
- Hash avec bcrypt (10 rounds)
- Validation côté client et serveur
- Minimum 6 caractères

### Protection des routes
- Middleware d'authentification sur toutes les routes protégées
- Vérification du rôle pour les routes admin
- Vérification du statut du compte (approuvé/actif)

## 🔧 Configuration

### Variables d'environnement (backend)

```env
# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://workflow_user:workflow_pass@postgres:5432/workflow_db

# CORS
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Configuration frontend

Le frontend utilise `localStorage` pour stocker:
- `token`: JWT access token
- `refreshToken`: JWT refresh token

## 📊 Modèle de données User

```javascript
{
  id: UUID,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: Enum('admin', 'manager', 'user'),
  status: Enum('pending', 'approved', 'rejected'),
  isActive: Boolean,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

## 🐛 Dépannage

### L'utilisateur ne peut pas se connecter
- Vérifier que le statut est "approved"
- Vérifier que isActive est true
- Vérifier les identifiants

### Token expiré
- Le refresh token est automatiquement utilisé
- Si le refresh token est expiré, l'utilisateur doit se reconnecter

### CORS errors
- Vérifier que `CORS_ORIGIN` est correctement configuré
- En développement, `NODE_ENV=development` accepte toutes les origines

## 📚 Exemples d'utilisation

### Créer un utilisateur via l'API

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Se connecter

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@workflow.com",
    "password": "admin123"
  }'
```

### Approuver un utilisateur

```bash
curl -X POST http://localhost:3001/api/users/{userId}/approve \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎨 Personnalisation

### Modifier la durée des tokens

Dans `.env`:
```env
JWT_EXPIRES_IN=1h        # Access token: 1 heure
JWT_REFRESH_EXPIRES_IN=30d  # Refresh token: 30 jours
```

### Ajouter un nouveau rôle

1. Modifier le modèle User: `backend/src/models/user.model.js`
2. Ajouter le rôle dans l'enum
3. Mettre à jour les middlewares d'autorisation
4. Mettre à jour le frontend (badges, permissions)

### Auto-approbation des comptes

Dans `auth.controller.js`, modifier la ligne:
```javascript
status: 'approved'  // Au lieu de 'pending'
```

## 📖 Documentation complète

- [API Documentation](./docs/API.md)
- [Workflow Engine](./docs/WORKFLOW_ENGINE.md)
- [Frontend Components](./frontend/COMPONENTS.md)

## 🤝 Support

Pour toute question ou problème:
1. Vérifier les logs: `make dev-logs-back`
2. Consulter cette documentation
3. Vérifier les variables d'environnement
