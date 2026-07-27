# Livrable — Lot 2 : Développement

**Projet** : VanClinic — Système de gestion de clinique ophtalmologique mobile  
**Lot** : Lot 2 — Développement  
**Date de livraison** : 1er juillet 2026  
**Statut** : ✅ Livré et déployé en préprod

---

## 1. Périmètre livré

Ce document atteste de la livraison du **Lot 2 — Développement**, dont le livrable contractuel est une **application web fonctionnelle**, conformément à la facture proforma.

### Étapes réalisées

| Étape | Statut | Description |
|---|---|---|
| Setup Git | ✅ Complété | Dépôt GitHub initialisé, branches et workflow définis |
| Développement backend | ✅ Complété | API REST Symfony 7 avec authentification JWT |
| Développement frontend | ✅ Complété | Application React/TypeScript multi-rôles |
| Intégration base de données | ✅ Complété | PostgreSQL avec migrations Doctrine |
| Tests fonctionnels | ✅ Complété | Comptes de démonstration opérationnels |
| Mise en place CI/CD | ✅ Complété | Pipeline automatisé GitHub Actions → Vercel + Render |

---

## 2. Application livrée

### 2.1 URLs de production

| Composant | URL |
|---|---|
| **Frontend (application web)** | `https://vanclinic-back.vercel.app` |
| **Backend (API REST)** | `https://perceptive-consideration-production-4024.up.railway.app` |
| **Healthcheck API** | `https://perceptive-consideration-production-4024.up.railway.app/api/health` |

### 2.2 Stack technique

| Couche | Technologie | Hébergement |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | Vercel |
| Backend | PHP 8.4 + Symfony 7 + API Platform | Render |
| Base de données | PostgreSQL 15 | Render (service dédié) |
| Authentification | JWT (LexikJWTAuthenticationBundle) | — |
| CI/CD | GitHub Actions | GitHub |
| Conteneurisation | Docker (multi-stage build) | Render |

---

## 3. Fonctionnalités développées

### Backend — API REST

- Authentification JWT (login, register, refresh)
- Gestion des utilisateurs multi-rôles
- Gestion des patients et dossiers médicaux
- Gestion des sessions de clinique mobile
- Catalogue produits (lunettes, verres, accessoires)
- Contenu éducatif multilingue (français / malgache)
- Migrations automatiques au démarrage
- Documentation API interactive (Swagger/OpenAPI)

### Frontend — Application web

- Interface de connexion avec comptes de démonstration
- Tableau de bord par rôle (Coordinateur, Ophtalmologue, Agent relais, Technicien, Patient)
- Gestion des rendez-vous et des consultations
- Interface de commande de produits optiques
- Contenu éducatif
- Responsive mobile

### Infrastructure & CI/CD

- Pipeline GitHub Actions déclenché à chaque push sur `main`
- Build frontend automatique → déploiement Vercel
- Build Docker multi-stage → déploiement Render
- Healthcheck nginx statique (`/api/health`)
- Génération automatique des clés JWT au démarrage

---

## 4. Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Coordinateur | `coordinateur@vanclinic.mg` | `Vanclinic2025!` |
| Ophtalmologue | `docteur@vanclinic.mg` | `Vanclinic2025!` |
| Agent relais | `agent@vanclinic.mg` | `Vanclinic2025!` |
| Technicien | `technicien@vanclinic.mg` | `Vanclinic2025!` |
| Patient | `patient@vanclinic.mg` | `Patient2025!` |

---

## 5. Dépôt de code source

| Élément | Détail |
|---|---|
| **Dépôt GitHub** | `https://github.com/ppxr23/vanclinic` |
| **Branche principale** | `main` |
| **Dernier commit** | `b63806d` — fix: pré-créer config/jwt avec droits www-data |

---

## 6. Validation

Ce livrable est fourni conformément aux termes de la facture proforma.
