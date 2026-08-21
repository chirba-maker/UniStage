-- =============================================================================
-- Migration V4__add_user_profile_fields.sql — UniStage
-- Ajout des colonnes nom_complet et organisation sur la table utilisateurs
-- =============================================================================

SET NAMES utf8mb4;

ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS nom_complet VARCHAR(150);
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS organisation VARCHAR(150);

-- Mise à jour initiale du compte Admin par défaut
UPDATE utilisateurs 
SET nom_complet = 'Mamadou Bassirou Diallo', organisation = 'Informatique & Télécoms'
WHERE email = 'admin@univ-labe.edu.gn';
