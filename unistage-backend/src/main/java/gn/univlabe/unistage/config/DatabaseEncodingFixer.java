package gn.univlabe.unistage.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Correcteur d'encodage UTF-8 exécuté au démarrage.
 *
 * Les données stockées avant la configuration correcte de l'encodage MySQL peuvent
 * contenir des séquences latin-1 / Windows-1252 double-encodées en UTF-8.
 * Ce composant les corrige en une seule passe pour chaque table concernée.
 *
 * Séquences corrigées (UTF-8 mal interprété en latin-1) :
 *   Ã©  → é     Ã¨  → è     Ã   → ê     Ã   → ë
 *   Ã   → à     Ã¢  → â     Ã«  → ë     Ã©  → é
 *   Ã´  → ô     Ã»  → û     Ã®  → î     Ã¯  → ï
 *   Ã§  → ç     Ã¹  → ù     Ã   → É     Ã   → È
 *   â€™ → '     â€œ → "     â€  → "     â€" → –
 *   ├®  → é     ├¬  → ê     ├á  → à     ├è  → è
 *   ├┤  → ô     ├«  → î     ├º  → ç     ├╗  → û
 *   ├®  → é     ╔   → É     ╚   → È
 */
@Component
public class DatabaseEncodingFixer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseEncodingFixer.class);

    private final JdbcTemplate jdbcTemplate;

    // Liste exhaustive des paires (sequence_corrompue → caractere_correct)
    // couvrant les encodages double-utf8 et latin1→utf8 les plus fréquents en français
    private static final String[][] REPLACEMENTS = {
        // --- Séquences Ã… (UTF-8 latin1 double-encodé) ---
        {"Ã©",  "é"},
        {"Ã¨",  "è"},
        {"Ãª",  "ê"},
        {"Ã«",  "ë"},
        {"Ã ",  "à"},
        {"Ã¢",  "â"},
        {"Ã´",  "ô"},
        {"Ã»",  "û"},
        {"Ã®",  "î"},
        {"Ã¯",  "ï"},
        {"Ã§",  "ç"},
        {"Ã¹",  "ù"},
        {"Ã‰",  "É"},
        {"Ã‡",  "Ç"},
        {"Ã€",  "À"},
        {"Ã‚",  "Â"},
        {"Ã",   "Ã"},  // évite double-remplacement (doit rester en dernier)
        // --- Séquences ├… (encodage cp1252→utf8 dans certains pilotes) ---
        {"├®",  "é"},
        {"├¬",  "ê"},
        {"├á",  "à"},
        {"├è",  "è"},
        {"├┤",  "ô"},
        {"├«",  "î"},
        {"├º",  "ç"},
        {"├╗",  "û"},
        {"├â",  "â"},
        {"├»",  "û"},
        // --- Smart quotes et tirets Windows-1252 double-encodés ---
        {"â€™",  "'"},
        {"â€˜",  "'"},
        {"â€œ",  "\""},
        {"â€\"", "\""},
        {"â€“",  "–"},
        {"â€”",  "—"},
        // --- Séquences ╔/╚ (rares variantes cp850) ---
        {"╔©",  "é"},
        {"╔¨",  "è"},
        {"╔ª",  "ê"},
    };

    public DatabaseEncodingFixer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        log.info("🔍 Correction d'encodage UTF-8 (démarrage)...");
        try {
            fixTable("tuteurs",           new String[]{"nom", "prenom", "departement"});
            fixTable("etudiants",         new String[]{"nom", "prenom", "filiere", "niveau"});
            fixTable("entreprises",       new String[]{"nom_entreprise", "secteur_activite", "adresse"});
            fixTable("offres_stage",      new String[]{"titre", "description", "lieu", "nom_entreprise"});
            fixTable("candidatures",      new String[]{"lettre_motivation"});
            fixTable("conventions_stage", new String[]{"missions"});
            fixTable("utilisateurs",      new String[]{"nom_complet"});
            fixTable("notifications",     new String[]{"titre", "message"});
            fixTable("rapports_stage",    new String[]{"titre", "resume"});
            fixTable("evaluations_tuteur",new String[]{"appreciation_globale"});
            log.info("✅ Correction d'encodage UTF-8 terminée avec succès.");
        } catch (Exception e) {
            log.warn("⚠️  Correction d'encodage : {}", e.getMessage());
        }
    }

    /**
     * Applique toutes les paires de remplacement sur chaque colonne d'une table donnée.
     *
     * @param table   nom de la table MySQL
     * @param columns colonnes TEXT/VARCHAR à corriger
     */
    private void fixTable(String table, String[] columns) {
        for (String[] pair : REPLACEMENTS) {
            String corrupt = pair[0];
            String correct = pair[1];

            StringBuilder sb = new StringBuilder("UPDATE `").append(table).append("` SET ");
            for (int i = 0; i < columns.length; i++) {
                String col = columns[i];
                sb.append("`").append(col).append("` = REPLACE(`").append(col).append("`, '")
                  .append(corrupt.replace("'", "\\'")).append("', '")
                  .append(correct.replace("'", "\\'")).append("')");
                if (i < columns.length - 1) sb.append(", ");
            }
            // N'applique que si au moins une ligne est réellement corrompue
            sb.append(" WHERE ");
            for (int i = 0; i < columns.length; i++) {
                String col = columns[i];
                sb.append("`").append(col).append("` LIKE '%").append(corrupt.replace("'", "\\'")).append("%'");
                if (i < columns.length - 1) sb.append(" OR ");
            }

            try {
                int rows = jdbcTemplate.update(sb.toString());
                if (rows > 0) {
                    log.info("  ↳ [{}] {} lignes corrigées pour la séquence «{}»", table, rows, corrupt);
                }
            } catch (Exception e) {
                // Table ou colonne inexistante → on ignore silencieusement
                log.debug("  skip [{}] : {}", table, e.getMessage());
            }
        }
    }
    private String escape(String s) {
        return s.replace("\\", "\\\\").replace("'", "\\'");
    }

    private String escapeLike(String s) {
        return s.replace("\\", "\\\\").replace("'", "\\'")
                .replace("%", "\\%").replace("_", "\\_");
    }
}

