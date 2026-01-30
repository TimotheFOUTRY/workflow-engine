.PHONY: help dev prod stop restart logs build clean install migrate test shell db-shell

# Couleurs pour l'affichage
BLUE=\033[0;34m
GREEN=\033[0;32m
RED=\033[0;31m
NC=\033[0m # No Color

help: ## Affiche cette aide
	@echo "$(BLUE)Workflow Engine - Commandes disponibles$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# ================================
# DÉVELOPPEMENT
# ================================

dev: ## Lance l'environnement de développement avec hot reload
	@echo "$(BLUE)🚀 Démarrage en mode développement...$(NC)"
	docker compose -f docker-compose.dev.yml up --build -d

dev-d: ## Lance l'environnement de développement en arrière-plan
	@echo "$(BLUE)🚀 Démarrage en mode développement (détaché)...$(NC)"
	docker compose -f docker-compose.dev.yml up -d --build
	@echo "$(GREEN)✓ Services démarrés$(NC)"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend API: http://localhost:3001"
	@echo "RabbitMQ UI: http://localhost:15672"

dev-logs: ## Affiche les logs du mode développement
	docker compose -f docker-compose.dev.yml logs -f

dev-logs-front: ## Affiche les logs du frontend
	docker compose -f docker-compose.dev.yml logs -f frontend

dev-logs-back: ## Affiche les logs du backend
	docker compose -f docker-compose.dev.yml logs -f backend

dev-stop: ## Arrête l'environnement de développement
	@echo "$(BLUE)⏹ Arrêt du mode développement...$(NC)"
	docker compose -f docker-compose.dev.yml down
	@echo "$(GREEN)✓ Services arrêtés$(NC)"

dev-restart: ## Redémarre l'environnement de développement
	@echo "$(BLUE)🔄 Redémarrage du mode développement...$(NC)"
	docker compose -f docker-compose.dev.yml restart

dev-rebuild: ## Reconstruit et redémarre le mode développement
	@echo "$(BLUE)🔨 Reconstruction du mode développement...$(NC)"
	docker compose -f docker-compose.dev.yml up -d --build --force-recreate

# ================================
# PRODUCTION
# ================================

prod: ## Lance l'environnement de production
	@echo "$(BLUE)🚀 Démarrage en mode production...$(NC)"
	docker compose up --build

prod-d: ## Lance l'environnement de production en arrière-plan
	@echo "$(BLUE)🚀 Démarrage en mode production (détaché)...$(NC)"
	docker compose up -d --build
	@echo "$(GREEN)✓ Services démarrés$(NC)"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend API: http://localhost:3001"

prod-logs: ## Affiche les logs du mode production
	docker compose logs -f

prod-stop: ## Arrête l'environnement de production
	@echo "$(BLUE)⏹ Arrêt du mode production...$(NC)"
	docker compose down
	@echo "$(GREEN)✓ Services arrêtés$(NC)"

prod-restart: ## Redémarre l'environnement de production
	@echo "$(BLUE)🔄 Redémarrage du mode production...$(NC)"
	docker compose restart

# ================================
# GESTION DES SERVICES
# ================================

stop: ## Arrête tous les services (dev et prod)
	@echo "$(BLUE)⏹ Arrêt de tous les services...$(NC)"
	docker compose down 2>/dev/null || true
	docker compose -f docker-compose.dev.yml down 2>/dev/null || true
	@echo "$(GREEN)✓ Tous les services arrêtés$(NC)"

clean: ## Nettoie les containers, images et volumes
	@echo "$(RED)🧹 Nettoyage complet...$(NC)"
	@echo "$(RED)⚠ Cette action va supprimer les données (volumes)$(NC)"
	@read -p "Êtes-vous sûr ? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v --remove-orphans; \
		docker compose -f docker-compose.dev.yml down -v --remove-orphans;
		echo "$(GREEN)✓ Nettoyage terminé$(NC)"; \
	fi

clean-images: ## Supprime les images Docker du projet
	@echo "$(BLUE)🧹 Suppression des images...$(NC)"
	docker compose down --rmi all 2>/dev/null || true
	docker compose -f docker-compose.dev.yml down --rmi all 2>/dev/null || true
	@echo "$(GREEN)✓ Images supprimées$(NC)"

ps: ## Liste les containers en cours d'exécution
	@echo "$(BLUE)📋 Containers actifs:$(NC)"
	@docker ps --filter "name=workflow-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# ================================
# BUILD & INSTALLATION
# ================================

build-front: ## Reconstruit uniquement le frontend
	@echo "$(BLUE)🔨 Reconstruction du frontend...$(NC)"
	docker compose -f docker-compose.dev.yml up -d --build frontend

build-back: ## Reconstruit uniquement le backend
	@echo "$(BLUE)🔨 Reconstruction du backend...$(NC)"
	docker compose -f docker-compose.dev.yml up -d --build backend

install-front: ## Installe les dépendances du frontend
	@echo "$(BLUE)📦 Installation des dépendances frontend...$(NC)"
	cd frontend && npm install

install-back: ## Installe les dépendances du backend
	@echo "$(BLUE)📦 Installation des dépendances backend...$(NC)"
	cd backend && npm install

install: install-front install-back ## Installe toutes les dépendances

# ================================
# BASE DE DONNÉES
# ================================

migrate: ## Exécute les migrations de base de données
	@echo "$(BLUE)🗄️  Exécution des migrations...$(NC)"
	@echo "Migration 1: Schema initial"
	@docker exec -i workflow-postgres-dev psql -U workflow_user -d workflow_db < backend/src/migrations/schema.sql 2>/dev/null || true
	@echo "Migration 2: User status"
	@docker exec -i workflow-postgres-dev psql -U workflow_user -d workflow_db < backend/src/migrations/002-add-user-status.sql 2>/dev/null || true
	@echo "Migration 3: User service"
	@docker exec -i workflow-postgres-dev psql -U workflow_user -d workflow_db < backend/src/migrations/003-add-user-service.sql 2>/dev/null || true
	@echo "$(GREEN)✓ Migrations terminées$(NC)"

seed: ## Crée l'utilisateur admin par défaut
	@echo "$(BLUE)👤 Création de l'utilisateur admin...$(NC)"
	docker exec -it workflow-backend-dev npm run seed || \
	docker exec -it workflow-backend npm run seed
	@echo "$(GREEN)✓ Seed terminé$(NC)"

seed-test: ## Remplit la DB avec des données de test complètes
	@echo "$(BLUE)🌱 Remplissage de la base de données avec des données de test...$(NC)"
	docker exec -it workflow-backend-dev npm run seed:test || \
	docker exec -it workflow-backend npm run seed:test
	@echo "$(GREEN)✓ Base de données remplie avec succès$(NC)"

seed-groups: ## Ajoute des groupes de test dans la DB
	@echo "$(BLUE)🌱 Ajout de groupes de test...$(NC)"
	docker exec -it workflow-backend-dev npm run seed:groups || \
	docker exec -it workflow-backend npm run seed:groups
	@echo "$(GREEN)✓ Groupes ajoutés avec succès$(NC)"

db-shell: ## Ouvre un shell PostgreSQL
	@echo "$(BLUE)🗄️  Connexion à PostgreSQL...$(NC)"
	docker exec -it workflow-postgres-dev psql -U workflow_user -d workflow_db || \
	docker exec -it workflow-postgres psql -U workflow_user -d workflow_db

db-reset: ## Reset complètement la base de données
	@echo "$(RED)⚠️  Reset de la base de données...$(NC)"
	@read -p "Êtes-vous sûr ? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v postgres 2>/dev/null || true; \
		docker compose -f docker-compose.dev.yml down -v postgres 2>/dev/null || true;
		make dev-d; \
		sleep 10; \
		make migrate; \
		echo "$(GREEN)✓ Base de données réinitialisée$(NC)"; \
	fi

# ================================
# SHELLS & DEBUG
# ================================

shell-front: ## Ouvre un shell dans le container frontend
	@docker exec -it workflow-frontend-dev sh || \
	docker exec -it workflow-frontend sh

shell-back: ## Ouvre un shell dans le container backend
	@docker exec -it workflow-backend-dev sh || \
	docker exec -it workflow-backend sh

shell-db: db-shell ## Alias pour db-shell

# ================================
# TESTS & QUALITÉ
# ================================

test: ## Exécute les tests du backend
	@echo "$(BLUE)🧪 Exécution des tests...$(NC)"
	docker exec -it workflow-backend-dev npm test || \
	docker exec -it workflow-backend npm test

test-front: ## Exécute les tests du frontend (si disponible)
	@echo "$(BLUE)🧪 Exécution des tests frontend...$(NC)"
	cd frontend && npm test

lint: ## Vérifie la qualité du code backend
	@echo "$(BLUE)🔍 Vérification du code...$(NC)"
	docker exec -it workflow-backend-dev npm run lint || \
	docker exec -it workflow-backend npm run lint

# ================================
# LOGS & MONITORING
# ================================

logs: ## Affiche les logs de tous les services
	docker compose -f docker-compose.dev.yml logs -f || docker compose logs -f

logs-db: ## Affiche les logs de PostgreSQL
	docker logs -f workflow-postgres-dev || docker logs -f workflow-postgres

logs-rabbit: ## Affiche les logs de RabbitMQ
	docker logs -f workflow-rabbitmq-dev || docker logs -f workflow-rabbitmq

# ================================
# UTILITAIRES
# ================================

status: ps ## Alias pour ps

urls: ## Affiche les URLs des services
	@echo "$(BLUE)🌐 URLs des services:$(NC)"
	@echo "$(GREEN)Frontend:$(NC)      http://localhost:3000"
	@echo "$(GREEN)Backend API:$(NC)   http://localhost:3001"
	@echo "$(GREEN)RabbitMQ UI:$(NC)   http://localhost:15672 (workflow/workflow123)"
	@echo "$(GREEN)Adminer DB:$(NC)    http://localhost:8080 (postgres/workflow_user/workflow_pass)"
	@echo "$(GREEN)PostgreSQL:$(NC)    localhost:5432 (workflow_user/workflow_pass)"

health: ## Vérifie l'état de santé des services
	@echo "$(BLUE)🏥 État de santé des services:$(NC)"
	@docker ps --filter "name=workflow-" --format "{{.Names}}: {{.Status}}"

backup-db: ## Crée un backup de la base de données
	@echo "$(BLUE)💾 Création du backup...$(NC)"
	@mkdir -p backups
	@docker exec workflow-postgres-dev pg_dump -U workflow_user workflow_db > backups/db-backup-$$(date +%Y%m%d-%H%M%S).sql || \
	docker exec workflow-postgres pg_dump -U workflow_user workflow_db > backups/db-backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "$(GREEN)✓ Backup créé dans backups/$(NC)"

restore-db: ## Restaure la base de données (spécifier FILE=chemin/vers/backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Erreur: Spécifiez le fichier avec FILE=chemin/vers/backup.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)♻️  Restauration du backup...$(NC)"
	@cat $(FILE) | docker exec -i workflow-postgres-dev psql -U workflow_user -d workflow_db || \
	cat $(FILE) | docker exec -i workflow-postgres psql -U workflow_user -d workflow_db
	@echo "$(GREEN)✓ Restauration terminée$(NC)"

# ================================
# RACCOURCIS
# ================================

up: dev-d ## Alias pour dev-d
down: dev-stop ## Alias pour dev-stop
restart: dev-restart ## Alias pour dev-restart
rebuild: dev-rebuild ## Alias pour dev-rebuild
