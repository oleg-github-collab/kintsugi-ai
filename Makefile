.PHONY: help dev build-backend build-frontend run-backend run-frontend docker-up docker-down clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Run both backend and frontend in development mode
	@echo "Starting development servers..."
	@cd backend && go run cmd/main.go & \
	cd frontend && npm run dev

build-backend: ## Build backend binary
	@echo "Building backend..."
	@cd backend && go build -o bin/main ./cmd/main.go

build-frontend: ## Build frontend for production
	@echo "Building frontend..."
	@cd frontend && npm run build

run-backend: ## Run backend server
	@cd backend && go run cmd/main.go

run-frontend: ## Run frontend development server
	@cd frontend && npm run dev

install-backend: ## Install backend dependencies
	@cd backend && go mod download

install-frontend: ## Install frontend dependencies
	@cd frontend && npm install

docker-up: ## Start all services with Docker Compose
	@docker-compose up -d

docker-down: ## Stop all Docker services
	@docker-compose down

docker-logs: ## View Docker logs
	@docker-compose logs -f

clean: ## Clean build artifacts
	@rm -rf backend/bin
	@rm -rf frontend/.next
	@rm -rf frontend/out
	@echo "Cleaned build artifacts"

test-backend: ## Run backend tests
	@cd backend && go test ./...

migrate: ## Run database migrations
	@cd backend && go run cmd/main.go migrate

.DEFAULT_GOAL := help
