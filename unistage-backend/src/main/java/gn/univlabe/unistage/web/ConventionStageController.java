package gn.univlabe.unistage.web;

import gn.univlabe.unistage.domain.entities.User;
import gn.univlabe.unistage.dto.AssignTuteurDto;
import gn.univlabe.unistage.dto.ConventionStageDto;
import gn.univlabe.unistage.dto.UpdateConventionDto;
import gn.univlabe.unistage.repository.UserRepository;
import gn.univlabe.unistage.service.ConventionStageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conventions")
@RequiredArgsConstructor
public class ConventionStageController {

    private final ConventionStageService conventionStageService;
    private final gn.univlabe.unistage.service.AuditConventionService auditConventionService;
    private final UserRepository userRepository;

    @GetMapping("/mes-conventions")
    @PreAuthorize("hasRole('ETUDIANT')")
    public ResponseEntity<List<ConventionStageDto>> getMesConventions(Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(conventionStageService.getConventionsEtudiant(user));
    }

    @GetMapping("/entreprise")
    @PreAuthorize("hasRole('ENTREPRISE')")
    public ResponseEntity<List<ConventionStageDto>> getConventionsEntreprise(Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(conventionStageService.getConventionsEntreprise(user));
    }

    @GetMapping("/tuteur")
    @PreAuthorize("hasRole('TUTEUR')")
    public ResponseEntity<List<ConventionStageDto>> getConventionsTuteur(Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(conventionStageService.getConventionsTuteur(user));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ConventionStageDto>> getAllConventionsAdmin() {
        return ResponseEntity.ok(conventionStageService.getAllConventionsAdmin());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConventionStageDto> getConventionById(@PathVariable Long id) {
        return ResponseEntity.ok(conventionStageService.getConventionById(id));
    }

    @GetMapping("/{id}/audit-trail")
    public ResponseEntity<List<gn.univlabe.unistage.dto.AuditConventionDto>> getAuditTrail(@PathVariable Long id) {
        return ResponseEntity.ok(auditConventionService.getAuditTrail(id));
    }

    @GetMapping("/{id}/preview-pdf")
    public ResponseEntity<byte[]> previewPdf(@PathVariable Long id) {
        byte[] pdfBytes = conventionStageService.generatePdfPreview(id);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"convention_preview_" + id + ".pdf\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConventionStageDto> updateConventionDetails(@PathVariable Long id, @Valid @RequestBody UpdateConventionDto dto) {
        return ResponseEntity.ok(conventionStageService.updateConventionDetails(id, dto));
    }

    @PutMapping("/{id}/valider-entreprise")
    @PreAuthorize("hasRole('ENTREPRISE')")
    public ResponseEntity<ConventionStageDto> validerEntreprise(@PathVariable Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(conventionStageService.validerParEntreprise(id, user));
    }

    @PutMapping("/{id}/assigner-tuteur")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConventionStageDto> assignerTuteur(@PathVariable Long id, @Valid @RequestBody AssignTuteurDto dto) {
        return ResponseEntity.ok(conventionStageService.assignerTuteur(id, dto.getTuteurId()));
    }

    @PutMapping("/{id}/valider-tuteur")
    @PreAuthorize("hasRole('TUTEUR')")
    public ResponseEntity<ConventionStageDto> validerTuteur(@PathVariable Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(conventionStageService.validerParTuteur(id, user));
    }

    private User getCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }
}
