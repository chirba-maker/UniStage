-- =============================================================================
-- Migration V3__audit_and_evaluations.sql — UniStage
-- Audit & Traçabilité des conventions, Rapports de stage et Évaluations Tuteurs
-- =============================================================================

SET NAMES utf8mb4;

-- 1. Table Journal d'Audit & Traçabilité des Conventions
CREATE TABLE IF NOT EXISTS audit_conventions (
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

-- 2. Table Rapports de Stage (Déposés par l'étudiant)
CREATE TABLE IF NOT EXISTS rapports_stage (
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

-- 3. Table Évaluations des Tuteurs Académiques
CREATE TABLE IF NOT EXISTS evaluations_tuteur (
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

-- Insertion de données de test pour l'Audit Trail sur les conventions existantes
INSERT INTO audit_conventions (convention_id, utilisateur_id, nom_utilisateur, role_utilisateur, action, details, date_action)
SELECT 
    c.id,
    e.utilisateur_id,
    CONCAT(e.prenom, ' ', e.nom),
    'ROLE_ETUDIANT',
    'CREATION_CONVENTION',
    'Convention de stage générée automatiquement suite à la rétention de candidature.',
    c.date_creation
FROM conventions_stage c
JOIN candidatures cand ON c.candidature_id = cand.id
JOIN etudiants e ON cand.etudiant_id = e.id;

INSERT INTO audit_conventions (convention_id, utilisateur_id, nom_utilisateur, role_utilisateur, action, details, date_action)
SELECT 
    c.id,
    ent.utilisateur_id,
    ent.nom_entreprise,
    'ROLE_ENTREPRISE',
    'VALIDATION_ENTREPRISE',
    'Validation des termes, dates et indemnités de stage par l entreprise.',
    DATE_ADD(c.date_creation, INTERVAL 1 DAY)
FROM conventions_stage c
JOIN candidatures cand ON c.candidature_id = cand.id
JOIN offres_stage o ON cand.offre_id = o.id
JOIN entreprises ent ON o.entreprise_id = ent.id
WHERE c.statut_validation IN ('VALIDEE_ENTREPRISE', 'SIGNEE_FINALE');

INSERT INTO audit_conventions (convention_id, utilisateur_id, nom_utilisateur, role_utilisateur, action, details, date_action)
SELECT 
    c.id,
    t.utilisateur_id,
    CONCAT(t.prenom, ' ', t.nom),
    'ROLE_TUTEUR',
    'SIGNATURE_FINALE_TUTEUR',
    'Validation académique finale et signature électronique de la convention.',
    DATE_ADD(c.date_creation, INTERVAL 2 DAY)
FROM conventions_stage c
JOIN tuteurs t ON c.tuteur_id = t.id
WHERE c.statut_validation = 'SIGNEE_FINALE';
