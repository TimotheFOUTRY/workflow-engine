# 🚀 Quick Start - Workflow Engine

## Démarrage rapide en 4 étapes

### 1️⃣ Démarrer les services

```bash
make dev-d
```

Attendez environ 10 secondes que tous les services démarrent.

### 2️⃣ Exécuter les migrations

```bash
make migrate
```

### 3️⃣ Remplir la base de données

```bash
make seed-test
```

### 4️⃣ Se connecter

Ouvrez votre navigateur: **http://localhost:3000**

Connectez-vous avec:
- **Email:** `admin@workflow.com`
- **Mot de passe:** `admin123`

---

## ✅ C'est fait!

Vous avez maintenant accès à:

- **5 utilisateurs de test** (admin, manager, 2 users, 1 pending)
- **2 formulaires prêts à l'emploi**
- **2 workflows configurés**
- **Des instances et tâches exemples**

## 🌐 URLs des services

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| RabbitMQ UI | http://localhost:15672 (workflow/workflow123) |
| Adminer DB | http://localhost:8080 |

## 👥 Comptes de test

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@workflow.com | admin123 | Admin |
| bob.manager@workflow.com | password123 | Manager |
| john.doe@workflow.com | password123 | User |
| jane.smith@workflow.com | password123 | User |

## 🔄 Commandes utiles

```bash
make help              # Voir toutes les commandes
make status            # État des services
make dev-logs          # Voir les logs
make db-shell          # Ouvrir PostgreSQL
make restart           # Redémarrer
make stop              # Tout arrêter
```

## 🆘 Problèmes?

### Les services ne démarrent pas
```bash
make stop
make dev-d
```

### Erreur de base de données
```bash
make migrate
make seed-test
```

### Tout réinitialiser
```bash
make db-reset
make seed-test
```

## 📚 Documentation

- [DATABASE_SEEDING.md](docs/DATABASE_SEEDING.md) - Guide complet du seeding
- [API.md](docs/API.md) - Documentation de l'API
- [WORKFLOW_ENGINE.md](docs/WORKFLOW_ENGINE.md) - Le moteur de workflow

---

**Bon développement! 🎉**
