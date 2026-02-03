# Mode Développement avec Hot Reload 🔥

Ce guide explique comment lancer le projet en mode développement avec hot reload activé pour le frontend et le backend.

## Prérequis

- Docker et Docker Compose installés
- Ports 3000, 3001, 5432, 5672, et 15672 disponibles

## Démarrage rapide

### 1. Mode développement avec watchers

```bash
# Démarrer tous les services en mode dev
docker-compose -f docker-compose.dev.yml up --build

# Ou en arrière-plan
docker-compose -f docker-compose.dev.yml up -d --build
```

### 2. Voir les logs en temps réel

```bash
# Tous les services
docker-compose -f docker-compose.dev.yml logs -f

# Seulement le frontend
docker-compose -f docker-compose.dev.yml logs -f frontend

# Seulement le backend
docker-compose -f docker-compose.dev.yml logs -f backend
```

## Fonctionnalités

### Frontend (Vite + React)
- ✅ Hot Module Replacement (HMR) activé
- ✅ Les modifications dans `/frontend/src` sont détectées automatiquement
- ✅ Rechargement instantané du navigateur
- 🌐 Accessible sur http://localhost:3000

### Backend (Node.js + Express)
- ✅ Nodemon watch activé
- ✅ Les modifications dans `/backend/src` sont détectées automatiquement
- ✅ Redémarrage automatique du serveur
- 🌐 API accessible sur http://localhost:3001

### Services additionnels
- 🐘 PostgreSQL: localhost:5432
- 🐰 RabbitMQ Management UI: http://localhost:15672 (workflow/workflow123)
- 🗄️ Adminer (DB Manager): http://localhost:8080
  - Système: PostgreSQL
  - Serveur: postgres
  - Utilisateur: workflow_user
  - Mot de passe: workflow_pass
  - Base: workflow_db

## Structure des fichiers de développement

```
workflow-engine/
├── docker-compose.dev.yml    # Configuration Docker pour le dev
├── backend/
│   ├── Dockerfile.dev         # Dockerfile optimisé pour le dev
│   └── nodemon.json          # Configuration nodemon
└── frontend/
    ├── Dockerfile.dev         # Dockerfile optimisé pour le dev
    └── vite.config.js        # Configuration Vite avec HMR
```

## Commandes utiles

```bash
# Arrêter les services
docker-compose -f docker-compose.dev.yml down

# Reconstruire un service spécifique
docker-compose -f docker-compose.dev.yml up -d --build frontend
docker-compose -f docker-compose.dev.yml up -d --build backend

# Accéder au shell d'un container
docker exec -it workflow-frontend-dev sh
docker exec -it workflow-backend-dev sh

# Nettoyer complètement (attention: supprime les volumes)
docker-compose -f docker-compose.dev.yml down -v
```

## Test du hot reload

### Frontend
1. Ouvrir http://localhost:3000
2. Modifier un fichier dans `frontend/src/` (ex: `App.jsx`)
3. Observer le rechargement instantané dans le navigateur

### Backend
1. Modifier un fichier dans `backend/src/` (ex: `app.js`)
2. Observer dans les logs: `[nodemon] restarting due to changes...`
3. Le serveur redémarre automatiquement

## Dépannage

### Le hot reload ne fonctionne pas
- Vérifier que les volumes sont bien montés
- Sur Windows/Mac: Vite utilise le polling, peut être plus lent
- Redémarrer les containers: `docker-compose -f docker-compose.dev.yml restart`

### Port déjà utilisé
```bash
# Trouver le processus utilisant le port 3000
lsof -i :3000
# Ou
sudo netstat -tulpn | grep :3000
```

### Problèmes de permissions
```bash
# Donner les permissions appropriées
sudo chown -R $USER:$USER .
```

## Mode production

Pour déployer en production, utilisez le fichier docker-compose.yml standard:

```bash
docker-compose up -d --build
```

## Notes importantes

- Les node_modules sont dans des volumes anonymes pour éviter les conflits
- Les changements dans package.json nécessitent un rebuild
- Le mode dev n'est PAS optimisé pour la production
- Les variables d'environnement de dev sont différentes de la production
