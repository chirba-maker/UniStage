package gn.univlabe.unistage.web;

import gn.univlabe.unistage.dto.EntrepriseDto;
import gn.univlabe.unistage.dto.TuteurDto;
import gn.univlabe.unistage.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Administration", description = "Endpoints de gestion d'entreprise, affectation de tuteurs et statistiques")
public class AdminController {

    private final AdminService adminService;
    private final gn.univlabe.unistage.service.AnalyticsService analyticsService;

    @GetMapping("/stats")
    @Operation(summary = "Statistiques globales du tableau de bord d'administration")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/analytics")
    @Operation(summary = "Analytics & Statistiques poussées pour l'administration (Taux de placement, filières, entreprises)")
    public ResponseEntity<gn.univlabe.unistage.dto.AnalyticsDto> getAnalytics() {
        return ResponseEntity.ok(analyticsService.getAnalyticsDashboard());
    }

    @GetMapping("/entreprises")
    @Operation(summary = "Liste des entreprises inscrites (filtrable par statut de validation)")
    public ResponseEntity<List<EntrepriseDto>> getEntreprises(@RequestParam(required = false) Boolean estValidee) {
        return ResponseEntity.ok(adminService.getEntreprises(estValidee));
    }

    @PutMapping("/entreprises/{id}/valider")
    @Operation(summary = "Valider ou rejeter un compte Entreprise")
    public ResponseEntity<EntrepriseDto> validerEntreprise(@PathVariable Long id, @RequestParam Boolean estValidee) {
        return ResponseEntity.ok(adminService.validerEntreprise(id, estValidee));
    }

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
