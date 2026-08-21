-- ============================================================================
SET NAMES utf8mb4;
INSERT INTO utilisateurs ( email, mot_de_passe, role, actif ) VALUES

-- Admin
(
    'admin@univ-labe.edu.gn',
    '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq',
    'ROLE_ADMIN',
    TRUE
),

-- 5 Étudiants
(
    'mamadou.barry@etud.univ-labe.edu.gn',
    '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq',
    'ROLE_ETUDIANT',
    TRUE
),
(
    'fatoumata.diallo@etud.univ-labe.edu.gn',
    '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq',
    'ROLE_ETUDIANT',
    TRUE
),
(
    'ibrahima.sow@etud.univ-labe.edu.gn',
    '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq',
    'ROLE_ETUDIANT',
    TRUE
),
(
    'aminata.balde@etud.univ-labe.edu.gn',
    '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq',
    'ROLE_ETUDIANT',
    TRUE
),
(
    'ousmane.camara@etud.univ-labe.edu.gn',
    '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq',
    'ROLE_ETUDIANT',
    TRUE
),

-- 5 Entreprises
(
    'contact@sotelgui.gn',
    '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq',
    'ROLE_ENTREPRISE',
    TRUE
),
(
    'rh@orange-guinee.gn',
    '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq',
    'ROLE_ENTREPRISE',
    TRUE
),
(
    'info@banque-bcrg.gn',
    '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq',
    'ROLE_ENTREPRISE',
    TRUE
),
(
    'recrutement@canalplus-gn.gn',
    '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq',
    'ROLE_ENTREPRISE',
    TRUE
),
(
    'rh@ecobank-guinee.gn',
    '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq',
    'ROLE_ENTREPRISE',
    TRUE
),

-- 5 Tuteurs
(
    'prof.diallo@univ-labe.edu.gn',
    '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq',
    'ROLE_TUTEUR',
    TRUE
),
(
    'prof.bah@univ-labe.edu.gn',
    '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq',
    'ROLE_TUTEUR',
    TRUE
),
(
    'prof.keira@univ-labe.edu.gn',
    '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq',
    'ROLE_TUTEUR',
    TRUE
),
(
    'prof.baldé@univ-labe.edu.gn',
    '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq',
    'ROLE_TUTEUR',
    TRUE
),
(
    'prof.sylla@univ-labe.edu.gn',
    '$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq',
    'ROLE_TUTEUR',
    TRUE
);

-- ============================================================
-- 2. ÉTUDIANTS (utilisateur_id 2→6 = les 5 étudiants)
-- ============================================================
INSERT INTO
    etudiants (
        utilisateur_id,
        matricule,
        nom,
        prenom,
        filiere,
        niveau
    )
VALUES (
        2,
        'ETU-2024-001',
        'Barry',
        'Mamadou',
        'Informatique & Réseaux',
        'Licence 3'
    ),
    (
        3,
        'ETU-2024-002',
        'Diallo',
        'Fatoumata',
        'Gestion des Entreprises',
        'Master 1'
    ),
    (
        4,
        'ETU-2024-003',
        'Sow',
        'Ibrahima',
        'Électronique & Télécoms',
        'Licence 3'
    ),
    (
        5,
        'ETU-2024-004',
        'Baldé',
        'Aminata',
        'Finance & Comptabilité',
        'Licence 2'
    ),
    (
        6,
        'ETU-2024-005',
        'Camara',
        'Ousmane',
        'Développement Web & Mobile',
        'Licence 3'
    );

-- ============================================================
-- 3. ENTREPRISES (utilisateur_id 7→11 = les 5 entreprises)
-- ============================================================
INSERT INTO
    entreprises (
        utilisateur_id,
        nom_entreprise,
        rccm_nif,
        secteur_activite,
        adresse,
        telephone,
        est_validee
    )
VALUES (
        7,
        'Sotelgui (Société des Télécommunications de Guinée)',
        'RCCM-GN-2001-B-0021',
        'Télécommunications',
        'Avenue de la République, Conakry',
        '+224 628 00 10 00',
        TRUE
    ),
    (
        8,
        'Orange Guinée',
        'RCCM-GN-2003-B-0045',
        'Télécommunications',
        'Quartier Almamya, Conakry',
        '+224 621 00 00 00',
        TRUE
    ),
    (
        9,
        'BCRG (Banque Centrale de Guinée)',
        'RCCM-GN-1960-B-0001',
        'Finance & Banque',
        'Boulevard du Commerce, Conakry',
        '+224 622 20 20 20',
        TRUE
    ),
    (
        10,
        'Canal+ Guinée',
        'RCCM-GN-2010-B-0078',
        'Médias & Communication',
        'Kaloum, Conakry',
        '+224 623 30 30 30',
        FALSE
    ),
    (
        11,
        'Ecobank Guinée',
        'RCCM-GN-2008-B-0056',
        'Finance & Banque',
        'Avenue de la République, Conakry',
        '+224 624 40 40 40',
        TRUE
    );

-- ============================================================
-- 4. TUTEURS (utilisateur_id 12→16 = les 5 tuteurs)
-- ============================================================
INSERT INTO
    tuteurs (
        utilisateur_id,
        nom,
        prenom,
        departement
    )
VALUES (
        12,
        'Diallo',
        'Mamadou Alpha',
        'Informatique & Technologies'
    ),
    (
        13,
        'Bah',
        'Thierno Oumar',
        'Sciences Économiques'
    ),
    (
        14,
        'Keïra',
        'Aissatou',
        'Électronique & Télécommunications'
    ),
    (
        15,
        'Baldé',
        'Boubacar',
        'Finance & Comptabilité'
    ),
    (
        16,
        'Sylla',
        'Mariama',
        'Mathématiques Appliquées'
    );

-- ============================================================
-- 5. OFFRES DE STAGE (entreprise_id 1→5 = id des entreprises)
-- ============================================================
INSERT INTO
    offres_stage (
        entreprise_id,
        titre,
        slug,
        description,
        lieu,
        duree_mois,
        gratification,
        statut,
        date_publication
    )
VALUES (
        1,
        'Développeur Web Full-Stack (React/Node.js)',
        'developpeur-web-fullstack-sotelgui-2024',
        'Rejoignez notre équipe technique pour contribuer au développement de nos portails clients et systèmes de gestion interne. Vous travaillerez sur des projets React et Node.js dans un environnement agile.',
        'Conakry',
        3,
        500000.00,
        'PUBLIEE',
        '2024-08-01 08:00:00'
    ),
    (
        2,
        'Technicien Réseau & Infrastructure',
        'technicien-reseau-infrastructure-orange-guinee-2024',
        'Participez à la maintenance et au déploiement de notre infrastructure réseau nationale. Mission incluant la supervision des équipements, la configuration des routeurs et la résolution des incidents.',
        'Conakry',
        4,
        600000.00,
        'PUBLIEE',
        '2024-08-05 09:00:00'
    ),
    (
        3,
        'Assistant Analyste Financier',
        'assistant-analyste-financier-bcrg-2024',
        'Stage au sein de la Direction des Études et Statistiques. Vous participerez à l analyse des données macro-économiques, la préparation des rapports financiers et la veille réglementaire.',
        'Conakry',
        2,
        400000.00,
        'PUBLIEE',
        '2024-08-10 10:00:00'
    ),
    (
        4,
        'Assistant Marketing Digital',
        'assistant-marketing-digital-canalplus-2024',
        'Intégrez notre équipe Marketing pour gérer les campagnes sur les réseaux sociaux, créer du contenu promotionnel, analyser les performances et contribuer au développement de notre audience digitale.',
        'Conakry',
        3,
        350000.00,
        'EN_ATTENTE_MODERATION',
        '2024-08-12 11:00:00'
    ),
    (
        5,
        'Stagiaire en Gestion des Risques Bancaires',
        'stagiaire-gestion-risques-ecobank-2024',
        'Au sein de la Direction des Risques, vous apprendrez à identifier, analyser et mitiger les risques opérationnels et de crédit. Formation pratique sur les outils de scoring et de conformité bancaire.',
        'Conakry',
        4,
        700000.00,
        'PUBLIEE',
        '2024-08-15 08:30:00'
    );

-- ============================================================
-- 6. CANDIDATURES (etudiant_id → offre_id)
-- ============================================================
INSERT INTO
    candidatures (
        etudiant_id,
        offre_id,
        lettre_motivation,
        statut,
        date_candidature
    )
VALUES (
        1,
        1,
        'Étudiant en Informatique en fin de Licence 3, je maîtrise React, Node.js et MySQL. Passionné par le développement web, je souhaite mettre mes compétences au service de Sotelgui pour une expérience enrichissante.',
        'RETENUE',
        '2024-08-03 14:30:00'
    ),
    (
        2,
        3,
        'Issue d un cursus en Gestion des Entreprises orienté Finance, j ai acquis des bases solides en analyse financière et en comptabilité. Ce stage à la BCRG serait une opportunité idéale pour approfondir mes compétences.',
        'EN_EXAMEN',
        '2024-08-11 10:15:00'
    ),
    (
        3,
        2,
        'Technicien en Électronique & Télécoms, je dispose de compétences pratiques en configuration réseau (Cisco, MikroTik) et en supervision d infrastructure. Je suis motivé à rejoindre l équipe réseau d Orange Guinée.',
        'SOUMISE',
        '2024-08-07 09:45:00'
    ),
    (
        4,
        5,
        'Étudiante en Finance, j ai réalisé plusieurs analyses de risque dans le cadre de mes études. Ce stage chez Ecobank me permettrait d appliquer mes connaissances théoriques dans un contexte bancaire réel.',
        'ENTRETIEN',
        '2024-08-16 11:00:00'
    ),
    (
        5,
        1,
        'Développeur passionné, je travaille sur des projets web personnels depuis 2 ans (HTML, CSS, JavaScript, PHP). Ce stage chez Sotelgui serait ma première expérience professionnelle structurante.',
        'REFUSEE',
        '2024-08-04 16:00:00'
    );

-- ============================================================
-- 7. CONVENTIONS DE STAGE (candidature_id 1 = RETENUE → convention)
-- ============================================================
INSERT INTO
    conventions_stage (
        candidature_id,
        tuteur_id,
        date_debut,
        date_fin,
        missions,
        gratification,
        statut_validation,
        date_creation
    )
VALUES (
        1,
        1,
        '2024-09-02',
        '2024-11-29',
        '1. Développement de nouvelles fonctionnalités sur le portail client (React.js)\n2. Optimisation des API REST backend (Node.js/Express)\n3. Intégration de tests unitaires et d intégration\n4. Participation aux sprints agile et code reviews\n5. Rédaction de la documentation technique',
        500000.00,
        'VALIDEE_ENTREPRISE',
        '2024-08-20 09:00:00'
    ),
    (
        2,
        2,
        '2024-09-09',
        '2024-11-01',
        '1. Collecte et analyse des données macro-économiques guinéennes\n2. Contribution à la rédaction du rapport mensuel de stabilité financière\n3. Veille sur les indicateurs de risque systémique\n4. Participation aux réunions de la Direction des Études',
        400000.00,
        'BROUILLON',
        '2024-08-22 10:00:00'
    ),
    (
        4,
        4,
        '2024-09-16',
        '2025-01-10',
        '1. Analyse du portefeuille de crédits et scoring des clients\n2. Suivi des ratios prudentiels (Bâle III)\n3. Rédaction de rapports de conformité réglementaire\n4. Participation aux audits internes et revues de risques',
        700000.00,
        'SOUMISE',
        '2024-08-25 11:30:00'
    ),
    (
        3,
        3,
        '2024-09-02',
        '2024-12-27',
        '1. Supervision et maintenance des équipements réseau (routeurs, switches)\n2. Configuration et déploiement de nouveaux équipements\n3. Monitoring du réseau via les outils de supervision (Zabbix/Nagios)\n4. Support technique niveau 2 aux équipes terrain',
        600000.00,
        'BROUILLON',
        '2024-08-28 08:00:00'
    ),
    (
        5,
        5,
        '2024-09-02',
        '2024-11-29',
        '1. Gestion des campagnes social media (Facebook, Instagram, LinkedIn)\n2. Création de contenus visuels pour les promotions des offres Canal+\n3. Analyse des performances et reporting mensuel\n4. Participation à la stratégie d acquisition abonnés',
        350000.00,
        'BROUILLON',
        '2024-08-30 09:00:00'
    );

-- ============================================================
-- 8. NOTIFICATIONS
-- ============================================================
INSERT INTO
    notifications (
        utilisateur_id,
        titre,
        message,
        lue,
        created_at
    )
VALUES
    -- Pour l étudiant Mamadou Barry (id=2) — candidature retenue
    (
        2,
        '🎉 Candidature retenue !',
        'Félicitations ! Votre candidature pour le poste "Développeur Web Full-Stack" chez Sotelgui a été retenue. Une convention de stage vient d être créée. Veuillez vous connecter pour en consulter les détails.',
        FALSE,
        '2024-08-20 09:05:00'
    ),

-- Pour l entreprise Sotelgui (id=7) — nouvelle candidature reçue
(
    7,
    '📥 Nouvelle candidature reçue',
    'Un(e) étudiant(e) vient de postuler à votre offre "Développeur Web Full-Stack". Connectez-vous à votre tableau de bord pour examiner le profil et la lettre de motivation.',
    TRUE,
    '2024-08-04 16:05:00'
),

-- Pour l étudiant Fatoumata Diallo (id=3) — candidature en examen
(
    3,
    '🔍 Candidature en cours d\'examen',
    'Bonne nouvelle ! Votre candidature pour le poste "Assistant Analyste Financier" à la BCRG est actuellement en cours d examen par notre équipe RH. Vous serez notifié(e) de la suite du processus.',
    FALSE,
    '2024-08-14 11:00:00'
),

-- Pour le tuteur Prof. Diallo (id=12) — convention assignée
(
    12,
    '📋 Convention de stage assignée',
    'Une convention de stage vous a été assignée en tant que tuteur académique. Étudiant(e) : Mamadou Barry | Entreprise : Sotelgui | Période : 02/09/2024 → 29/11/2024. Veuillez consulter et valider la convention.',
    FALSE,
    '2024-08-21 08:00:00'
),

-- Pour l étudiant Ibrahima Sow (id=4) — rappel de soumission
(
    4,
    '📬 Candidature soumise avec succès',
    'Votre candidature pour le poste "Technicien Réseau & Infrastructure" chez Orange Guinée a bien été enregistrée. Vous recevrez une notification dès qu Orange Guinée aura examiné votre dossier.',
    TRUE,
    '2024-08-07 09:50:00'
);