# 🚐 VanClinic — Plateforme E-Santé Ophtalmologique

Plateforme web responsive pour la gestion d'une clinique mobile ophtalmologique à Madagascar.

## 📦 Stack Technique

- **Backend** : Symfony 7 (PHP 8.3) + API Platform
- **Frontend** : React 18 + Vite + TypeScript
- **Base de données** : PostgreSQL 16
- **Auth** : JWT (LexikJWTAuthenticationBundle)
- **Conteneurisation** : Docker + Docker Compose

## 🛠️ Prérequis

- Docker Desktop (Windows/Mac) ou Docker Engine + Docker Compose (Linux)
- Git

## 🚀 Installation initiale (à faire une seule fois)

### 1. Cloner / créer le dossier projet

```bash
cd vanclinic
```

### 2. Initialiser le backend Symfony

```bash
# Lancer le conteneur PHP pour avoir Composer
docker compose up -d php

# Créer un projet Symfony 7 dans backend/
docker compose exec php composer create-project symfony/skeleton:"7.1.*" .

# Installer les bundles essentiels
docker compose exec php composer require api
docker compose exec php composer require symfony/orm-pack
docker compose exec php composer require symfony/security-bundle
docker compose exec php composer require lexik/jwt-authentication-bundle
docker compose exec php composer require nelmio/cors-bundle
docker compose exec php composer require symfony/mailer
docker compose exec php composer require symfony/validator
docker compose exec php composer require --dev symfony/maker-bundle
docker compose exec php composer require --dev doctrine/doctrine-fixtures-bundle
```

### 3. Initialiser le frontend React

```bash
# Créer un projet React + Vite + TypeScript dans frontend/
docker run --rm -v $(pwd)/frontend:/app -w /app node:20-alpine \
  sh -c "npm create vite@latest . -- --template react-ts -y"

# Installer les dépendances de base
docker run --rm -v $(pwd)/frontend:/app -w /app node:20-alpine \
  sh -c "npm install && npm install react-router-dom axios @tanstack/react-query \
         react-hook-form zod @hookform/resolvers i18next react-i18next i18next-browser-languagedetector \
         tailwindcss @tailwindcss/vite lucide-react"
```

### 4. Lancer tous les services

```bash
docker compose up -d
```

## 🌐 Accès aux services

| Service | URL | Identifiants |
|---|---|---|
| API Symfony | http://localhost:8000 | — |
| Frontend React | http://localhost:5173 | — |
| pgAdmin (BDD) | http://localhost:5050 | admin@vanclinic.local / admin |
| MailHog (emails) | http://localhost:8025 | — |
| PostgreSQL | localhost:5432 | vanclinic / vanclinic_secret |

## 📋 Commandes utiles

```bash
# Démarrer
docker compose up -d

# Arrêter
docker compose down

# Voir les logs
docker compose logs -f [service]

# Entrer dans le conteneur PHP
docker compose exec php sh

# Console Symfony
docker compose exec php php bin/console [commande]

# Créer une migration
docker compose exec php php bin/console make:migration
docker compose exec php php bin/console doctrine:migrations:migrate
```

## 📂 Structure du projet

```
vanclinic/
├── docker-compose.yml          # Orchestration des services
├── docker/
│   ├── php/Dockerfile          # Image PHP-FPM custom
│   └── nginx/default.conf      # Config Nginx pour Symfony
├── backend/                    # Code Symfony (API)
│   ├── src/
│   │   ├── Entity/             # Doctrine entities
│   │   ├── Controller/         # Controllers
│   │   └── Security/           # Voters, Authenticators
│   └── config/
└── frontend/                   # Code React
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── hooks/
    │   └── lib/
    └── public/
```

## 🔐 Sécurité

- JWT pour l'authentification stateless
- Mots de passe hashés (Argon2id par défaut Symfony)
- CORS configuré pour le front
- 2FA prévu (étape ultérieure)
- Audit log des connexions

## 📝 Prochaines étapes

- [x] Setup Docker (étape 1)
- [ ] Modélisation BDD (étape 2)
- [ ] API Auth : register, login, refresh, reset password (étape 3)
- [ ] Système de rôles & permissions (étape 4)
- [ ] 2FA (étape 5)
- [ ] Frontend Auth (étape 6)
- [ ] Intercepteurs Axios + routes protégées (étape 7)
- [ ] Historique de connexion (étape 8)
- [ ] i18n FR/MG (étape 9)
- [ ] Tests (étape 10)
