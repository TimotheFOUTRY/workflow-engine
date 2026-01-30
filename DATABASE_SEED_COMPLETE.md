# 🎉 Base de données remplie avec succès!

## ✅ Commande créée

Une nouvelle commande Makefile a été ajoutée:

```bash
make seed-test
```

Cette commande remplit automatiquement la base de données avec des données de test complètes.

## 📊 Données créées

### 👥 Utilisateurs (5)

| Email | Mot de passe | Rôle | Statut |
|-------|--------------|------|--------|
| **admin@workflow.com** | **admin123** | admin | approved |
| bob.manager@workflow.com | password123 | manager | approved |
| john.doe@workflow.com | password123 | user | approved |
| jane.smith@workflow.com | password123 | user | approved |
| alice.pending@workflow.com | password123 | user | pending |

### 📝 Formulaires (2)

1. **Demande de congés** - Formulaire de demande de vacances avec dates et type
2. **Demande d'achat** - Formulaire de demande d'achat avec montant et justification

### 🔄 Workflows (2)

1. **Workflow de validation de congés** - Processus complet d'approbation des congés
2. **Workflow d'achat** - Processus de validation des achats avec conditions

### 📋 Instances & Tâches (2 instances, 2 tâches)

- 1 instance en cours avec une tâche en attente pour le manager
- 1 instance terminée avec historique complet

## 🚀 Comment utiliser

### 1. Première utilisation

```bash
# Démarrer les services
make dev-d

# Attendre 10 secondes que les services démarrent

# Exécuter les migrations
make migrate

# Remplir avec les données de test
make seed-test
```

### 2. Connexion

Accédez à http://localhost:3000 et connectez-vous avec:

**Compte admin:**
- Email: `admin@workflow.com`
- Mot de passe: `admin123`

### 3. Vérification

La commande affiche un résumé complet des données créées:
- ✅ 5 utilisateurs créés
- ✅ 2 formulaires créés
- ✅ 2 workflows créés
- ✅ 2 instances de workflow créées
- ✅ 2 tâches créées

## 🔄 Réexécution

Le script est **idempotent** - vous pouvez le réexécuter sans problème:
- Il vérifie si les données existent déjà
- Il ne crée que les données manquantes
- Aucune duplication de données

## 📚 Documentation complète

Pour plus de détails, consultez:
- [docs/DATABASE_SEEDING.md](docs/DATABASE_SEEDING.md) - Guide complet du seeding
- [docs/API.md](docs/API.md) - Documentation de l'API
- [README.md](README.md) - Documentation principale

## 🔧 Autres commandes utiles

```bash
make seed          # Créer uniquement l'admin
make db-shell      # Ouvrir PostgreSQL
make db-reset      # Réinitialiser la DB
make backup-db     # Sauvegarder la DB
make urls          # Voir les URLs des services
make help          # Toutes les commandes
```

## ⚠️ Important

**Ces identifiants sont pour le développement uniquement!**

NE JAMAIS utiliser ces mots de passe en production.

---

**Date de création:** 29 janvier 2026
**Version:** 1.0.0
