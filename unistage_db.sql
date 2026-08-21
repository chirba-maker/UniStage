-- =============================================================================
-- Base de Données UniStage — Université de Labé 🇬🇳
-- Full Dump SQL (Schéma, Contraintes, Index & Jeu de Données de Démonstration)
-- Compatible MySQL 8.0+ / MariaDB 10.6+ / Docker / phpMyAdmin / WampServer
-- =============================================================================

CREATE DATABASE IF NOT EXISTS unistage_db CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
USE unistage_db;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. Table Utilisateurs (Authentification & RBAC)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS audit_conventions;
DROP TABLE IF EXISTS rapports_stage;
DROP TABLE IF EXISTS evaluations_tuteur;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS conventions_stage;
DROP TABLE IF EXISTS candidatures;
DROP TABLE IF EXISTS offres_stage;
DROP TABLE IF EXISTS etudiants;
DROP TABLE IF EXISTS entreprises;
DROP TABLE IF EXISTS tuteurs;
DROP TABLE IF EXISTS utilisateurs;

CREATE TABLE utilisateurs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(180) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM('ROLE_ETUDIANT', 'ROLE_ENTREPRISE', 'ROLE_TUTEUR', 'ROLE_ADMIN') NOT NULL,
    nom_complet VARCHAR(150),
    organisation VARCHAR(150),
    actif BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_actif (actif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Table Étudiants
-- -----------------------------------------------------------------------------
CREATE TABLE etudiants (
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

-- -----------------------------------------------------------------------------
-- 3. Table Entreprises
-- -----------------------------------------------------------------------------
CREATE TABLE entreprises (
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

-- -----------------------------------------------------------------------------
-- 4. Table Tuteurs Académiques
-- -----------------------------------------------------------------------------
CREATE TABLE tuteurs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id BIGINT NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    departement VARCHAR(100) NOT NULL,
    CONSTRAINT fk_tuteur_user FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    INDEX idx_tuteurs_nom_prenom (nom, prenom),
    INDEX idx_tuteurs_departement (departement)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. Table Offres de Stage
-- -----------------------------------------------------------------------------
CREATE TABLE offres_stage (
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

-- -----------------------------------------------------------------------------
-- 6. Table Candidatures
-- -----------------------------------------------------------------------------
CREATE TABLE candidatures (
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

-- -----------------------------------------------------------------------------
-- 7. Table Conventions de Stage
-- -----------------------------------------------------------------------------
CREATE TABLE conventions_stage (
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

-- -----------------------------------------------------------------------------
-- 8. Table Notifications
-- -----------------------------------------------------------------------------
CREATE TABLE notifications (
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

-- -----------------------------------------------------------------------------
-- 9. Table Journal d'Audit & Traçabilité des Conventions
-- -----------------------------------------------------------------------------
CREATE TABLE audit_conventions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    convention_id BIGINT NOT NULL,
    utilisateur_id BIGINT,
    nom_utilisateur VARCHAR(150),
    role_utilisateur VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    date_action DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_adresse VARCHAR(50),
    CONSTRAINT fk_audit_convention FOREIGN KEY (convention_id) REFERENCES conventions_stage(id) ON DELETE CASCADE,
    INDEX idx_audit_convention_id (convention_id),
    INDEX idx_audit_date_action (date_action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. Table Rapports de Stage
-- -----------------------------------------------------------------------------
CREATE TABLE rapports_stage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    convention_id BIGINT NOT NULL UNIQUE,
    etudiant_id BIGINT NOT NULL,
    titre VARCHAR(255) NOT NULL,
    resume TEXT,
    fichier_url VARCHAR(255) NOT NULL,
    date_depot DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('SOUMIS', 'EN_REVISION', 'VALIDE') DEFAULT 'SOUMIS',
    CONSTRAINT fk_rapport_convention FOREIGN KEY (convention_id) REFERENCES conventions_stage(id) ON DELETE CASCADE,
    CONSTRAINT fk_rapport_etudiant FOREIGN KEY (etudiant_id) REFERENCES etudiants(id) ON DELETE CASCADE,
    INDEX idx_rapport_convention (convention_id),
    INDEX idx_rapport_etudiant (etudiant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. Table Évaluations des Tuteurs Académiques
-- -----------------------------------------------------------------------------
CREATE TABLE evaluations_tuteur (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    convention_id BIGINT NOT NULL UNIQUE,
    tuteur_id BIGINT NOT NULL,
    note_qualite_travail INT DEFAULT 15,
    note_autonomie INT DEFAULT 15,
    note_assiduite INT DEFAULT 15,
    note_integration INT DEFAULT 15,
    note_globale DECIMAL(4,2) DEFAULT 15.00,
    appreciation_globale TEXT,
    fichier_evaluation_url VARCHAR(255),
    date_evaluation DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_eval_convention FOREIGN KEY (convention_id) REFERENCES conventions_stage(id) ON DELETE CASCADE,
    CONSTRAINT fk_eval_tuteur FOREIGN KEY (tuteur_id) REFERENCES tuteurs(id) ON DELETE CASCADE,
    INDEX idx_eval_convention (convention_id),
    INDEX idx_eval_tuteur (tuteur_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- INSERTION DES DONNÉES INITIALES DE DÉMONSTRATION (Seed Data)
-- Mot de passe universel de test : "password123" ($2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq)
-- =============================================================================

INSERT INTO utilisateurs (id, email, mot_de_passe, role, nom_complet, organisation, actif) VALUES
(1, 'admin@univ-labe.edu.gn', '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq', 'ROLE_ADMIN', 'Mamadou Bassirou Diallo', 'Informatique & Télécoms', TRUE),
(2, 'mamadou.barry@etud.univ-labe.edu.gn', '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq', 'ROLE_ETUDIANT', 'Mamadou Barry', 'Université de Labé', TRUE),
(3, 'fatoumata.diallo@etud.univ-labe.edu.gn', '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq', 'ROLE_ETUDIANT', 'Fatoumata Diallo', 'Université de Labé', TRUE),
(4, 'ibrahima.sow@etud.univ-labe.edu.gn', '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq', 'ROLE_ETUDIANT', 'Ibrahima Sow', 'Université de Labé', TRUE),
(5, 'aminata.balde@etud.univ-labe.edu.gn', '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq', 'ROLE_ETUDIANT', 'Aminata Baldé', 'Université de Labé', TRUE),
(6, 'ousmane.camara@etud.univ-labe.edu.gn', '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq', 'ROLE_ETUDIANT', 'Ousmane Camara', 'Université de Labé', TRUE),
(7, 'contact@sotelgui.gn', '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq', 'ROLE_ENTREPRISE', 'Sotelgui SA', 'Télécommunications', TRUE),
(8, 'rh@orange-guinee.gn', '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq', 'ROLE_ENTREPRISE', 'Orange Guinée', 'Télécommunications', TRUE),
(9, 'info@banque-bcrg.gn', '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq', 'ROLE_ENTREPRISE', 'Banque Centrale BCRG', 'Banque & Finance', TRUE),
(10, 'recrutement@canalplus-gn.gn', '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq', 'ROLE_ENTREPRISE', 'Canal+ Guinée', 'Médias', TRUE),
(11, 'rh@ecobank-guinee.gn', '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq', 'ROLE_ENTREPRISE', 'Ecobank Guinée', 'Banque', TRUE),
(12, 'prof.diallo@univ-labe.edu.gn', '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq', 'ROLE_TUTEUR', 'Prof. Alpha Diallo', 'Informatique', TRUE),
(13, 'prof.bah@univ-labe.edu.gn', '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq', 'ROLE_TUTEUR', 'Prof. Kadiatou Bah', 'Télécommunications', TRUE),
(14, 'prof.keira@univ-labe.edu.gn', '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq', 'ROLE_TUTEUR', 'Prof. Sekou Keita', 'Génie Informatique', TRUE),
(15, 'prof.balde@univ-labe.edu.gn', '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq', 'ROLE_TUTEUR', 'Prof. Cherif Baldé', 'Mathématiques', TRUE),
(16, 'prof.soumah@univ-labe.edu.gn', '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq', 'ROLE_TUTEUR', 'Prof. Mariama Soumah', 'Physique Appliquée', TRUE);

INSERT INTO etudiants (id, utilisateur_id, matricule, nom, prenom, filiere, niveau, cv_url) VALUES
(1, 2, 'ETU-2024-001', 'Barry', 'Mamadou', 'Licence Informatique', 'L3', 'https://univ-labe.edu.gn/cv/mamadou_barry.pdf'),
(2, 3, 'ETU-2024-002', 'Diallo', 'Fatoumata', 'Licence Télécommunications', 'L3', 'https://univ-labe.edu.gn/cv/fatoumata_diallo.pdf'),
(3, 4, 'ETU-2024-003', 'Sow', 'Ibrahima', 'Licence Génie Informatique', 'L2', 'https://univ-labe.edu.gn/cv/ibrahima_sow.pdf'),
(4, 5, 'ETU-2024-004', 'Baldé', 'Aminata', 'Master Système & Réseaux', 'M1', 'https://univ-labe.edu.gn/cv/aminata_balde.pdf'),
(5, 6, 'ETU-2024-005', 'Camara', 'Ousmane', 'Licence Informatique', 'L3', 'https://univ-labe.edu.gn/cv/ousmane_camara.pdf');

INSERT INTO entreprises (id, utilisateur_id, nom_entreprise, rccm_nif, secteur_activite, adresse, telephone, logo_url, est_validee) VALUES
(1, 7, 'Sotelgui SA', 'GN-CKY-2010-B-1234', 'Télécommunications & Internet', 'Avenue de la République, Kaloum, Conakry', '+224 622 00 11 22', 'https://sotelgui.gn/logo.png', TRUE),
(2, 8, 'Orange Guinée', 'GN-CKY-2007-B-5678', 'Télécommunications', 'Boulbinet, Kaloum, Conakry', '+224 624 00 00 00', 'https://orange.gn/logo.png', TRUE),
(3, 9, 'Banque Centrale de Guinée (BCRG)', 'GN-CKY-1960-A-0001', 'Banque & Institution Financière', 'Boulevard du Commerce, Conakry', '+224 620 11 22 33', 'https://bcrg.gov.gn/logo.png', TRUE),
(4, 10, 'Canal+ Guinée', 'GN-CKY-2015-B-9999', 'Médias & Télévision', 'Immeuble Alima, Almamya, Conakry', '+224 628 99 88 77', 'https://canalplus.gn/logo.png', TRUE),
(5, 11, 'Ecobank Guinée', 'GN-CKY-1999-B-3333', 'Banque Commerciale', 'Cité Chemin de Fer, Conakry', '+224 625 33 44 55', 'https://ecobank.gn/logo.png', TRUE);

INSERT INTO tuteurs (id, utilisateur_id, nom, prenom, departement) VALUES
(1, 12, 'Diallo', 'Alpha', 'Informatique & Télécommunications'),
(2, 13, 'Bah', 'Kadiatou', 'Informatique & Télécommunications'),
(3, 14, 'Keita', 'Sekou', 'Génie Informatique'),
(4, 15, 'Baldé', 'Cherif', 'Mathématiques & Informatique'),
(5, 16, 'Soumah', 'Mariama', 'Physique Appliquée');

INSERT INTO offres_stage (id, entreprise_id, titre, slug, description, lieu, duree_mois, gratification, statut, date_publication) VALUES
(1, 1, 'Développeur Web Full-Stack (Angular / Spring Boot)', 'developpeur-web-full-stack-sotelgui-001', 'Nous recherchons un stagiaire passionné par le développement web moderne pour participer à la refonte de nos applications internes.', 'Conakry (Kaloum)', 4, 1500000.00, 'PUBLIEE', '2024-08-01 10:00:00'),
(2, 2, 'Technicien Réseau & Infrastructure Télécom', 'technicien-reseau-orange-002', 'Stage pratique axé sur l administration des réseaux 4G/5G, la maintenance de la fibre optique et la supervision des équipements.', 'Labé (Centre)', 6, 2000000.00, 'PUBLIEE', '2024-08-03 14:30:00'),
(3, 3, 'Assistant Analyste Financier & Business Intelligence', 'assistant-analyste-financier-bcrg-003', 'Intégrez la Direction Générale des Études et des Statistiques pour modéliser et analyser les indicateurs économiques.', 'Conakry (BCRG)', 3, 1800000.00, 'PUBLIEE', '2024-08-05 09:15:00'),
(4, 4, 'Chargé de Support Technique & Déploiement Fibre', 'charge-support-technique-canal-004', 'Assistance aux abonnés professionnels, paramétrage d équipements et suivi d interventions réseau sur le terrain.', 'Labé', 3, 1200000.00, 'PUBLIEE', '2024-08-10 11:00:00'),
(5, 5, 'Administrateur Base de Données & Sécurité SI', 'administrateur-bdd-ecobank-005', 'Mission centrée sur l optimisation MySQL/Oracle, la gestion des backups et le durcissement des accès de sécurité.', 'Conakry', 6, 2200000.00, 'EN_ATTENTE_MODERATION', '2024-08-12 16:45:00');

INSERT INTO candidatures (id, etudiant_id, offre_id, lettre_motivation, cv_url, statut, date_candidature) VALUES
(1, 1, 1, 'Je soussigné Mamadou Barry, étudiant en L3 Informatique à l Université de Labé, sollicite ce stage Full-Stack.', 'https://univ-labe.edu.gn/cv/mamadou_barry.pdf', 'RETENUE', '2024-08-02 11:30:00'),
(2, 2, 2, 'Étudiante passionnée par les télécoms, je souhaite appliquer mes compétences théoriques au sein d Orange Guinée.', 'https://univ-labe.edu.gn/cv/fatoumata_diallo.pdf', 'EN_EXAMEN', '2024-08-04 16:20:00'),
(3, 3, 3, 'Fort de mes compétences en algorithmique et statistiques, j apporte ma rigueur à la Banque Centrale.', 'https://univ-labe.edu.gn/cv/ibrahima_sow.pdf', 'SOUMISE', '2024-08-06 10:00:00'),
(4, 4, 4, 'Spécialiste Réseaux & Systèmes en Master, je postule avec enthousiasme au poste de support technique.', 'https://univ-labe.edu.gn/cv/aminata_balde.pdf', 'SOUMISE', '2024-08-11 13:10:00'),
(5, 1, 2, 'Candidature secondaire pour le poste de technicien réseau.', 'https://univ-labe.edu.gn/cv/mamadou_barry.pdf', 'REFUSEE', '2024-08-05 08:45:00');

INSERT INTO conventions_stage (id, candidature_id, tuteur_id, date_debut, date_fin, missions, gratification, statut_validation, pdf_url, date_creation) VALUES
(1, 1, 1, '2024-09-02', '2024-11-29', 'Conception et développement de microservices REST Spring Boot et d interfaces utilisateur réactives sous Angular 17.', 1500000.00, 'SIGNEE_FINALE', '/uploads/conventions/convention_1.pdf', '2024-08-08 15:00:00');

INSERT INTO notifications (id, utilisateur_id, titre, message, lue, created_at) VALUES
(1, 2, '🎉 Candidature retenue !', 'Félicitations ! Votre candidature pour le poste "Développeur Web Full-Stack" chez Sotelgui SA a été retenue. Une convention de stage a été générée.', TRUE, '2024-08-08 15:05:00'),
(2, 7, '📥 Nouvelle candidature reçue', 'Un(e) étudiant(e) vient de postuler à votre offre "Développeur Web Full-Stack". Connectez-vous pour examiner le profil.', TRUE, '2024-08-02 11:31:00'),
(3, 3, '🔍 Candidature en cours d examen', 'Votre candidature pour le poste Orange Guinée est en cours d examen par l équipe RH.', FALSE, '2024-08-04 16:25:00'),
(4, 12, '📋 Convention de stage assignée', 'La convention de Mamadou Barry (Sotelgui SA) vous a été assignée en tant que tuteur académique.', FALSE, '2024-08-08 15:10:00');

INSERT INTO audit_conventions (id, convention_id, utilisateur_id, nom_utilisateur, role_utilisateur, action, details, date_action, ip_adresse) VALUES
(1, 1, 2, 'Mamadou Barry', 'ROLE_ETUDIANT', 'CREATION_CONVENTION', 'Convention créée automatiquement suite à la rétention de candidature.', '2024-08-08 15:00:00', '127.0.0.1'),
(2, 1, 7, 'Sotelgui SA', 'ROLE_ENTREPRISE', 'VALIDATION_ENTREPRISE', 'Validation des modalités pratiques et indemnité de stage.', '2024-08-09 10:30:00', '127.0.0.1'),
(3, 1, 12, 'Prof. Alpha Diallo', 'ROLE_TUTEUR', 'SIGNATURE_FINALE_TUTEUR', 'Validation pédagogique finale et signature de la convention.', '2024-08-10 14:00:00', '127.0.0.1');

INSERT INTO rapports_stage (id, convention_id, etudiant_id, titre, resume, fichier_url, date_depot, statut) VALUES
(1, 1, 1, 'Rapport de Stage — Refonte Full-Stack chez Sotelgui', 'Ce rapport détaille l architecture logicielle mise en place durant 3 mois de stage chez Sotelgui SA.', '/uploads/rapports/rapport_mamadou_barry.pdf', '2024-11-25 17:00:00', 'VALIDE');

INSERT INTO evaluations_tuteur (id, convention_id, tuteur_id, note_qualite_travail, note_autonomie, note_assiduite, note_integration, note_globale, appreciation_globale, date_evaluation) VALUES
(1, 1, 1, 18, 17, 19, 18, 18.00, 'Excellent travail durant tout le déroulement du stage. L étudiant a su faire preuve d une grande autonomie technique.', '2024-11-28 11:00:00');

SET FOREIGN_KEY_CHECKS = 1;
