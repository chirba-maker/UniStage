package gn.univlabe.unistage.web;

import gn.univlabe.unistage.dto.TuteurDto;
import gn.univlabe.unistage.repository.TuteurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tuteurs")
@RequiredArgsConstructor
public class TuteurController {

    private final TuteurRepository tuteurRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TuteurDto>> getAllTuteurs() {
        List<TuteurDto> tuteurs = tuteurRepository.findAll().stream()
                .map(t -> TuteurDto.builder()
                        .id(t.getId())
                        .nom(t.getNom())
                        .prenom(t.getPrenom())
                        .departement(t.getDepartement())
                        .email(t.getUser().getEmail())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(tuteurs);
    }
}
