-- Script de réparation de l'encodage UTF-8 pour la base de données unistage_db
SET NAMES utf8mb4;
USE unistage_db;

-- 1. NOTIFICATIONS
UPDATE notifications SET
  titre = '🎉 Candidature retenue !',
  message = 'Félicitations ! Votre candidature pour le poste "Développeur Web Full-Stack" chez Sotelgui a été retenue. Une convention de stage vient d\'être créée. Veuillez vous connecter pour en consulter les détails.'
WHERE id = 1 OR titre LIKE '%Candidature retenue%';

UPDATE notifications SET
  titre = '📥 Nouvelle candidature reçue',
  message = 'Un(e) étudiant(e) vient de postuler à votre offre "Développeur Web Full-Stack". Connectez-vous à votre tableau de bord pour examiner le profil et la lettre de motivation.'
WHERE id = 2 OR titre LIKE '%Nouvelle candidature%';

UPDATE notifications SET
  titre = '🔍 Candidature en cours d\'examen',
  message = 'Bonne nouvelle ! Votre candidature pour le poste "Assistant Analyste Financier" à la BCRG est actuellement en cours d\'examen par notre équipe RH. Vous serez notifié(e) de la suite du processus.'
WHERE id = 3 OR titre LIKE '%examen%';

UPDATE notifications SET
  titre = '📋 Convention de stage assignée',
  message = 'Une convention de stage vous a été assignée en tant que tuteur académique. Étudiant(e) : Mamadou Barry | Entreprise : Sotelgui | Période : 02/09/2024 → 29/11/2024. Veuillez consulter et valider la convention.'
WHERE id = 4 OR titre LIKE '%assignée%';

UPDATE notifications SET
  titre = '📬 Candidature soumise avec succès',
  message = 'Votre candidature pour le poste "Technicien Réseau & Infrastructure" chez Orange Guinée a bien été enregistrée. Vous recevrez une notification dès qu\'Orange Guinée aura examiné votre dossier.'
WHERE id = 5 OR titre LIKE '%soumise%';

-- Nettoyage général des caractères corrompus restants dans notifications
UPDATE notifications SET 
  titre = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(titre, '├®', 'é'), '├¬', 'ê'), '├á', 'à'), '├è', 'è'), '├┤', 'ô'), '├«', 'î'), '├º', 'ç'), 'Ã©', 'é'), 'Ãª', 'ê'), 'Ã¨', 'è'),
  message = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(message, '├®', 'é'), '├¬', 'ê'), '├á', 'à'), '├è', 'è'), '├┤', 'ô'), '├«', 'î'), '├º', 'ç'), 'Ã©', 'é'), 'Ãª', 'ê'), 'Ã¨', 'è');

-- 2. OFFRES DE STAGE
UPDATE offres_stage SET 
  titre = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(titre, '├®', 'é'), '├¬', 'ê'), '├á', 'à'), '├è', 'è'), '├┤', 'ô'), '├«', 'î'), '├º', 'ç'), 'Ã©', 'é'), 'Ãª', 'ê'), 'Ã¨', 'è'),
  description = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(description, '├®', 'é'), '├¬', 'ê'), '├á', 'à'), '├è', 'è'), '├┤', 'ô'), '├«', 'î'), '├º', 'ç'), 'Ã©', 'é'), 'Ãª', 'ê'), 'Ã¨', 'è'),
  lieu = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(lieu, '├®', 'é'), '├¬', 'ê'), '├á', 'à'), '├è', 'è'), '├┤', 'ô'), '├«', 'î'), '├º', 'ç'), 'Ã©', 'é'), 'Ãª', 'ê'), 'Ã¨', 'è');

-- 3. CANDIDATURES
UPDATE candidatures SET 
  lettre_motivation = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(lettre_motivation, '├®', 'é'), '├¬', 'ê'), '├á', 'à'), '├è', 'è'), '├┤', 'ô'), '├«', 'î'), '├º', 'ç'), 'Ã©', 'é'), 'Ãª', 'ê'), 'Ã¨', 'è');

-- 4. CONVENTIONS DE STAGE
UPDATE conventions_stage SET 
  missions = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(missions, '├®', 'é'), '├¬', 'ê'), '├á', 'à'), '├è', 'è'), '├┤', 'ô'), '├«', 'î'), '├º', 'ç'), 'Ã©', 'é'), 'Ãª', 'ê'), 'Ã¨', 'è');

-- 5. ENTREPRISES
UPDATE entreprises SET 
  nom_entreprise = REPLACE(REPLACE(REPLACE(REPLACE(nom_entreprise, '├®', 'é'), 'Ã©', 'é'), '├¬', 'ê'), 'Ãª', 'ê'),
  secteur_activite = REPLACE(REPLACE(REPLACE(REPLACE(secteur_activite, '├®', 'é'), 'Ã©', 'é'), '├¬', 'ê'), 'Ãª', 'ê'),
  adresse = REPLACE(REPLACE(REPLACE(REPLACE(adresse, '├®', 'é'), 'Ã©', 'é'), '├¬', 'ê'), 'Ãª', 'ê');

-- 6. ÉTUDIANTS
UPDATE etudiants SET 
  nom = REPLACE(REPLACE(nom, '├®', 'é'), 'Ã©', 'é'),
  prenom = REPLACE(REPLACE(prenom, '├®', 'é'), 'Ã©', 'é'),
  filiere = REPLACE(REPLACE(REPLACE(REPLACE(filiere, '├®', 'é'), 'Ã©', 'é'), '├¬', 'ê'), 'Ãª', 'ê');

-- 7. TUTEURS
UPDATE tuteurs SET 
  nom = REPLACE(REPLACE(nom, '├®', 'é'), 'Ã©', 'é'),
  prenom = REPLACE(REPLACE(prenom, '├®', 'é'), 'Ã©', 'é'),
  departement = REPLACE(REPLACE(REPLACE(REPLACE(departement, '├®', 'é'), 'Ã©', 'é'), '├¬', 'ê'), 'Ãª', 'ê');
