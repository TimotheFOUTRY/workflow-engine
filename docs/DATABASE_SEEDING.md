# Guide de seeding de la base de données

## Vue d'ensemble

Ce guide explique comment remplir la base de données avec des données de test pour le développement.

## Commandes disponibles

### 1. Créer uniquement l'utilisateur admin

```bash
make seed
```

Cette commande crée un utilisateur administrateur par défaut:
- **Email:** admin@workflow.com
- **Mot de passe:** admin123
- **Rôle:** admin

### 2. Remplir la base avec des données de test complètes

```bash
make seed-test
```

Cette commande crée:

#### Utilisateurs
- **Admin:** admin@workflow.com / admin123 (admin)
- **Manager:** bob.manager@workflow.com / password123 (manager)
- **Utilisateur 1:** john.doe@workflow.com / password123 (user)
- **Utilisateur 2:** jane.smith@workflow.com / password123 (user)
- **Utilisateur en attente:** alice.pending@workflow.com / password123 (user, status: pending)

#### Formulaires
- **Demande de congés** - Formulaire pour soumettre des demandes de vacances
- **Demande d'achat** - Formulaire pour les demandes d'achat de matériel

#### Workflows
- **Workflow de validation de congés** - Processus complet de validation des congés
- **Workflow d'achat** - Processus de validation des achats avec conditions sur le montant

#### Instances et tâches
- Une instance de workflow en cours avec une tâche en attente
- Une instance de workflow terminée

## Workflow typique de développement

### Premier démarrage

```bash
# 1. Démarrer les services
make dev-d

# 2. Attendre que les services soient prêts (environ 10 secondes)
# Vérifier l'état avec:
make status

# 3. Exécuter les migrations
make migrate

# 4. Remplir la base avec les données de test
make seed-test
```

### Réinitialiser la base de données

Si vous souhaitez repartir de zéro:

```bash
# Réinitialiser complètement la DB
make db-reset

# Puis remplir avec les données de test
make seed-test
```

## Test de connexion

Après avoir exécuté `make seed-test`, vous pouvez vous connecter avec:

### Interface utilisateur
1. Ouvrir http://localhost:3000
2. Utiliser les identifiants:
   - admin@workflow.com / admin123 (accès complet)
   - bob.manager@workflow.com / password123 (manager, peut approuver)
   - john.doe@workflow.com / password123 (utilisateur standard)

### API directe

```bash
# Test de login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@workflow.com",
    "password": "admin123"
  }'
```

## Vérification de la base de données

Pour vérifier que les données ont été insérées:

```bash
# Ouvrir un shell PostgreSQL
make db-shell

# Puis exécuter des requêtes SQL:
SELECT * FROM users;
SELECT * FROM workflows;
SELECT * FROM workflow_instances;
SELECT * FROM tasks;
SELECT * FROM forms;
```

## Sauvegarde et restauration

### Créer une sauvegarde

```bash
make backup-db
```

Les sauvegardes sont stockées dans le dossier `backups/` avec un horodatage.

### Restaurer une sauvegarde

```bash
make restore-db FILE=backups/db-backup-20260129-143000.sql
```

## Commandes utiles

```bash
# Afficher toutes les commandes disponibles
make help

# Voir les URLs des services
make urls

# Voir l'état des services
make health

# Voir les logs du backend
make dev-logs-back

# Ouvrir un shell dans le container backend
make shell-back
```

## Sécurité

⚠️ **IMPORTANT:** Ces données de test sont uniquement pour le développement local.

**NE JAMAIS utiliser ces mots de passe en production!**

En production:
1. Ne pas utiliser `make seed-test`
2. Créer manuellement les utilisateurs avec des mots de passe sécurisés
3. Utiliser des variables d'environnement pour les credentials
4. Activer l'authentification à deux facteurs si disponible

## Dépannage

### Erreur: "Cannot connect to database"

```bash
# Vérifier que les services sont démarrés
make status

# Redémarrer les services si nécessaire
make restart
```

### Erreur: "Table does not exist"

```bash
# Exécuter les migrations
make migrate
```

### Les données existent déjà

Le script de seed est idempotent - il vérifie si les données existent avant de les créer. Vous pouvez l'exécuter plusieurs fois sans problème.

### Repartir de zéro

```bash
# Arrêter tout
make stop

# Nettoyer complètement (supprime les volumes)
make clean

# Redémarrer
make dev-d

# Attendre 10 secondes puis:
make migrate
make seed-test
```

## Scripts personnalisés

Les scripts de seed se trouvent dans:
- `backend/src/migrations/seed-admin.js` - Création de l'admin uniquement
- `backend/src/migrations/seed-test-data.js` - Données de test complètes

Vous pouvez les modifier pour ajouter vos propres données de test.

## Ressources

- [Documentation de l'API](../docs/API.md)
- [Documentation du moteur de workflow](../docs/WORKFLOW_ENGINE.md)
- [README principal](../README.md)
