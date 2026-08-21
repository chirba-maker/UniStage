package gn.univlabe.unistage.service;

import gn.univlabe.unistage.domain.entities.*;
import gn.univlabe.unistage.domain.enums.RoleEnum;
import gn.univlabe.unistage.dto.*;
import gn.univlabe.unistage.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final EntrepriseRepository entrepriseRepository;
    private final EtudiantRepository etudiantRepository;
    private final TuteurRepository tuteurRepository;
    private final UserRepository userRepository;
    private final OffreStageRepository offreStageRepository;
    private final CandidatureRepository candidatureRepository;
    private final ConventionStageRepository conventionStageRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    @Transactional
    public EntrepriseDto validerEntreprise(Long entrepriseId, Boolean estValidee) {
        Entreprise entreprise = entrepriseRepository.findById(entrepriseId)
                .orElseThrow(() -> new RuntimeException("Entreprise non trouvée"));

        entreprise.setEstValidee(estValidee);
        Entreprise updated = entrepriseRepository.save(entreprise);

        notificationService.createNotification(
                entreprise.getUser(),
                "Statut de votre compte Entreprise",
                estValidee
                        ? "Votre compte entreprise a été validé par l'administration. Vous pouvez désormais publier des offres de stage."
                        : "Votre compte entreprise n'est pas approuvé pour la publication d'offres."
        );

        return mapToEntrepriseDto(updated);
    }

    @Transactional(readOnly = true)
    public List<EntrepriseDto> getEntreprises(Boolean estValidee) {
        List<Entreprise> list = (estValidee != null)
                ? entrepriseRepository.findByEstValidee(estValidee)
                : entrepriseRepository.findAll();
        return list.stream().map(this::mapToEntrepriseDto).toList();
    }

    @Transactional(readOnly = true)
    public List<TuteurDto> getAllTuteurs() {
        return tuteurRepository.findAll().stream().map(this::mapToTuteurDto).toList();
    }

    @Transactional
    public TuteurDto createTuteur(String email, String password, String nom, String prenom, String departement) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Un utilisateur existe déjà avec cet e-mail.");
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(RoleEnum.ROLE_TUTEUR)
                .actif(true)
                .build();

        User savedUser = userRepository.save(user);

        Tuteur tuteur = Tuteur.builder()
                .user(savedUser)
                .nom(nom)
                .prenom(prenom)
                .departement(departement)
                .build();

        Tuteur savedTuteur = tuteurRepository.save(tuteur);
        return mapToTuteurDto(savedTuteur);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUtilisateurs", userRepository.count());
        stats.put("totalEtudiants", etudiantRepository.count());
        stats.put("totalEntreprises", entrepriseRepository.count());
        stats.put("totalTuteurs", tuteurRepository.count());
        stats.put("totalOffres", offreStageRepository.count());
        stats.put("totalCandidatures", candidatureRepository.count());
        stats.put("totalConventions", conventionStageRepository.count());
        return stats;
    }

    public EntrepriseDto mapToEntrepriseDto(Entreprise e) {
        return EntrepriseDto.builder()
                .id(e.getId())
                .utilisateurId(e.getUser().getId())
                .email(e.getUser().getEmail())
                .nomEntreprise(e.getNomEntreprise())
                .rccmNif(e.getRccmNif())
                .secteurActivite(e.getSecteurActivite())
                .adresse(e.getAdresse())
                .telephone(e.getTelephone())
                .logoUrl(e.getLogoUrl())
                .estValidee(e.getEstValidee())
                .build();
    }

    public TuteurDto mapToTuteurDto(Tuteur t) {
        return TuteurDto.builder()
                .id(t.getId())
                .utilisateurId(t.getUser().getId())
                .email(t.getUser().getEmail())
                .nom(t.getNom())
                .prenom(t.getPrenom())
                .departement(t.getDepartement())
                .build();
    }
}
