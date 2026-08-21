package gn.univlabe.unistage.service;

import gn.univlabe.unistage.domain.entities.*;
import gn.univlabe.unistage.domain.enums.StatutCandidatureEnum;
import gn.univlabe.unistage.domain.enums.StatutConventionEnum;
import gn.univlabe.unistage.domain.enums.StatutOffreEnum;
import gn.univlabe.unistage.dto.CandidatureDto;
import gn.univlabe.unistage.dto.CreateCandidatureDto;
import gn.univlabe.unistage.dto.EtudiantDto;
import gn.univlabe.unistage.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CandidatureService {

    private final CandidatureRepository candidatureRepository;
    private final OffreStageRepository offreStageRepository;
    private final EtudiantRepository etudiantRepository;
    private final EntrepriseRepository entrepriseRepository;
    private final ConventionStageRepository conventionStageRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;
    private final OffreStageService offreStageService;

    @Transactional
    public CandidatureDto postuler(CreateCandidatureDto dto, MultipartFile cvFile, User studentUser) {
        Etudiant etudiant = etudiantRepository.findByUser(studentUser)
                .orElseThrow(() -> new RuntimeException("Profil étudiant non trouvé."));

        OffreStage offre = offreStageRepository.findById(dto.getOffreId())
                .orElseThrow(() -> new RuntimeException("Offre de stage non trouvée."));

        if (!StatutOffreEnum.PUBLIEE.equals(offre.getStatut())) {
            throw new RuntimeException("Cette offre n'est plus ouverte aux candidatures.");
        }

        if (candidatureRepository.existsByEtudiantIdAndOffreId(etudiant.getId(), offre.getId())) {
            throw new RuntimeException("Vous avez déjà postulé à cette offre de stage.");
        }

        String cvUrl = etudiant.getCvUrl();
        if (cvFile != null && !cvFile.isEmpty()) {
            cvUrl = fileStorageService.storeFile(cvFile, "cvs");
            etudiant.setCvUrl(cvUrl);
            etudiantRepository.save(etudiant);
        }

        Candidature candidature = Candidature.builder()
                .etudiant(etudiant)
                .offre(offre)
                .lettreMotivation(dto.getLettreMotivation())
                .cvUrl(cvUrl)
                .statut(StatutCandidatureEnum.SOUMISE)
                .build();

        Candidature saved = candidatureRepository.save(candidature);

        // Notify enterprise
        notificationService.createNotification(
                offre.getEntreprise().getUser(),
                "Nouvelle candidature reçue",
                "L'étudiant " + etudiant.getNom() + " " + etudiant.getPrenom() + " a postulé à votre offre '" + offre.getTitre() + "'."
        );

        return mapToDto(saved);
    }

    @Transactional
    public CandidatureDto updateStatut(Long candidatureId, StatutCandidatureEnum newStatut, User entrepriseUser) {
        Entreprise entreprise = entrepriseRepository.findByUser(entrepriseUser)
                .orElseThrow(() -> new RuntimeException("Profil entreprise non trouvé."));

        Candidature candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new RuntimeException("Candidature non trouvée."));

        if (!candidature.getOffre().getEntreprise().getId().equals(entreprise.getId())) {
            throw new RuntimeException("Action non autorisée sur cette candidature.");
        }

        candidature.setStatut(newStatut);
        Candidature updated = candidatureRepository.save(candidature);

        // Notify student
        notificationService.createNotification(
                candidature.getEtudiant().getUser(),
                "Mise à jour de votre candidature",
                "Votre candidature pour l'offre '" + candidature.getOffre().getTitre() + "' est passée au statut : " + newStatut
        );

        // Automatique convention creation if RETENUE
        if (StatutCandidatureEnum.RETENUE.equals(newStatut)) {
            if (conventionStageRepository.findByCandidatureId(candidature.getId()).isEmpty()) {
                LocalDate now = LocalDate.now();
                LocalDate fin = now.plusMonths(candidature.getOffre().getDureeMois());

                ConventionStage convention = ConventionStage.builder()
                        .candidature(candidature)
                        .dateDebut(now)
                        .dateFin(fin)
                        .missions(candidature.getOffre().getDescription())
                        .gratification(candidature.getOffre().getGratification())
                        .statutValidation(StatutConventionEnum.BROUILLON)
                        .build();

                conventionStageRepository.save(convention);

                notificationService.createNotification(
                        candidature.getEtudiant().getUser(),
                        "Convention de stage générée !",
                        "Félicitations ! Votre candidature est retenue. La convention de stage a été créée en mode brouillon."
                );
            }
        }

        return mapToDto(updated);
    }

    @Transactional(readOnly = true)
    public List<CandidatureDto> getMesCandidaturesEtudiant(User studentUser) {
        Etudiant etudiant = etudiantRepository.findByUser(studentUser)
                .orElseThrow(() -> new RuntimeException("Profil étudiant non trouvé."));

        return candidatureRepository.findByEtudiantId(etudiant.getId())
                .stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public List<CandidatureDto> getCandidaturesForEntreprise(User entrepriseUser) {
        Entreprise entreprise = entrepriseRepository.findByUser(entrepriseUser)
                .orElseThrow(() -> new RuntimeException("Profil entreprise non trouvé."));

        return candidatureRepository.findByOffreEntrepriseId(entreprise.getId())
                .stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public CandidatureDto getCandidatureById(Long id) {
        Candidature candidature = candidatureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidature non trouvée."));
        return mapToDto(candidature);
    }

    public CandidatureDto mapToDto(Candidature c) {
        Etudiant e = c.getEtudiant();
        EtudiantDto etudiantDto = EtudiantDto.builder()
                .id(e.getId())
                .utilisateurId(e.getUser().getId())
                .email(e.getUser().getEmail())
                .matricule(e.getMatricule())
                .nom(e.getNom())
                .prenom(e.getPrenom())
                .filiere(e.getFiliere())
                .niveau(e.getNiveau())
                .cvUrl(e.getCvUrl())
                .build();

        return CandidatureDto.builder()
                .id(c.getId())
                .etudiant(etudiantDto)
                .offre(offreStageService.mapToDto(c.getOffre()))
                .lettreMotivation(c.getLettreMotivation())
                .cvUrl(c.getCvUrl())
                .statut(c.getStatut())
                .dateCandidature(c.getDateCandidature())
                .build();
    }
}
