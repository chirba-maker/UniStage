package gn.univlabe.unistage.web;

import gn.univlabe.unistage.domain.entities.User;
import gn.univlabe.unistage.domain.enums.StatutOffreEnum;
import gn.univlabe.unistage.dto.CreateOffreDto;
import gn.univlabe.unistage.dto.OffreStageDto;
import gn.univlabe.unistage.repository.UserRepository;
import gn.univlabe.unistage.service.OffreStageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offres")
@RequiredArgsConstructor
public class OffreStageController {

    private final OffreStageService offreStageService;
    private final UserRepository userRepository;

    @GetMapping
    // Liste des offres publiques validées (recherche optionnelle)")
    public ResponseEntity<List<OffreStageDto>> getOffresPubliees(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(offreStageService.getOffresPubliees(search));
    }

    @GetMapping("/{slug}")
    // Détail d'une offre par son slug")
    public ResponseEntity<OffreStageDto> getOffreBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(offreStageService.getOffreBySlug(slug));
    }

    @PostMapping
    @PreAuthorize("hasRole('ENTREPRISE')")
    // Création d'une nouvelle offre de stage (Entreprise)")
    public ResponseEntity<OffreStageDto> createOffre(@Valid @RequestBody CreateOffreDto dto, Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(offreStageService.createOffre(dto, user));
    }

    @GetMapping("/mes-offres")
    @PreAuthorize("hasRole('ENTREPRISE')")
    // Liste des offres créées par l'entreprise connectée")
    public ResponseEntity<List<OffreStageDto>> getMesOffres(Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(offreStageService.getOffresMesEntreprises(user));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    // Liste complète de toutes les offres pour l'administration")
    public ResponseEntity<List<OffreStageDto>> getAllOffresAdmin() {
        return ResponseEntity.ok(offreStageService.getAllOffresAdmin());
    }

    @PutMapping("/{id}/valider")
    @PreAuthorize("hasRole('ADMIN')")
    // Modération/Validation d'une offre par l'admin")
    public ResponseEntity<OffreStageDto> validerOffre(@PathVariable Long id, @RequestParam StatutOffreEnum statut) {
        return ResponseEntity.ok(offreStageService.validerOffre(id, statut));
    }

    private User getCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }
}
