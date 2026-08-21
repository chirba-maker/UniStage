# 🎓 UniStage — Système Intégré de Gestion des Stages Académiques
> **Université de Labé (République de Guinée 🇬🇳)**  
> *Plateforme Web Fullstack pour la gestion collaborative, le suivi pédagogique et la dématérialisation tripartite des conventions de stage.*

---

## 📑 Sommaire
1. [Présentation Générale](#-présentation-générale)
2. [Critères d'Évaluation & Livrables](#-critères-dévaluation--livrables)
3. [Architecture Technique & Stack](#-architecture-technique--stack)
4. [Base de Données & Scripts SQL Inclus](#-base-de-données--scripts-sql-inclus)
5. [Fonctionnement Complet de l'Authentification (De A à Z)](#-fonctionnement-complet-de-lauthentification-de-a-à-z)
6. [Workflow & Fonctionnalités Métier](#-workflow--fonctionnalités-métier)
7. [Documentation de l'API REST (Swagger)](#-documentation-de-lapi-rest-swagger)
8. [Guide de Démarrage & Déploiement](#-guide-de-démarrage--déploiement)
   - [Option A : Déploiement Conteneurisé (Docker Compose)](#option-a--déploiement-conteneurisé-docker-compose-recommandé)
   - [Option B : Lancement Local (Développement)](#option-b--lancement-local-développement)
9. [Comptes de Démonstration & Identifiants](#-comptes-de-démonstration--identifiants)
10. [Stratégie Git & Convention des Commits](#-stratégie-git--convention-des-commits)
11. [Tests & Validation Automatisée](#-tests--validation-automatisée)

---

## 🔐 Fonctionnement Complet de l'Authentification (De A à Z)

Le système d'authentification et de sécurité d'**UniStage** repose sur l'architecture **Stateless JWT (JSON Web Token)** avec chiffrement fort **BCrypt** et contrôle d'accès basé sur les rôles (**RBAC**).

### 📊 Schéma Global du Flux d'Authentification

```
[ UTILISATEUR / FRONTEND ]                                    [ BACKEND SPRING BOOT ]                              [ BASE DE DONNÉES ]
            │                                                           │                                                    │
 1. Formulaire Login (email, password) ───────────────────────────────>│ 2. Authenticate()                                  │
            │                                                           │    Vérification Hachage BCrypt ───────────────────>│
            │                                                           │    <── User Found & Valid ─────────────────────────│
            │                                                           │ 3. Génération JWT (Access + Refresh)               │
            │<── AuthResponse 200 OK (accessToken, refreshToken, user) ─│                                                    │
 4. Stockage localStorage (access_token, user_data)                     │                                                    │
            │                                                           │                                                    │
 5. Requête API avec Header Authorization: Bearer <token> ─────────────>│ 6. JwtAuthenticationFilter                         │
            │                                                           │    - Validation Signature SHA-256                  │
            │                                                           │    - Vérification Date Expiration                  │
            │                                                           │    - Extraction Rôle & Depose SecurityContext      │
            │                                                           │ 7. Evaluation @PreAuthorize("hasRole(...)")         │
            │<── Data 200 OK / 403 Forbidden ───────────────────────────│                                                    │
            │                                                           │                                                    │
 8. [Si Token Expiré] Intercepteur reçoit 401 ─────────────────────────>│ 9. POST /api/auth/refresh-token                    │
            │                                                           │    Vérification Refresh Token & Nouveau JWT        │
            │<── Nouveau Access Token 200 OK ───────────────────────────│                                                    │
```

---

### 🔍 DÉTAIL DES ÉTAPES DE A À Z

#### 1. Inscription (Registration)
- **Endpoints** : `POST /api/auth/register/etudiant` | `POST /api/auth/register/entreprise`
- **Déroulement** :
  1. L'utilisateur remplit le formulaire d'inscription (Étudiant ou Entreprise).
  2. Le backend vérifie l'unicité de l'adresse email et du matricule/identifiant.
  3. Le mot de passe en clair est haché avec **BCryptPasswordEncoder** (coût 10) avant d'être sauvegardé.
  4. L'utilisateur reçoit son rôle exact : `ROLE_ETUDIANT`, `ROLE_ENTREPRISE`, `ROLE_TUTEUR` ou `ROLE_ADMIN`.

#### 2. Connexion & Émission des Jetons (Login)
- **Endpoint** : `POST /api/auth/login` (Body : `{ "email": "...", "password": "..." }`)
- **Déroulement** :
  1. **Spring Security AuthenticationManager** compare le mot de passe soumis avec le hash BCrypt en base de données.
  2. En cas de succès, **`JwtTokenProvider`** génère deux jetons signés cryptographiquement en **HMAC-SHA256** (utilisant `APP_JWT_SECRET`) :
     - **`accessToken`** : Jeton à courte durée de vie (ex: 24h), contenant le rôle et l'identifiant de l'utilisateur.
     - **`refreshToken`** : Jeton à plus longue durée de vie (ex: 7 jours) permettant le renouvellement transparent.
  3. Le serveur retourne un objet `AuthResponse` contenant l'Access Token, le Refresh Token, le rôle et les informations de profil.

#### 3. Stockage & Interception HTTP Côté Frontend (Angular)
- **Stockage local** : L'application Angular enregistre `access_token`, `refresh_token` et `user_data` dans le `localStorage` du navigateur.
- **Intercepteur JWT (`JwtInterceptor`)** :
  - Pour chaque requête HTTP sortante vers l'API, l'intercepteur Angular injecte automatiquement l'en-tête HTTP :
    ```http
    Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
    ```
- **Guards de Navigation Angular (`AuthGuard` & `RoleGuard`)** :
  - Empêchent l'accès aux pages réservées si l'utilisateur n'est pas connecté ou ne possède pas le rôle requis (ex: tableau de bord Admin).

#### 4. Validation du Jeton & Contexte de Sécurité (Backend Spring Boot)
- **Filtre `JwtAuthenticationFilter`** :
  - Intercepte chaque requête entrante côté serveur.
  - Vérifie la validité de la signature du token JWT et sa date d'expiration.
  - Extrait l'email et les autorités (ex: `ROLE_ADMIN`).
  - Dépose l'utilisateur authentifié dans le `SecurityContextHolder` de Spring Security pour le thread courant.

#### 5. Contrôle d'Accès Fins basé sur les Rôles (RBAC)
- Les endpoints de l'API sont protégés par l'annotation `@PreAuthorize` :
  - `@PreAuthorize("hasRole('ROLE_ETUDIANT')")` : Seul l'étudiant peut soumettre une candidature.
  - `@PreAuthorize("hasRole('ROLE_ENTREPRISE')")` : Seule l'entreprise concernée peut signer sa section de convention.
  - `@PreAuthorize("hasRole('ROLE_TUTEUR')")` : Seul le tuteur assigné peut effectuer la validation pédagogique.
  - `@PreAuthorize("hasRole('ROLE_ADMIN')")` : Accès aux statistiques et validation finale.

#### 6. Renouvellement de Session (Refresh Token Rotation)
- Si l'Access Token expire au cours d'une session, le backend retourne un code HTTP `401 Unauthorized`.
- L'intercepteur Angular capture cette erreur `401`, appelle silencieusement `POST /api/auth/refresh-token` pour obtenir un nouvel Access Token, puis rejoue la requête initiale de manière totalement transparente pour l'utilisateur.

#### 7. Déconnexion (Logout)
- L'action de déconnexion efface instantanément `access_token`, `refresh_token` et `user_data` du `localStorage`.
- L'état réactif de l'utilisateur est réinitialisé et une redirection automatique est effectuée vers la page de connexion (`/login`).

---

## 🌟 Présentation Générale

**UniStage** est une solution numérique conçue pour moderniser et fluidifier la transition académique-professionnelle à l'Université de Labé. Elle réunit au sein d'un portail unique :
- Les **Étudiants** en recherche de stage de perfectionnement ou de fin d'études.
- Les **Entreprises Partenaires** souhaitant recruter des talents et publier des opportunités.
- Les **Tuteurs Académiques / Enseignants** responsables du suivi pédagogique et de la validation des stages.
- L'**Administration Universitaire** assurant le pilotage global, la conformité légale et les statistiques d'insertion.

---

## 📋 Critères d'Évaluation & Livrables

### 1. 🏗️ Qualité du Code (Principes SOLID & Clean Code)
- **S — Single Responsibility Principle** : Découpage granulaire des services (`AuthService`, `OffreStageService`, `CandidatureService`, `ConventionStageService`, `NotificationService`, `PdfGeneratorService`, `FileStorageService`). Chaque composant et service ne gère qu'une seule responsabilité métier.
- **O — Open/Closed Principle** : Découplage strict entre entités de persistance JPA et DTOs de transfert via **MapStruct**. Architecture extensible sans modification du code existant.
- **L — Liskov Substitution Principle** : Utilisation d'interfaces et contrats pour les services et repositories, assurant une substituabilité transparente.
- **I — Interface Segregation Principle** : Interfaces fines et ciblées (ex: `UserDetailsService`, contrats JPA Spring Data).
- **D — Dependency Inversion Principle** : Injection de dépendances systématique par constructeur (`@RequiredArgsConstructor` via Lombok côté Spring Boot et `inject()` côté Angular).
- **Clean Code & Robustesse** :
  - Gestionnaire d'erreurs global centralisé via `@RestControllerAdvice` ([`GlobalExceptionHandler.java`](file:///c:/Users/Mamadou%20Bassirou%20Dia/Downloads/Compressed/UniStage-main/unistage-backend/src/main/java/gn/univlabe/unistage/service/impl/GlobalExceptionHandler.java)).
  - Validation déclarative des données entrantes (`@Valid`, Bean Validation).
  - Typage strict TypeScript, RxJS et Angular Signals.

---

### 2. 📚 Documentation API (Swagger UI / OpenAPI 3)
La documentation interactive de l'API est directement accessible et prête à l'emploi :
- **Swagger UI** : [`http://localhost:8080/swagger-ui.html`](http://localhost:8080/swagger-ui.html)
- **Spécification OpenAPI JSON** : [`http://localhost:8080/v3/api-docs`](http://localhost:8080/v3/api-docs)

> **🔐 Authentification JWT dans Swagger UI** :
> 1. Cliquez sur le bouton **Authorize 🔓** (en haut à droite).
> 2. Entrez votre token JWT obtenu via l'endpoint `POST /api/auth/login`.
> 3. Toutes vos requêtes Swagger incluront automatiquement l'en-tête `Authorization: Bearer <token>`.

---

### 3. ⚡ Réactivité & Performance (Score Lighthouse > 80)
L'interface frontend Angular garantit un score **Lighthouse > 80** sur **Mobile et Desktop** :
- **Performance Web** :
  - Chargement optimisé des polices Google Fonts via `preconnect` et `display=swap`.
  - CSS critique inliné dans [`index.html`](file:///c:/Users/Mamadou%20Bassirou%20Dia/Downloads/Compressed/UniStage-main/unistage-frontend/src/index.html) pour éliminer le blocage du rendu.
  - Lazy loading des routes Angular et compression Nginx.
- **Accessibilité (a11y)** :
  - Balisage sémantique HTML5 (`<header>`, `<nav>`, `<main>`, `<footer>`, `<h1>`-`<h6>`).
  - Contraste des couleurs conforme aux normes **WCAG AA** (> 4.5:1).
  - Présence des attributs `aria-label`, `aria-expanded` et `role` sur tous les éléments interactifs.
- **SEO & Bonnes Pratiques** :
  - Balises `<meta viewport>`, `<meta name="theme-color">`, métadonnées Open Graph complètes et `rel="noopener noreferrer"` sur les liens externes.
  - Design responsive adapté de **360px** (mobiles) à **1440px+** (écrans ultra-larges).

---

### 4. 🌿 Gestion de Version (Feature Branching & Conventional Commits)
Le projet respecte rigoureusement la méthodologie de **Feature Branching** :
- `main` : Branche de production stable.
- `develop` : Branche d'intégration des développements.
- `feat/*` : Branches fonctionnelles dédiées (ex: `feat/swagger-api-docs`, `feat/lighthouse-optimizations`, `feat/convention-workflow`).
- `fix/*` : Branches de correction de bugs.

**Format des messages de commit :**
```text
<type>(<scope>): <description concise à l'impératif>

Types : feat | fix | docs | style | refactor | perf | test | chore
Exemple : feat(auth): add JWT refresh token rotation mechanism
```

---

## 🛠️ Architecture Technique & Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    UNISTAGE FRONTEND                        │
│       Angular 17+ · Standalone Components · Signals         │
│          Bootstrap 5 · Glassmorphism · Chart.js             │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST / JSON (JWT)
┌──────────────────────────────▼──────────────────────────────┐
│                    UNISTAGE BACKEND                         │
│   Spring Boot 3.2+ · Spring Security 6 · Spring Data JPA    │
│    OpenPDF · Lombok · MapStruct · Springdoc OpenAPI 3       │
└──────────────────────────────┬──────────────────────────────┘
                               │ JDBC (Port 3306)
┌──────────────────────────────▼──────────────────────────────┐
│                  BASE DE DONNÉES MYSQL 8                    │
│            Schéma relationnel unistage_db                   │
└─────────────────────────────────────────────────────────────┘
```

| Couche | Technologies & Outils |
|---|---|
| **Frontend** | Angular 17.3, TypeScript 5.4, RxJS 7.8, Bootstrap 5.3, Bootstrap Icons, Chart.js |
| **Backend** | Java 17, Spring Boot 3.2.3, Spring Security 6, JJWT 0.12.5, OpenPDF 1.3.30, Springdoc OpenAPI 2.3.0 |
| **Base de Données** | MySQL 8.0 / MariaDB 10.6+ |
| **Conteneurisation** | Docker, Docker Compose, Nginx Alpine |

---

## 🗄️ Base de Données & Scripts SQL Inclus

La base de données relationnelle du projet **UniStage** (`unistage_db`) est intégralement fournie et versionnée au sein du projet.

### 📦 Fichiers SQL disponibles à la racine :

1. **[`unistage_db.sql`](file:///c:/Users/Mamadou%20Bassirou%20DIA/Downloads/Compressed/UniStage-main/unistage_db.sql)** :
   - Script SQL complet et autonome (Schéma + Contraintes FK + Indexation + Jeux de données de démonstration complets).
   - Intégré au démarrage automatique du conteneur MySQL dans `docker-compose.yml` (via `/docker-entrypoint-initdb.d/01-init.sql`).
2. **`unistage-backend/src/main/resources/db/migration/`** :
   - **`V1__init_schema.sql`** : Création des tables fondamentales (`utilisateurs`, `etudiants`, `entreprises`, `tuteurs`, `offres_stage`, `candidatures`, `conventions_stage`, `notifications`).
   - **`V2__seed_data.sql`** : Données initiales de test (Comptes Admin, Étudiants, Entreprises, Tuteurs, Offres, Candidatures, Conventions).
   - **`V3__audit_and_evaluations.sql`** : Tables d'Audit Trail (`audit_conventions`), des Rapports de Stage (`rapports_stage`) et d'Évaluations des Tuteurs (`evaluations_tuteur`).
   - **`V4__add_user_profile_fields.sql`** : Champs de profil complémentaires (`nom_complet`, `organisation`).

### ⚡ Importation Manuelle (si hors Docker) :

Si vous utilisez MySQL / WampServer / XAMPP / phpMyAdmin directement en local :

```bash
# Via la ligne de commande MySQL :
mysql -u root -p < unistage_db.sql
```
Ou importez simplement le fichier [`unistage_db.sql`](file:///c:/Users/Mamadou%20Bassirou%20DIA/Downloads/Compressed/UniStage-main/unistage_db.sql) depuis l'interface **phpMyAdmin**.

---

## 🔄 Workflow & Fonctionnalités Métier

### Le Cycle de Vie Tripartite de la Convention de Stage
```
[1. ÉTUDIANT]         [2. ENTREPRISE]         [3. TUTEUR]         [4. ADMIN]
Postule & Accepte  -> Signe Entreprise     -> Valide Pédagogie -> Validation Finale & PDF
(BROUILLON)           (SIGNEE_ENTREPRISE)     (VALIDEE_TUTEUR)    (VALIDEE_ADMIN)
```

1. **Candidature acceptée** : L'étudiant sélectionné génère automatiquement un projet de convention.
2. **Signature Entreprise** : L'entreprise renseigne les modalités pratiques (dates, tuteur industriel, gratification) et appose sa signature.
3. **Validation Pédagogique** : Le tuteur enseignant de l'Université vérifie les missions et valide la convention.
4. **Validation Finale & Édition PDF** : L'administration valide la convention, ce qui génère le document officiel tripartite PDF sécurisé téléchargeable par toutes les parties.

---

## 📡 Documentation de l'API REST (Swagger)

### Principaux Endpoints :
| Méthode | Endpoint | Description | Rôles Autorisés |
|---|---|---|---|
| `POST` | `/api/auth/login` | Connexion et émission des tokens JWT (Access & Refresh) | Public |
| `POST` | `/api/auth/register/etudiant` | Inscription d'un nouvel étudiant | Public |
| `POST` | `/api/auth/register/entreprise` | Inscription d'un compte entreprise | Public |
| `POST` | `/api/auth/refresh-token` | Renouvellement de l'Access Token | Public |
| `GET` | `/api/offres` | Liste paginée et filtrée des offres de stage | Public |
| `POST` | `/api/offres` | Publication d'une nouvelle offre de stage | Entreprise |
| `POST` | `/api/candidatures` | Dépôt de candidature avec CV et lettre de motivation | Étudiant |
| `GET` | `/api/conventions` | Liste des conventions associées à l'utilisateur | Tous connectés |
| `PATCH` | `/api/conventions/{id}/signer-entreprise` | Signature de la convention par l'entreprise | Entreprise |
| `PATCH` | `/api/conventions/{id}/valider-tuteur` | Validation pédagogique par le tuteur | Tuteur |
| `PATCH` | `/api/conventions/{id}/valider-admin` | Validation définitive et génération PDF | Admin |
| `GET` | `/api/conventions/{id}/pdf` | Téléchargement de la convention tripartite PDF | Tous signataires |
| `GET` | `/api/admin/statistiques` | Tableau de bord et statistiques globales d'activité | Admin |

---

## 🚀 Guide de Démarrage & Déploiement

### Option A : Déploiement Conteneurisé (Docker Compose - Recommandé)
Lance l'ensemble de la pile (MySQL + Backend Spring Boot + Frontend Angular Nginx) en une seule commande :

```bash
docker-compose up -d --build
```

- **Frontend Web** : [`http://localhost:4200`](http://localhost:4200) ou [`http://localhost`](http://localhost)
- **Backend API** : [`http://localhost:8080`](http://localhost:8080)
- **Documentation Swagger** : [`http://localhost:8080/swagger-ui.html`](http://localhost:8080/swagger-ui.html)
- **Base de Données MySQL** : `localhost:3306`

---

### Option B : Lancement Local (Développement)

#### 1. Prérequis
- Java JDK 17+
- Node.js 18+ & npm 9+
- Serveur MySQL en local (port 3306)

#### 2. Démarrage du Backend
```bash
cd unistage-backend
mvn clean spring-boot:run
```

#### 3. Démarrage du Frontend
```bash
cd unistage-frontend
npm install
npm start
```
L'application s'ouvrira automatiquement sur [`http://localhost:4200`](http://localhost:4200).

---

## 👥 Comptes de Démonstration & Identifiants

> **Mot de passe universel de test :** `password123`

| Rôle | Adresse Email | Droits & Accès |
|---|---|---|
| **Administrateur** | `admin@univ-labe.edu.gn` | Supervision complète, validation finale des conventions, gestion des utilisateurs et stats |
| **Étudiant** | `mamadou.barry@etud.univ-labe.edu.gn` | Recherche d'offres, postulation, suivi des candidatures et signature de convention |
| **Entreprise** | `contact@sotelgui.gn` | Dépôt d'offres de stage, examen des candidatures, signature des conventions |
| **Tuteur Académique** | `prof.diallo@univ-labe.edu.gn` | Suivi pédagogique des étudiants assignés, validation des conventions |

---

## 🧪 Tests & Validation Automatisée

Des scripts automatisés de test sont inclus à la racine du projet pour valider l'intégrité de l'API et le workflow complet :

```bash
# 1. Tester le cycle de vie complet de la convention de stage
node test-convention-workflow.js

# 2. Tester l'ensemble du système de notifications temps réel
node test-all-notifs.js
```

---

## 🏛️ Informations Institutionnelles
- **Institution** : Université de Labé, République de Guinée 🇬🇳
- **Département** : Informatique & Télécommunications
- **Licence** : Apache 2.0
