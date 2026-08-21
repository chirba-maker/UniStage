-- =============================================================================
-- Script Flyway Migration V1__init_schema.sql — UniStage
-- Base de données MySQL 8.0+ (WampServer)
-- Optimization : Indexations avancées pour la recherche et les performances
-- =============================================================================

SET NAMES utf8mb4;
ALTER DATABASE unistage_db CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 1. Table Utilisateurs (Authentification & RBAC)
CREATE TABLE IF NOT EXISTS utilisateurs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(180) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM('ROLE_ETUDIANT', 'ROLE_ENTREPRISE', 'ROLE_TUTEUR', 'ROLE_ADMIN') NOT NULL,
    actif BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_actif (actif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table Étudiants
CREATE TABLE IF NOT EXISTS etudiants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id BIGINT NOT NULL UNIQUE,
    matricule VARCHAR(50) NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    filiere VARCHAR(100) NOT NULL,
    niveau VARCHAR(50) NOT NULL,
    cv_url VARCHAR(255),
    CONSTRAINT fk_etudiant_user FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    INDEX idx_etudiants_matricule (matricule),
    INDEX idx_etudiants_nom_prenom (nom, prenom),
    INDEX idx_etudiants_filiere (filiere),
    INDEX idx_etudiants_niveau (niveau)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table Entreprises
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
    CONSTRAINT fk_entreprise_user FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    INDEX idx_entreprises_nom (nom_entreprise),
    INDEX idx_entreprises_secteur (secteur_activite),
    INDEX idx_entreprises_validee (est_validee)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table Tuteurs Académiques
CREATE TABLE IF NOT EXISTS tuteurs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id BIGINT NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    departement VARCHAR(100) NOT NULL,
    CONSTRAINT fk_tuteur_user FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    INDEX idx_tuteurs_nom_prenom (nom, prenom),
    INDEX idx_tuteurs_departement (departement)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table Offres de Stage
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
    INDEX idx_offres_statut (statut),
    INDEX idx_offres_entreprise (entreprise_id),
    INDEX idx_offres_lieu (lieu),
    INDEX idx_offres_statut_date (statut, date_publication),
    FULLTEXT INDEX idx_offres_fulltext (titre, description, lieu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Table Candidatures
CREATE TABLE IF NOT EXISTS candidatures (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    etudiant_id BIGINT NOT NULL,
    offre_id BIGINT NOT NULL,
    lettre_motivation TEXT,
    cv_url VARCHAR(255),
    statut ENUM('SOUMISE', 'EN_EXAMEN', 'ENTRETIEN', 'RETENUE', 'REFUSEE') DEFAULT 'SOUMISE',
    date_candidature DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_candidature_etudiant FOREIGN KEY (etudiant_id) REFERENCES etudiants(id) ON DELETE CASCADE,
    CONSTRAINT fk_candidature_offre FOREIGN KEY (offre_id) REFERENCES offres_stage(id) ON DELETE CASCADE,
    CONSTRAINT unique_candidature_etudiant_offre UNIQUE (etudiant_id, offre_id),
    INDEX idx_candidatures_etudiant (etudiant_id),
    INDEX idx_candidatures_offre (offre_id),
    INDEX idx_candidatures_statut (statut),
    INDEX idx_candidatures_etudiant_statut (etudiant_id, statut),
    INDEX idx_candidatures_date (date_candidature)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Table Conventions de Stage
CREATE TABLE IF NOT EXISTS conventions_stage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidature_id BIGINT NOT NULL UNIQUE,
    tuteur_id BIGINT,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    missions TEXT NOT NULL,
    gratification DECIMAL(10,2) DEFAULT 0.00,
    statut_validation ENUM('BROUILLON', 'SOUMISE', 'VALIDEE_ENTREPRISE', 'VALIDEE_TUTEUR', 'SIGNEE_FINALE', 'REJETEE') DEFAULT 'BROUILLON',
    pdf_url VARCHAR(255),
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_convention_candidature FOREIGN KEY (candidature_id) REFERENCES candidatures(id) ON DELETE CASCADE,
    CONSTRAINT fk_convention_tuteur FOREIGN KEY (tuteur_id) REFERENCES tuteurs(id) ON DELETE SET NULL,
    INDEX idx_conventions_candidature (candidature_id),
    INDEX idx_conventions_tuteur (tuteur_id),
    INDEX idx_conventions_statut (statut_validation),
    INDEX idx_conventions_dates (date_debut, date_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Table Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id BIGINT NOT NULL,
    titre VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    lue BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (utilisateur_id),
    INDEX idx_notifications_user_lue (utilisateur_id, lue),
    INDEX idx_notifications_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
