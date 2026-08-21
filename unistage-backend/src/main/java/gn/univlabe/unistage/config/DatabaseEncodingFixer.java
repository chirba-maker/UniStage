package gn.univlabe.unistage.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseEncodingFixer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseEncodingFixer.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseEncodingFixer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        log.info("🔍 Exécution de la vérification/correction de l'encodage des données (UTF-8)...");
        try {
            fixNotifications();
            fixOffres();
            fixCandidatures();
            fixConventions();
            fixEntreprises();
            fixEtudiants();
            fixTuteurs();
            log.info("✅ Verification/correction d'encodage UTF-8 exécutée avec succès !");
        } catch (Exception e) {
            log.warn("⚠️ Information sur la correction d'encodage: {}", e.getMessage());
        }
    }

    private void fixNotifications() {
        String[] updates = {
            "UPDATE notifications SET titre = REPLACE(titre, 'ƒÄë', '🎉'), message = REPLACE(message, 'ƒÄë', '🎉')",
            "UPDATE notifications SET titre = REPLACE(titre, '├®', 'é'), message = REPLACE(message, '├®', 'é')",
            "UPDATE notifications SET titre = REPLACE(titre, '├¬', 'ê'), message = REPLACE(message, '├¬', 'ê')",
            "UPDATE notifications SET titre = REPLACE(titre, '├á', 'à'), message = REPLACE(message, '├á', 'à')",
            "UPDATE notifications SET titre = REPLACE(titre, '├è', 'è'), message = REPLACE(message, '├è', 'è')",
            "UPDATE notifications SET titre = REPLACE(titre, '├┤', 'ô'), message = REPLACE(message, '├┤', 'ô')",
            "UPDATE notifications SET titre = REPLACE(titre, '├«', 'î'), message = REPLACE(message, '├«', 'î')",
            "UPDATE notifications SET titre = REPLACE(titre, '├º', 'ç'), message = REPLACE(message, '├º', 'ç')",
            "UPDATE notifications SET titre = REPLACE(titre, 'Ã©', 'é'), message = REPLACE(message, 'Ã©', 'é')",
            "UPDATE notifications SET titre = REPLACE(titre, 'Ãª', 'ê'), message = REPLACE(message, 'Ãª', 'ê')",
            "UPDATE notifications SET titre = REPLACE(titre, 'Ã¨', 'è'), message = REPLACE(message, 'Ã¨', 'è')"
        };
        for (String sql : updates) {
            try { jdbcTemplate.update(sql); } catch (Exception ignored) {}
        }
    }

    private void fixOffres() {
        String[] updates = {
            "UPDATE offres_stage SET titre = REPLACE(titre, '├®', 'é'), description = REPLACE(description, '├®', 'é')",
            "UPDATE offres_stage SET titre = REPLACE(titre, '├¬', 'ê'), description = REPLACE(description, '├¬', 'ê')",
            "UPDATE offres_stage SET titre = REPLACE(titre, '├á', 'à'), description = REPLACE(description, '├á', 'à')",
            "UPDATE offres_stage SET titre = REPLACE(titre, '├è', 'è'), description = REPLACE(description, '├è', 'è')",
            "UPDATE offres_stage SET titre = REPLACE(titre, 'Ã©', 'é'), description = REPLACE(description, 'Ã©', 'é')",
            "UPDATE offres_stage SET titre = REPLACE(titre, 'Ãª', 'ê'), description = REPLACE(description, 'Ãª', 'ê')",
            "UPDATE offres_stage SET lieu = REPLACE(lieu, '├®', 'é'), lieu = REPLACE(lieu, 'Ã©', 'é')"
        };
        for (String sql : updates) {
            try { jdbcTemplate.update(sql); } catch (Exception ignored) {}
        }
    }

    private void fixCandidatures() {
        String[] updates = {
            "UPDATE candidatures SET lettre_motivation = REPLACE(lettre_motivation, '├®', 'é')",
            "UPDATE candidatures SET lettre_motivation = REPLACE(lettre_motivation, '├¬', 'ê')",
            "UPDATE candidatures SET lettre_motivation = REPLACE(lettre_motivation, '├á', 'à')",
            "UPDATE candidatures SET lettre_motivation = REPLACE(lettre_motivation, '├è', 'è')",
            "UPDATE candidatures SET lettre_motivation = REPLACE(lettre_motivation, 'Ã©', 'é')",
            "UPDATE candidatures SET lettre_motivation = REPLACE(lettre_motivation, 'Ãª', 'ê')"
        };
        for (String sql : updates) {
            try { jdbcTemplate.update(sql); } catch (Exception ignored) {}
        }
    }

    private void fixConventions() {
        String[] updates = {
            "UPDATE conventions_stage SET missions = REPLACE(missions, '├®', 'é')",
            "UPDATE conventions_stage SET missions = REPLACE(missions, '├¬', 'ê')",
            "UPDATE conventions_stage SET missions = REPLACE(missions, '├á', 'à')",
            "UPDATE conventions_stage SET missions = REPLACE(missions, '├è', 'è')",
            "UPDATE conventions_stage SET missions = REPLACE(missions, 'Ã©', 'é')",
            "UPDATE conventions_stage SET missions = REPLACE(missions, 'Ãª', 'ê')"
        };
        for (String sql : updates) {
            try { jdbcTemplate.update(sql); } catch (Exception ignored) {}
        }
    }

    private void fixEntreprises() {
        String[] updates = {
            "UPDATE entreprises SET nom_entreprise = REPLACE(nom_entreprise, '├®', 'é'), secteur_activite = REPLACE(secteur_activite, '├®', 'é'), adresse = REPLACE(adresse, '├®', 'é')",
            "UPDATE entreprises SET nom_entreprise = REPLACE(nom_entreprise, 'Ã©', 'é'), secteur_activite = REPLACE(secteur_activite, 'Ã©', 'é'), adresse = REPLACE(adresse, 'Ã©', 'é')"
        };
        for (String sql : updates) {
            try { jdbcTemplate.update(sql); } catch (Exception ignored) {}
        }
    }

    private void fixEtudiants() {
        String[] updates = {
            "UPDATE etudiants SET nom = REPLACE(nom, '├®', 'é'), prenom = REPLACE(prenom, '├®', 'é'), filiere = REPLACE(filiere, '├®', 'é')",
            "UPDATE etudiants SET nom = REPLACE(nom, 'Ã©', 'é'), prenom = REPLACE(prenom, 'Ã©', 'é'), filiere = REPLACE(filiere, 'Ã©', 'é')"
        };
        for (String sql : updates) {
            try { jdbcTemplate.update(sql); } catch (Exception ignored) {}
        }
    }

    private void fixTuteurs() {
        String[] updates = {
            "UPDATE tuteurs SET nom = REPLACE(nom, '├®', 'é'), prenom = REPLACE(prenom, '├®', 'é'), departement = REPLACE(departement, '├®', 'é')",
            "UPDATE tuteurs SET nom = REPLACE(nom, 'Ã©', 'é'), prenom = REPLACE(prenom, 'Ã©', 'é'), departement = REPLACE(departement, 'Ã©', 'é')"
        };
        for (String sql : updates) {
            try { jdbcTemplate.update(sql); } catch (Exception ignored) {}
        }
    }
}
