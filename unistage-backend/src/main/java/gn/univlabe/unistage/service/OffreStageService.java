package gn.univlabe.unistage.service;

import gn.univlabe.unistage.audit.AuditAction;
import gn.univlabe.unistage.domain.entities.Entreprise;
import gn.univlabe.unistage.domain.entities.OffreStage;
import gn.univlabe.unistage.domain.entities.User;
import gn.univlabe.unistage.domain.enums.StatutOffreEnum;
import gn.univlabe.unistage.dto.CreateOffreDto;
import gn.univlabe.unistage.dto.OffreStageDto;
import gn.univlabe.unistage.repository.EntrepriseRepository;
import gn.univlabe.unistage.repository.OffreStageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class OffreStageService {

    private final OffreStageRepository offreStageRepository;
    private final EntrepriseRepository entrepriseRepository;
    private final NotificationService notificationService;

    @Transactional
    @AuditAction(
        action = "OFFRE_CREEE",
        entite = "OffreStage",
        details = "Création d'une nouvelle offre de stage par une entreprise partenaire (en attente de modération admin)"
    )
    public OffreStageDto createOffre(CreateOffreDto dto, User entrepriseUser) {
        Entreprise entreprise = entrepriseRepository.findByUser(entrepriseUser)
                .orElseThrow(() -> new RuntimeException("Profil entreprise non trouvé"));

        if (!Boolean.TRUE.equals(entreprise.getEstValidee())) {
            throw new RuntimeException("Votre compte entreprise est en attente de validation par l'administration.");
        }

        String baseSlug = generateSlug(dto.getTitre());
        String uniqueSlug = baseSlug;
        int counter = 1;
        while (offreStageRepository.findBySlug(uniqueSlug).isPresent()) {
            uniqueSlug = baseSlug + "-" + counter++;
        }

        OffreStage offre = OffreStage.builder()
                .entreprise(entreprise)
                .titre(dto.getTitre())
                .slug(uniqueSlug)
                .description(dto.getDescription())
                .lieu(dto.getLieu())
                .dureeMois(dto.getDureeMois())
                .gratification(dto.getGratification())
                .statut(StatutOffreEnum.EN_ATTENTE_MODERATION)
                .build();

        OffreStage saved = offreStageRepository.save(offre);

        // Notifier les administrateurs qu'une nouvelle offre est en attente de modération
        notificationService.notifyAllAdmins(
                "Nouvelle offre à modérer",
                "L'entreprise '" + entreprise.getNomEntreprise() + "' a publié l'offre '" + offre.getTitre() + "' en attente de validation."
        );

        return mapToDto(saved);
    }

    @Transactional
    @AuditAction(
        action = "OFFRE_MODEREE",
        entite = "OffreStage",
        details = "Décision de modération administrative sur une offre de stage (Publier / Rejeter)"
    )
    public OffreStageDto validerOffre(Long id, StatutOffreEnum newStatut) {
        OffreStage offre = offreStageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offre de stage non trouvée"));
        offre.setStatut(newStatut);
        OffreStage updated = offreStageRepository.save(offre);

        // Notify enterprise
        notificationService.createNotification(
                offre.getEntreprise().getUser(),
                "Statut de votre offre mis à jour",
                "Votre offre '" + offre.getTitre() + "' a été passée au statut : " + newStatut
        );

        return mapToDto(updated);
    }

    @Transactional(readOnly = true)
    public List<OffreStageDto> getOffresPubliees(String search) {
        List<OffreStage> offres;
        if (StringUtils.hasText(search)) {
            offres = offreStageRepository.searchOffresPubliees(search);
        } else {
            offres = offreStageRepository.findByStatut(StatutOffreEnum.PUBLIEE);
        }
        return offres.stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public List<OffreStageDto> getOffresMesEntreprises(User entrepriseUser) {
        Entreprise entreprise = entrepriseRepository.findByUser(entrepriseUser)
                .orElseThrow(() -> new RuntimeException("Profil entreprise non trouvé"));
        return offreStageRepository.findByEntrepriseId(entreprise.getId())
                .stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public List<OffreStageDto> getAllOffresAdmin() {
        return offreStageRepository.findAll()
                .stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public OffreStageDto getOffreBySlug(String slug) {
        OffreStage offre = offreStageRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Offre non trouvée pour le slug: " + slug));
        return mapToDto(offre);
    }

    @Transactional(readOnly = true)
    public OffreStageDto getOffreById(Long id) {
        OffreStage offre = offreStageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offre non trouvée"));
        return mapToDto(offre);
    }

    public OffreStageDto mapToDto(OffreStage offre) {
        return OffreStageDto.builder()
                .id(offre.getId())
                .entrepriseId(offre.getEntreprise().getId())
                .nomEntreprise(offre.getEntreprise().getNomEntreprise())
                .logoUrlEntreprise(offre.getEntreprise().getLogoUrl())
                .titre(offre.getTitre())
                .slug(offre.getSlug())
                .description(offre.getDescription())
                .lieu(offre.getLieu())
                .dureeMois(offre.getDureeMois())
                .gratification(offre.getGratification())
                .statut(offre.getStatut())
                .datePublication(offre.getDatePublication())
                .build();
    }

    private String generateSlug(String input) {
        if (input == null) return "offre";
        String nowhitespace = input.replaceAll("\\s+", "-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = normalized.replaceAll("[^\\w-]", "");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
