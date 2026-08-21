package gn.univlabe.unistage.web;

import gn.univlabe.unistage.domain.entities.User;
import gn.univlabe.unistage.domain.enums.StatutCandidatureEnum;
import gn.univlabe.unistage.dto.CandidatureDto;
import gn.univlabe.unistage.dto.CreateCandidatureDto;
import gn.univlabe.unistage.repository.UserRepository;
import gn.univlabe.unistage.service.CandidatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/candidatures")
@RequiredArgsConstructor
public class CandidatureController {

    private final CandidatureService candidatureService;
    private final UserRepository userRepository;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ETUDIANT')")
    // Postuler à une offre de stage (avec téléversement optionnel du CV)")
    public ResponseEntity<CandidatureDto> postuler(
            @RequestParam("offreId") Long offreId,
            @RequestParam(value = "lettreMotivation", required = false) String lettreMotivation,
            @RequestPart(value = "cvFile", required = false) MultipartFile cvFile,
            Authentication auth) {

        User user = getCurrentUser(auth);
        CreateCandidatureDto dto = CreateCandidatureDto.builder()
                .offreId(offreId)
                .lettreMotivation(lettreMotivation)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(candidatureService.postuler(dto, cvFile, user));
    }

    @GetMapping("/mes-candidatures")
    @PreAuthorize("hasRole('ETUDIANT')")
    // Liste des candidatures de l'étudiant connecté")
    public ResponseEntity<List<CandidatureDto>> getMesCandidatures(Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(candidatureService.getMesCandidaturesEtudiant(user));
    }

    @GetMapping("/entreprise")
    @PreAuthorize("hasRole('ENTREPRISE')")
    // Liste des candidatures reçues par l'entreprise connectée")
    public ResponseEntity<List<CandidatureDto>> getCandidaturesEntreprise(Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(candidatureService.getCandidaturesForEntreprise(user));
    }

    @GetMapping("/{id}")
    // Obtenir le détail d'une candidature par ID")
    public ResponseEntity<CandidatureDto> getCandidatureById(@PathVariable Long id) {
        return ResponseEntity.ok(candidatureService.getCandidatureById(id));
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize("hasRole('ENTREPRISE')")
    // Changer le statut d'une candidature (ENTREPRISE)")
    public ResponseEntity<CandidatureDto> updateStatut(
            @PathVariable Long id,
            @RequestParam StatutCandidatureEnum statut,
            Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(candidatureService.updateStatut(id, statut, user));
    }

    private User getCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }
}
