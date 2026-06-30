#!/bin/bash
# Script d'installation automatisée VanClinic
# Usage: ./setup.sh

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  VanClinic - Setup automatique${NC}"
echo -e "${BLUE}========================================${NC}"

# Vérification Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}❌ Docker n'est pas installé. Installe-le d'abord : https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

echo -e "\n${GREEN}[1/5]${NC} Construction de l'image PHP..."
docker compose build php

echo -e "\n${GREEN}[2/5]${NC} Démarrage du conteneur PHP pour Composer..."
docker compose up -d php database

# Attendre que la BDD soit prête
echo -e "${YELLOW}⏳ Attente de PostgreSQL...${NC}"
sleep 5

echo -e "\n${GREEN}[3/5]${NC} Initialisation du projet Symfony..."
if [ ! -f "backend/composer.json" ]; then
    docker compose exec -T php composer create-project symfony/skeleton:"7.1.*" . --no-interaction
    docker compose exec -T php composer require api orm-pack security-bundle --no-interaction
    docker compose exec -T php composer require lexik/jwt-authentication-bundle nelmio/cors-bundle --no-interaction
    docker compose exec -T php composer require symfony/mailer symfony/validator --no-interaction
    docker compose exec -T php composer require --dev maker-bundle doctrine/doctrine-fixtures-bundle --no-interaction
else
    echo "Symfony déjà installé, on passe."
fi

echo -e "\n${GREEN}[4/5]${NC} Initialisation du projet React..."
if [ ! -f "frontend/package.json" ]; then
    docker run --rm -v "$(pwd)/frontend":/app -w /app node:20-alpine \
        sh -c "npm create vite@latest . -- --template react-ts -y && npm install"
    docker run --rm -v "$(pwd)/frontend":/app -w /app node:20-alpine \
        sh -c "npm install react-router-dom axios @tanstack/react-query react-hook-form zod @hookform/resolvers i18next react-i18next i18next-browser-languagedetector tailwindcss @tailwindcss/vite lucide-react"
else
    echo "React déjà installé, on passe."
fi

echo -e "\n${GREEN}[5/5]${NC} Démarrage de tous les services..."
docker compose up -d

echo -e "\n${GREEN}✅ Installation terminée !${NC}\n"
echo -e "${BLUE}Services accessibles :${NC}"
echo -e "  🔵 API Symfony  : http://localhost:8000"
echo -e "  ⚛️  React        : http://localhost:5173"
echo -e "  🐘 pgAdmin      : http://localhost:5050 (admin@vanclinic.local / admin)"
echo -e "  📧 MailHog      : http://localhost:8025"
echo -e "\n${YELLOW}Prochaine étape : modélisation BDD (étape 2)${NC}"
