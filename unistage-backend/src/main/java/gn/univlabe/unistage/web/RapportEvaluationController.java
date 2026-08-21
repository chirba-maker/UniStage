package gn.univlabe.unistage.web;

import gn.univlabe.unistage.domain.entities.User;
import gn.univlabe.unistage.dto.*;
import gn.univlabe.unistage.repository.UserRepository;
import gn.univlabe.unistage.service.RapportEvaluationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/conventions")
@RequiredArgsConstructor
@Tag(name = "Rapports & Évaluations", description = "Gestion des dépôts de rapports de stage et fiches d'évaluation des tuteurs")
public class RapportEvaluationController {

    private final RapportEvaluationService rapportEvaluationService;
    private final UserRepository userRepository;

    // --- RAPPORT DE STAGE ---

    @PostMapping(value = "/{id}/rapport", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ETUDIANT')")
    @Operation(summary = "Déposer le rapport de stage (Étudiant)")
    public ResponseEntity<RapportStageDto> submitRapport(
            @PathVariable Long id,
            @RequestPart("data") @Valid SubmitRapportDto dto,
            @RequestPart("file") MultipartFile file,
            Authentication auth
    ) {
        User user = getCurrentUser(auth);
        RapportStageDto result = rapportEvaluationService.submitRapport(id, dto, file, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping("/{id}/rapport")
    @Operation(summary = "Obtenir le rapport de stage déposé pour une convention")
    public ResponseEntity<RapportStageDto> getRapport(@PathVariable Long id) {
        return rapportEvaluationService.getRapportByConvention(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // --- ÉVALUATION TUTEUR ---

    @PostMapping(value = "/{id}/evaluation", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('TUTEUR')")
    @Operation(summary = "Déposer la fiche d'évaluation du stage (Tuteur)")
    public ResponseEntity<EvaluationTuteurDto> submitEvaluation(
            @PathVariable Long id,
            @RequestPart("data") @Valid SubmitEvaluationDto dto,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Authentication auth
    ) {
        User user = getCurrentUser(auth);
        EvaluationTuteurDto result = rapportEvaluationService.submitEvaluation(id, dto, file, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping("/{id}/evaluation")
    @Operation(summary = "Obtenir la fiche d'évaluation déposée par le tuteur pour une convention")
    public ResponseEntity<EvaluationTuteurDto> getEvaluation(@PathVariable Long id) {
        return rapportEvaluationService.getEvaluationByConvention(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private User getCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }
}
