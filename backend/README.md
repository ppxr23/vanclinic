# VanClinic – Backend API

Backend de la plateforme e-santé **VanClinic** : clinique mobile ophtalmologique pour les zones rurales de Madagascar (région Atsinanana). Le backend gère le parcours patient de bout en bout : inscription, rendez-vous, dossiers médicaux électroniques (DME), téléexpertise, boutique en ligne (lunettes, lentilles), paiements Mobile Money et notifications multi-canaux.

## Stack technique

| Composant | Choix |
|---|---|
| Langage | PHP 8.2 |
| Framework | Symfony 6.4 (LTS) |
| Base de données | PostgreSQL 15 |
| ORM | Doctrine ORM 2.17 |
| Authentification | JWT (LexikJWTAuthenticationBundle) |
| Documentation API | OpenAPI 3 / Swagger UI (NelmioApiDocBundle) |
| Tests | PHPUnit 10 |

## Modules implémentés

Tous les modules du cahier des charges fonctionnel sont couverts :

- **Auth & comptes** : inscription patient, login JWT, profils, rôles (Patient, Agent Relais, Ophtalmologue, Technicien, Coordinateur), historique de connexion
- **Patients** : profil étendu, antécédents, allergies, contact d'urgence
- **Rendez-vous** : prise en ligne, détection de conflits, confirmation/annulation/reprogrammation, rappels automatiques
- **DME** (Dossier Médical Électronique) : observations, mesures OD/OG (sphère, cylindre, axe, vision corrigée/non corrigée, écart pupillaire), prescriptions, pièces jointes
- **Téléexpertise** : demandes d'avis entre soignants, niveaux d'urgence, réponses
- **Clinique mobile** : sessions du van sur le terrain (lieu, GPS, capacité, ophtalmologue référent)
- **Boutique** : catalogue produits multi-catégories (lunettes, lentilles, accessoires), gestion stock, panier, commandes
- **Paiement** : Mobile Money (Orange Money, Airtel Money, Mvola), Visa, espèces via agent relais, webhooks providers
- **Notifications** : Email, SMS, in-app, push - multi-canal automatique
- **Feedback** : avis utilisateurs (consultation, produit, plateforme, agent)
- **Contenus éducatifs** : articles, vidéos, infographies en français et malagasy
- **Tableau de bord** : indicateurs clés pour le coordinateur (patients, RDV, revenus, stock)

## Installation

### Prérequis

- PHP 8.2+ avec les extensions : `ctype`, `iconv`, `pdo_pgsql`, `intl`, `openssl`
- Composer 2.x
- PostgreSQL 15+
- OpenSSL (pour générer les clés JWT)
- Symfony CLI (recommandé, optionnel)

### Étapes

```bash
# 1. Cloner le projet et installer les dépendances
git clone <repo-url> vanclinic-backend
cd vanclinic-backend
composer install

# 2. Configurer l'environnement
cp .env .env.local
# Éditer .env.local : DATABASE_URL, JWT_PASSPHRASE, MAILER_DSN, clés Mobile Money

# 3. Créer la base de données
php bin/console doctrine:database:create

# 4. Appliquer les migrations
php bin/console doctrine:migrations:migrate --no-interaction

# 5. Charger les fixtures (utilisateurs de démo, produits, contenus)
php bin/console doctrine:fixtures:load --no-interaction

# 6. Générer les clés JWT
./bin/generate-jwt-keys.sh

# 7. Lancer le serveur de développement
symfony serve
# ou
php -S 127.0.0.1:8000 -t public/
```

L'API est alors accessible sur `http://localhost:8000`.

## Documentation API

Une fois le serveur lancé, la documentation Swagger est disponible à :

**http://localhost:8000/api/doc**

Tous les endpoints, schémas de requête/réponse et exemples y sont documentés et testables directement.

## Comptes de démo (après chargement des fixtures)

Tous les mots de passe staff : `Vanclinic2025!` — patients : `Patient2025!`

| Rôle | Email |
|---|---|
| Coordinateur | coordinateur@vanclinic.mg |
| Ophtalmologue | ophtalmo1@vanclinic.mg |
| Agent Relais | agent1@vanclinic.mg |
| Technicien | tech@vanclinic.mg |
| Patient | patient1@example.mg |

## Endpoints principaux

### Authentification
- `POST /api/auth/register` — Inscription patient
- `POST /api/auth/login` — Connexion (retourne JWT)
- `GET  /api/auth/me` — Profil de l'utilisateur courant
- `POST /api/auth/change-password` — Changer le mot de passe
- `POST /api/auth/forgot-password` — Réinitialiser le mot de passe

### Rendez-vous
- `GET  /api/appointments` — Mes rendez-vous (avec `?upcoming=true`)
- `POST /api/appointments` — Créer un rendez-vous
- `POST /api/appointments/{id}/confirm` — Confirmer
- `POST /api/appointments/{id}/cancel` — Annuler
- `POST /api/appointments/{id}/reschedule` — Reprogrammer

### Dossiers médicaux (DME)
- `GET  /api/medical/records/my` — Mes dossiers (patient)
- `GET  /api/medical/records/patient/{id}` — Dossiers d'un patient (soignant)
- `POST /api/medical/records/patient/{id}` — Créer un dossier (soignant)

### Téléexpertise
- `GET  /api/teleexpertise/pending` — Demandes en attente
- `POST /api/teleexpertise/record/{id}` — Créer une demande
- `POST /api/teleexpertise/{id}/respond` — Répondre

### Boutique
- `GET  /api/products` — Catalogue (filtres `?category=`)
- `GET  /api/products/{id}` — Détail produit
- `GET  /api/orders` — Mes commandes
- `POST /api/orders` — Créer une commande
- `POST /api/orders/{id}/cancel` — Annuler

### Paiements
- `POST /api/payments/order/{id}` — Initier un paiement
- `POST /api/payments/webhook/{provider}` — Webhook (Orange/Airtel/Mvola/Visa)

### Notifications & Feedback
- `GET  /api/notifications` — Notifications non lues
- `POST /api/notifications/{id}/read` — Marquer comme lue
- `POST /api/feedback` — Soumettre un avis

### Contenus publics
- `GET  /api/public/content?lang=fr|mg` — Liste des contenus éducatifs
- `GET  /api/public/content/{slug}` — Détail d'un contenu

### Administration
- `GET  /api/admin/dashboard` — Tableau de bord (coordinateur)
- `GET  /api/admin/users` — Liste des utilisateurs
- `POST /api/admin/users/staff` — Créer un compte staff

## Utilisation typique

### 1. Inscription d'un patient

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rakoto@example.mg",
    "phone": "+261341234567",
    "password": "MotDePasse123!",
    "firstName": "Rakoto",
    "lastName": "Jean",
    "birthDate": "1985-06-15",
    "gender": "M",
    "city": "Toamasina",
    "district": "Atsinanana",
    "preferredLanguage": "mg"
  }'
```

Retourne un token JWT à utiliser dans le header `Authorization: Bearer <token>`.

### 2. Prise de rendez-vous

```bash
curl -X POST http://localhost:8000/api/appointments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduledAt": "2026-06-15T10:00:00",
    "type": "on_site",
    "reason": "Vision floue depuis 3 mois",
    "clinicSessionId": 1
  }'
```

### 3. Paiement d'une commande via Orange Money

```bash
curl -X POST http://localhost:8000/api/payments/order/42 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "orange_money",
    "payerPhone": "+261341234567"
  }'
```

## Tests

```bash
# Lancer tous les tests unitaires
php bin/phpunit

# Lancer une suite spécifique
php bin/phpunit --testsuite "Unit Tests"

# Tests avec couverture (nécessite xdebug)
php bin/phpunit --coverage-html var/coverage
```

## Structure du projet

```
vanclinic-backend/
├── bin/
│   ├── console                  # CLI Symfony
│   └── generate-jwt-keys.sh     # Génère les clés JWT
├── config/
│   ├── packages/                # Configs Doctrine, JWT, CORS, sécurité...
│   ├── jwt/                     # Clés RSA pour JWT (à générer)
│   ├── bundles.php
│   ├── routes.yaml
│   └── services.yaml
├── migrations/                  # Migrations Doctrine
├── public/
│   ├── index.php               # Point d'entrée HTTP
│   └── uploads/                # Pièces jointes des DME
├── src/
│   ├── Controller/Api/         # Controllers REST
│   ├── DataFixtures/           # Données de démo
│   ├── Entity/                 # 14 entités Doctrine
│   ├── Enum/                   # UserRole, AppointmentStatus, etc.
│   ├── Repository/             # Repositories Doctrine
│   └── Service/                # Logique métier (Auth, Payment, SMS, ...)
├── tests/
│   ├── Unit/                   # Tests unitaires
│   └── Functional/             # Tests fonctionnels
├── composer.json
├── phpunit.xml.dist
└── README.md
```

## Sécurité

- **JWT** : authentification stateless, clés RSA 4096 bits
- **Rôles hiérarchiques** : COORDINATEUR > OPHTALMOLOGUE > TECHNICIEN/AGENT > PATIENT
- **Mots de passe** : hashage automatique (argon2id par défaut)
- **CORS** : restreint aux domaines `*.vanclinic.mg` et localhost
- **Validation** : contraintes Symfony Validator sur toutes les entités
- **Données médicales** : accès contrôlé par les rôles, chaque DME n'est consultable que par le patient concerné ou un soignant autorisé

## Internationalisation

L'API supporte le **français** et le **malagasy** (fr/mg) via le champ `preferredLanguage` des utilisateurs. Les contenus éducatifs sont disponibles dans les deux langues.

## Intégrations externes (Madagascar)

- **Mobile Money** : Orange Money, Airtel Money, Telma Mvola (mocked en dev, prêt pour la prod)
- **SMS** : Orange, Airtel, Telma
- **Email** : SMTP configurable (par défaut Mailpit en dev sur `localhost:1025`)

## Variables d'environnement clés

Voir `.env` pour la liste complète. Les principales :

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?serverVersion=15"
JWT_PASSPHRASE=<passphrase pour les clés RSA>
MAILER_DSN=smtp://localhost:1025
SMS_PROVIDER=orange
ORANGE_MONEY_MERCHANT_KEY=<clé marchand>
AIRTEL_MONEY_CLIENT_ID=<client id>
MVOLA_CONSUMER_KEY=<consumer key>
```

## Roadmap (post-MVP)

- Mode hors ligne pour les agents relais en zones sans connectivité
- Application mobile native (React Native ou Flutter) consommant cette API
- Synchronisation bidirectionnelle van ↔ cloud
- Intégration d'un module de dépistage assisté par IA
- Tableau de bord avancé avec heatmap des consultations par district

## Licence

Propriétaire — VanClinic SARL © 2025
