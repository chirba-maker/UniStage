package gn.univlabe.unistage.web;

import gn.univlabe.unistage.dto.AuditConventionDto;
import gn.univlabe.unistage.dto.EntrepriseDto;
import gn.univlabe.unistage.dto.SystemAuditLogDto;
import gn.univlabe.unistage.dto.TuteurDto;
import gn.univlabe.unistage.service.AdminService;
import gn.univlabe.unistage.service.AnalyticsService;
import gn.univlabe.unistage.service.AuditConventionService;
import gn.univlabe.unistage.service.SystemAuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Administration", description = "Gestion entreprises, tuteurs, offres, conventions et journal d'audit système")
public class AdminController {

    private final AdminService adminService;
    private final AnalyticsService analyticsService;
    private final AuditConventionService auditConventionService;
    private final SystemAuditLogService systemAuditLogService;

    // ─── Statistiques & Analytiques ─────────────────────────────────────────

    @GetMapping("/stats")
    @Operation(summary = "Statistiques globales du tableau de bord d'administration")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/analytics")
    @Operation(summary = "Analytics & Statistiques poussées (Taux de placement, filières, entreprises)")
    public ResponseEntity<gn.univlabe.unistage.dto.AnalyticsDto> getAnalytics() {
        return ResponseEntity.ok(analyticsService.getAnalyticsDashboard());
    }

    // ─── Journaux d'Audit ────────────────────────────────────────────────────

    /**
     * Journal d'audit global système — TOUTES les actions de TOUS les utilisateurs.
     * Alimenté automatiquement par le mécanisme AOP @AuditAction.
     */
    @GetMapping("/system-audit-logs")
    @Operation(summary = "Journal d'audit système global — toutes les actions en temps réel")
    public ResponseEntity<List<SystemAuditLogDto>> getSystemAuditLogs() {
        return ResponseEntity.ok(systemAuditLogService.getAllLogs());
    }

    /**
     * Journal d'audit spécifique aux conventions (workflow tripartite).
     */
    @GetMapping("/audit-logs")
    @Operation(summary = "Journal d'audit des conventions (workflow tripartite étudiant/entreprise/tuteur)")
    public ResponseEntity<List<AuditConventionDto>> getAllAuditLogs() {
        return ResponseEntity.ok(auditConventionService.getAllAuditLogs());
    }

    /**
     * Résumé combiné pour le widget du tableau de bord.
     */
    @GetMapping("/audit-summary")
    @Operation(summary = "Résumé du journal d'audit pour le dashboard (compteurs + dernier événement)")
    public ResponseEntity<Map<String, Object>> getAuditSummary() {
        List<SystemAuditLogDto> allLogs = systemAuditLogService.getAllLogs();
        long recentCount = systemAuditLogService.countRecentActions(60);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalActions", allLogs.size());
        summary.put("actionsLastHour", recentCount);
        summary.put("dernierEvenement", allLogs.isEmpty() ? null : allLogs.get(0));
        return ResponseEntity.ok(summary);
    }

    // ─── Gestion Entreprises ─────────────────────────────────────────────────

    @GetMapping("/entreprises")
    @Operation(summary = "Liste des entreprises inscrites (filtrable par statut de validation)")
    public ResponseEntity<List<EntrepriseDto>> getEntreprises(@RequestParam(required = false) Boolean estValidee) {
        return ResponseEntity.ok(adminService.getEntreprises(estValidee));
    }

    @PutMapping("/entreprises/{id}/valider")
    @Operation(summary = "Valider ou désactiver un compte Entreprise partenaire")
    public ResponseEntity<EntrepriseDto> validerEntreprise(@PathVariable Long id, @RequestParam Boolean estValidee) {
        return ResponseEntity.ok(adminService.validerEntreprise(id, estValidee));
    }

    // ─── Gestion Tuteurs ─────────────────────────────────────────────────────

    @GetMapping("/tuteurs")
    @Operation(summary = "Liste des tuteurs académiques de l'Université")
    public ResponseEntity<List<TuteurDto>> getTuteurs() {
        return ResponseEntity.ok(adminService.getAllTuteurs());
    }

    @PostMapping("/tuteurs")
    @Operation(summary = "Création d'un nouveau compte Tuteur Académique")
    public ResponseEntity<TuteurDto> createTuteur(@RequestBody CreateTuteurRequest req) {
        TuteurDto created = adminService.createTuteur(
                req.getEmail(),
                req.getPassword(),
                req.getNom(),
                req.getPrenom(),
                req.getDepartement()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Data
    public static class CreateTuteurRequest {
        private String email;
        private String password;
        private String nom;
        private String prenom;
        private String departement;
    }
}
