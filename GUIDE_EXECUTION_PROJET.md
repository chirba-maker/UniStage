# 🚀 Guide de Réalisation Pas à Pas (du Début à la Fin) — Projet "UniStage"

Ce document est le **guide opérationnel complet** pour développer le projet **UniStage** de A à Z avec une base de données **MySQL via WampServer**. Suivez les étapes dans l'ordre pour garantir un développement fluide, sans blocage ni régression.

---

## 🛠️ PHASAGE GLOBAL DU PROJET

```
 PHASE 1 : Setup Environnement & Structure du Projet (WampServer)
   │
 PHASE 2 : Développement du Back-end (Spring Boot 3 + WampServer MySQL + JWT)
   │
 PHASE 3 : Développement du Front-end (Angular 17+ Standalone)
   │
 PHASE 4 : Intégration, Tests & Génération PDF / Mail
   │
 PHASE 5 : Déploiement & Mise en Production
```

---

## 📌 PHASE 1 : Préparation & Structure des Dossiers

### 1.1 Prérequis Logiciels
Assurez-vous d'avoir installé sur votre machine :
* **Java Development Kit (JDK 17 ou 21)**
* **Node.js (v20+)** et **npm**
* **Angular CLI v17+** (`npm install -g @angular/cli`)
* **WampServer (avec MySQL 8+ / phpMyAdmin)**
* **IDE** : IntelliJ IDEA (recommandé pour Spring) / VS Code

### 1.2 Configuration de WampServer
1. Demarrez **WampServer** (icône verte dans la barre des tâches).
2. Ouvrez **phpMyAdmin** via `http://localhost/phpmyadmin`.
3. Créez la base de données exécutant la commande SQL suivante ou via l'interface :
   ```sql
   CREATE DATABASE unistage_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. Note de connexion par défaut dans WampServer :
   - **Hôte** : `localhost`
   - **Port** : `3306` (ou `3308` selon la configuration Wamp)
   - **Utilisateur** : `root`
   - **Mot de passe** : `""` *(vide par défaut)* ou votre mot de passe configuré.

### 1.3 Structure du Workspace UniStage
Créez les deux sous-dossiers principaux dans votre workspace :
```
UnitStage/
├── unistage-backend/      # Application Spring Boot 3
├── unistage-frontend/     # Application Angular 17+
└── unistage_cahier_des_charges_ameliore.md
```

---

## 📌 PHASE 2 : Développement du Back-end (Spring Boot 3.2+ & WampServer MySQL)

### Étape 2.1 : Génération du projet Spring Boot
Utilisez [start.spring.io](https://start.spring.io) ou votre IDE avec les dépendances suivantes :
- **Developer Tools** : `Lombok`, `Spring Boot DevTools`
- **Web** : `Spring Web`
- **Security** : `Spring Security`
- **SQL** : `Spring Data JPA`, `MySQL Driver` (`mysql-connector-j`), `Flyway Migration`
- **Validation** : `Validation` (`Hibernate Validator`)
- **Mail** : `Java Mail Sender`

### Étape 2.2 : Configuration de la Base de Données (`application.yml`)
Configurez `src/main/resources/application.yml` pour WampServer :
```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/unistage_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root
    password: "" # Mot de passe vide par défaut sous WampServer (sinon indiquez votre mot de passe)
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    database-platform: org.hibernate.dialect.MySQLDialect
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        format_sql: true
  flyway:
    enabled: true
    locations: classpath:db/migration

jwt:
  secret: 404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
  access-token-expiration-ms: 900000     # 15 min
  refresh-token-expiration-ms: 604800000 # 7 jours

file:
  upload-dir: ./uploads
```

### Étape 2.3 : Script Flyway pour WampServer / MySQL (`src/main/resources/db/migration/V1__init_schema.sql`)
Créez le script d'initialisation (exécutable aussi directement dans phpMyAdmin) :
```sql
-- MySQL 8.0 / WampServer Schema Initialisation pour UniStage

-- Table Utilisateurs (Base Auth)
CREATE TABLE IF NOT EXISTS utilisateurs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(180) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM('ROLE_ETUDIANT', 'ROLE_ENTREPRISE', 'ROLE_TUTEUR', 'ROLE_ADMIN') NOT NULL,
    actif BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table Étudiants
CREATE TABLE IF NOT EXISTS etudiants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id BIGINT NOT NULL UNIQUE,
    matricule VARCHAR(50) NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    filiere VARCHAR(100) NOT NULL,
    niveau VARCHAR(50) NOT NULL,
    cv_url VARCHAR(255),
    CONSTRAINT fk_etudiant_user FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table Entreprises
CREATE TABLE IF NOT EXISTS entreprises (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id BIGINT NOT NULL UNIQUE,
    nom_entreprise VARCHAR(150) NOT NULL,
    rccm_nif VARCHAR(50),
    secteur_activite VARCHAR(100) NOT NULL,
    adresse TEXT NOT NULL,
    telephone VARCHAR(30) NOT NULL,
    logo_url VARCHAR(255),
    est_validee BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_entreprise_user FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table Tuteurs Académiques
CREATE TABLE IF NOT EXISTS tuteurs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id BIGINT NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    departement VARCHAR(100) NOT NULL,
    CONSTRAINT fk_tuteur_user FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table Offres de Stage
CREATE TABLE IF NOT EXISTS offres_stage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entreprise_id BIGINT NOT NULL,
    titre VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    lieu VARCHAR(100) NOT NULL,
    duree_mois INT NOT NULL CHECK (duree_mois > 0),
    gratification DECIMAL(10,2) DEFAULT 0.00,
    statut ENUM('EN_ATTENTE_MODERATION', 'PUBLIEE', 'CLOTUREE', 'REJETEE') DEFAULT 'EN_ATTENTE_MODERATION',
    date_publication DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_offre_entreprise FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE,
    INDEX idx_offres_slug (slug),
    INDEX idx_offres_statut (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table Candidatures
CREATE TABLE IF NOT EXISTS candidatures (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    etudiant_id BIGINT NOT NULL,
    offre_id BIGINT NOT NULL,
    lettre_motivation TEXT,
    statut ENUM('SOUMISE', 'EN_EXAMEN', 'ENTRETIEN', 'RETENUE', 'REFUSEE') DEFAULT 'SOUMISE',
    date_candidature DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_candidature_etudiant FOREIGN KEY (etudiant_id) REFERENCES etudiants(id) ON DELETE CASCADE,
    CONSTRAINT fk_candidature_offre FOREIGN KEY (offre_id) REFERENCES offres_stage(id) ON DELETE CASCADE,
    CONSTRAINT unique_candidature_etudiant_offre UNIQUE (etudiant_id, offre_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table Conventions de Stage
CREATE TABLE IF NOT EXISTS conventions_stage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidature_id BIGINT NOT NULL UNIQUE,
    tuteur_id BIGINT,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    missions TEXT NOT NULL,
    statut_validation ENUM('BROUILLON', 'SOUMISE', 'VALIDEE_ENTREPRISE', 'VALIDEE_TUTEUR', 'SIGNEE_FINALE', 'REJETEE') DEFAULT 'BROUILLON',
    pdf_url VARCHAR(255),
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_convention_candidature FOREIGN KEY (candidature_id) REFERENCES candidatures(id) ON DELETE CASCADE,
    CONSTRAINT fk_convention_tuteur FOREIGN KEY (tuteur_id) REFERENCES tuteurs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id BIGINT NOT NULL,
    titre VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    lue BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Étape 2.4 : Architecture des Packages Java
Organisez le code dans `src/main/java/gn/univlabe/unistage/` :
```
gn.univlabe.unistage/
├── config/             # SecurityConfig, CorsConfig, SwaggerConfig
├── security/           # JwtTokenProvider, JwtAuthFilter, UserDetailsService
├── domain/
│   ├── entities/       # User, Etudiant, Entreprise, Offre, Candidature, Convention
│   └── enums/          # RoleEnum, StatutOffre, StatutCandidature, StatutConvention
├── dto/                # AuthRequest, RegisterStudentDto, OfferDto, ApplicationDto
├── repository/         # UserRepository, StudentRepository, OfferRepository, etc.
├── service/            # AuthService, OfferService, ApplicationService, FileStorageService
└── web/                # AuthController, OfferController, ApplicationController
```

### Étape 2.5 : Implémentation de la Sécurité JWT (Spring Security 6)
1. **`JwtTokenProvider.java`** : Méthodes `generateAccessToken()`, `generateRefreshToken()`, `validateToken()`, `extractEmail()`.
2. **`JwtAuthenticationFilter.java`** : Intercepte les requêtes `Bearer <token>` et définit le contexte de sécurité.
3. **`SecurityConfig.java`** :
   ```java
   @Bean
   public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
       return http
           .csrf(AbstractHttpConfigurer::disable)
           .cors(Customizer.withDefaults())
           .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
           .authorizeHttpRequests(auth -> auth
               .requestMatchers("/api/auth/**", "/swagger-ui/**", "/v3/api-docs/**", "/api/offres/public/**").permitAll()
               .requestMatchers("/api/admin/**").hasRole("ADMIN")
               .requestMatchers("/api/entreprise/**").hasRole("ENTREPRISE")
               .requestMatchers("/api/etudiant/**").hasRole("ETUDIANT")
               .anyRequest().authenticated()
           )
           .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
           .build();
   }
   ```

### Étape 2.6 : Implémentation des Services Métier & Contrôleurs REST
* **`AuthService`** : Inscription étudiant/entreprise, Login, Génération des tokens.
* **`OfferService`** : Recherche filtrée d'offres (avec `Specification`), CRUD offre, validation par Admin.
* **`ApplicationService`** : Postulation avec contrainte d'unicité, changement de statut candidature.
* **`FileStorageService`** : Sauvegarde des CVs en vérifiant les octets magiques `%PDF-`.

---

## 📌 PHASE 3 : Développement du Front-end (Angular 17+ Standalone)

### Étape 3.1 : Création du projet Angular
Dans le terminal (dossier racine) :
```bash
ng new unistage-frontend --standalone --routing --style=scss
cd unistage-frontend
npm install @ngneat/hot-toast lucide-angular
```

### Étape 3.2 : Intégration de Tailwind CSS / Material
Installez Tailwind CSS :
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
Configurez `tailwind.config.js` et ajoutez les directives dans `src/styles.scss` :
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Étape 3.3 : Structure des Fichiers Angular
```
src/app/
├── core/
│   ├── guards/         # auth.guard.ts, role.guard.ts
│   ├── interceptors/   # jwt.interceptor.ts, error.interceptor.ts
│   ├── models/         # user.model.ts, offer.model.ts, application.model.ts
│   └── services/       # auth.service.ts, offer.service.ts, application.service.ts
├── shared/
│   ├── components/     # navbar, footer, skeleton-loader, pdf-viewer
│   └── pipes/          # status-badge.pipe.ts
└── features/
    ├── auth/           # login, register-student, register-company
    ├── landing/        # landing-page (public)
    ├── student/        # student-dashboard, offer-search, my-applications
    ├── company/        # company-dashboard, create-offer, manage-applicants
    └── admin/          # admin-dashboard, moderate-companies, moderate-offers
```

### Étape 3.4 : Intercepteurs & Guards
1. **`jwt.interceptor.ts`** :
   ```typescript
   export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
     const token = inject(AuthService).getToken();
     if (token) {
       req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
     }
     return next(req);
   };
   ```
2. **`error.interceptor.ts`** : Attrape les erreurs `401`/`403`/`500` et affiche un toast d'erreur via `@ngneat/hot-toast`.
3. **`role.guard.ts`** : Vérifie si le rôle de l'utilisateur connecté correspond à la route ciblée.

### Étape 3.5 : Création des Vues Utilisateur
1. **Landing Page & Catalogue Public** :
   - Recherche rapide par mots-clés et secteur.
   - Utilisation de `@defer (on viewport)` pour le chargement paresseux des sections statistiques.
2. **Espace Étudiant** :
   - Profil & Drag-and-Drop upload du CV.
   - Liste des offres avec bouton "Postuler en 1-click".
   - Tableau de bord des candidatures avec badges couleur selon le statut (`SOUMISE`, `ENTRETIEN`, `RETENUE`).
3. **Espace Recruteur (Entreprise)** :
   - Formulaire réactif de création d'offre.
   - Visualisation des candidats avec aperçu PDF intégrable du CV.

---

## 📌 PHASE 4 : Intégration, Génération PDF & Email

### Étape 4.1 : Service de Génération PDF (Spring Boot)
Implémentez `ConventionPdfService.java` avec **OpenPDF** :
```java
public byte[] generateConventionPdf(ConventionStage convention) {
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    Document document = new Document(PageSize.A4);
    PdfWriter.getInstance(document, out);
    document.open();
    
    // Titre & En-tête Université de Labé
    document.add(new Paragraph("UNIVERSITÉ DE LABÉ - CONVENTION DE STAGE", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16)));
    document.add(new Paragraph("Étudiant: " + convention.getCandidature().getEtudiant().getNom()));
    document.add(new Paragraph("Entreprise: " + convention.getCandidature().getOffre().getEntreprise().getNomEntreprise()));
    document.add(new Paragraph("Missions: " + convention.getMissions()));
    
    document.close();
    return out.toByteArray();
}
```

### Étape 4.2 : Service d'Envoi d'Email Transactionnel
Implémentez `EmailSenderService.java` pour envoyer automatiquement un e-mail avec la convention PDF en pièce jointe dès la validation finale par les 3 parties.

---

## 📌 PHASE 5 : Lancement & Tests avec WampServer

### Étape 5.1 : Démarrage du Projet
1. Assurez-vous que l'icône de **WampServer** est **VERTE**.
2. Lancez le Backend Spring Boot (via IntelliJ / VS Code ou `mvn spring-boot:run`).
3. Lancez le Frontend Angular (`ng serve`).

* **Application Web Front-end** : `http://localhost:4200`
* **API REST Back-end** : `http://localhost:8080/api`
* **Console phpMyAdmin** : `http://localhost/phpmyadmin`
* **Documentation Swagger** : `http://localhost:8080/swagger-ui.html`

---

## 🎯 CHECKLIST DE VALIDATION FINALE DU PROJET

- [ ] WampServer est démarré et la base `unistage_db` est créée sous phpMyAdmin.
- [ ] Les tables MySQL sont créées et migrées via Flyway à l'allumage du backend.
- [ ] L'inscription Étudiant et Entreprise fonctionne avec hashage des mots de passe.
- [ ] La connexion JWT délivre un Access Token et un Refresh Token.
- [ ] Le rôle Admin peut valider une entreprise et approuver une offre.
- [ ] Un étudiant peut uploader son CV (PDF uniquement) et postuler à une offre.
- [ ] L'entreprise voit les candidats et peut faire passer le statut à `RETENUE`.
- [ ] La convention de stage PDF est générée automatiquement et envoyée par e-mail.
