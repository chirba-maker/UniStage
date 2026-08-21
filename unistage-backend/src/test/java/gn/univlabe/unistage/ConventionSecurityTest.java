package gn.univlabe.unistage;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration de la sécurité des endpoints REST.
 * Vérifie que les règles de @PreAuthorize sont bien appliquées par rôle.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Tests de sécurité des endpoints — contrôle des rôles")
class ConventionSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    // =========================================================
    // Test 1 : Un ETUDIANT ne peut pas accéder aux endpoints ADMIN
    // =========================================================
    @Test
    @WithMockUser(username = "etudiant@test.com", roles = {"ETUDIANT"})
    @DisplayName("ETUDIANT: accès à /api/conventions/admin/all refusé (403)")
    void testEtudiantCannotAccessAdminConventions() throws Exception {
        mockMvc.perform(get("/api/conventions/admin/all"))
                .andExpect(status().isForbidden());
    }

    // =========================================================
    // Test 2 : Un ETUDIANT ne peut pas valider en tant qu'ENTREPRISE
    // =========================================================
    @Test
    @WithMockUser(username = "etudiant@test.com", roles = {"ETUDIANT"})
    @DisplayName("ETUDIANT: validation entreprise refusée (403)")
    void testEtudiantCannotValidateAsEntreprise() throws Exception {
        mockMvc.perform(put("/api/conventions/1/valider-entreprise"))
                .andExpect(status().isForbidden());
    }

    // =========================================================
    // Test 3 : Un TUTEUR ne peut pas valider en tant qu'ENTREPRISE
    // =========================================================
    @Test
    @WithMockUser(username = "tuteur@test.com", roles = {"TUTEUR"})
    @DisplayName("TUTEUR: validation entreprise refusée (403)")
    void testTuteurCannotValidateAsEntreprise() throws Exception {
        mockMvc.perform(put("/api/conventions/1/valider-entreprise"))
                .andExpect(status().isForbidden());
    }

    // =========================================================
    // Test 4 : Un ETUDIANT ne peut pas assigner un tuteur (rôle ADMIN)
    // =========================================================
    @Test
    @WithMockUser(username = "etudiant@test.com", roles = {"ETUDIANT"})
    @DisplayName("ETUDIANT: assignation de tuteur refusée (403)")
    void testEtudiantCannotAssignTuteur() throws Exception {
        mockMvc.perform(put("/api/conventions/1/assigner-tuteur")
                .contentType("application/json")
                .content("{\"tuteurId\": 1}"))
                .andExpect(status().isForbidden());
    }

    // =========================================================
    // Test 5 : Un ENTREPRISE ne peut pas valider en tant que TUTEUR
    // =========================================================
    @Test
    @WithMockUser(username = "ent@test.com", roles = {"ENTREPRISE"})
    @DisplayName("ENTREPRISE: validation tuteur refusée (403)")
    void testEntrepriseCannotValidateAsTuteur() throws Exception {
        mockMvc.perform(put("/api/conventions/1/valider-tuteur"))
                .andExpect(status().isForbidden());
    }

    // =========================================================
    // Test 6 : Accès sans authentification → Refusé (401 / 403)
    // =========================================================
    @Test
    @DisplayName("Sans authentification: accès à endpoint protégé refusé")
    void testUnauthenticatedAccessIsDenied() throws Exception {
        mockMvc.perform(get("/api/conventions/mes-conventions"))
                .andExpect(status().is4xxClientError());
    }

    // =========================================================
    // Test 7 : Un ETUDIANT ne peut pas créer une offre de stage
    // =========================================================
    @Test
    @WithMockUser(username = "etudiant@test.com", roles = {"ETUDIANT"})
    @DisplayName("ETUDIANT: création offre refusée (403)")
    void testEtudiantCannotCreateOffre() throws Exception {
        mockMvc.perform(post("/api/offres")
                .contentType("application/json")
                .content("{\"titre\": \"Offre test\", \"description\": \"Description valide de stage\", \"lieu\": \"Labé\", \"dureeMois\": 3}"))
                .andExpect(status().isForbidden());
    }
}
