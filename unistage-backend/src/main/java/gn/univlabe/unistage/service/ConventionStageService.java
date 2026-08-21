package gn.univlabe.unistage.service;

import gn.univlabe.unistage.audit.AuditAction;
import gn.univlabe.unistage.domain.entities.*;
import gn.univlabe.unistage.domain.enums.StatutConventionEnum;
import gn.univlabe.unistage.dto.ConventionStageDto;
import gn.univlabe.unistage.dto.TuteurDto;
import gn.univlabe.unistage.dto.UpdateConventionDto;
import gn.univlabe.unistage.repository.ConventionStageRepository;
import gn.univlabe.unistage.repository.EntrepriseRepository;
import gn.univlabe.unistage.repository.EtudiantRepository;
import gn.univlabe.unistage.repository.TuteurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConventionStageService {

    private final ConventionStageRepository conventionStageRepository;
    private final EtudiantRepository etudiantRepository;
    private final EntrepriseRepository entrepriseRepository;
    private final TuteurRepository tuteurRepository;
    private final CandidatureService candidatureService;
    private final PdfGeneratorService pdfGeneratorService;
    private final FileStorageService fileStorageService;
    private final EmailSenderService emailSenderService;
    private final NotificationService notificationService;
    private final AuditConventionService auditConventionService;

    @Transactional
    @AuditAction(
        action = "CONVENTION_SOUMISE",
        entite = "ConventionStage",
        details = "L'étudiant a complété les termes de la convention (dates, missions) et l'a soumise pour validation tripartite"
    )
    public ConventionStageDto updateConventionDetails(Long conventionId, UpdateConventionDto dto) {
        ConventionStage convention = conventionStageRepository.findById(conventionId)
                .orElseThrow(() -> new RuntimeException("Convention de stage non trouvée."));

        convention.setDateDebut(dto.getDateDebut());
        convention.setDateFin(dto.getDateFin());
        convention.setMissions(dto.getMissions());
        if (dto.getGratification() != null) {
            convention.setGratification(dto.getGratification());
        }
        if (StatutConventionEnum.BROUILLON.equals(convention.getStatutValidation())) {
            convention.setStatutValidation(StatutConventionEnum.SOUMISE);
        }

        ConventionStage updated = conventionStageRepository.save(convention);
        auditConventionService.logAction(
                updated,
                convention.getCandidature().getEtudiant().getUser(),
                convention.getCandidature().getEtudiant().getPrenom() + " " + convention.getCandidature().getEtudiant().getNom(),
                "ROLE_ETUDIANT",
                "SOUMISSION_TERMES",
                "Mise à jour des dates et missions de la convention et soumission pour validation."
        );
        return mapToDto(updated);
    }

    @Transactional
    @AuditAction(
        action = "CONVENTION_VALIDEE_ENTREPRISE",
        entite = "ConventionStage",
        details = "L'entreprise a validé et signé électroniquement la convention de stage"
    )
    public ConventionStageDto validerParEntreprise(Long conventionId, User entrepriseUser) {
        Entreprise entreprise = entrepriseRepository.findByUser(entrepriseUser)
                .orElseThrow(() -> new RuntimeException("Profil entreprise non trouvé."));

        ConventionStage convention = conventionStageRepository.findById(conventionId)
                .orElseThrow(() -> new RuntimeException("Convention non trouvée."));

        if (!convention.getCandidature().getOffre().getEntreprise().getId().equals(entreprise.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à valider cette convention.");
        }

        convention.setStatutValidation(StatutConventionEnum.VALIDEE_ENTREPRISE);
        ConventionStage updated = conventionStageRepository.save(convention);

        auditConventionService.logAction(
                updated,
                entrepriseUser,
                entreprise.getNomEntreprise(),
                "ROLE_ENTREPRISE",
                "VALIDATION_ENTREPRISE",
                "L'entreprise a validé les termes et gratifications de la convention de stage."
        );

        notificationService.createNotification(
                convention.getCandidature().getEtudiant().getUser(),
                "Convention validée par l'Entreprise",
                "L'entreprise " + entreprise.getNomEntreprise() + " a validé les termes de votre convention de stage."
        );

        notificationService.notifyAllAdmins(
                "Convention à assigner",
                "L'entreprise " + entreprise.getNomEntreprise() + " a validé la convention #" + convention.getId() + " (Étudiant: " +
                        convention.getCandidature().getEtudiant().getNom() + " " + convention.getCandidature().getEtudiant().getPrenom() + "). Un tuteur doit être assigné."
        );

        return mapToDto(updated);
    }

    @Transactional
    @AuditAction(
        action = "TUTEUR_AFFECTE",
        entite = "ConventionStage",
        details = "L'administration a affecté un tuteur académique à la convention de stage"
    )
    public ConventionStageDto assignerTuteur(Long conventionId, Long tuteurId) {
        ConventionStage convention = conventionStageRepository.findById(conventionId)
                .orElseThrow(() -> new RuntimeException("Convention non trouvée."));

        Tuteur tuteur = tuteurRepository.findById(tuteurId)
                .orElseThrow(() -> new RuntimeException("Tuteur académique non trouvé."));

        convention.setTuteur(tuteur);
        ConventionStage updated = conventionStageRepository.save(convention);

        auditConventionService.logAction(
                updated,
                null,
                "Administration Université de Labé",
                "ROLE_ADMIN",
                "AFFECTATION_TUTEUR",
                "Affectation du tuteur académique " + tuteur.getPrenom() + " " + tuteur.getNom() + " (" + tuteur.getDepartement() + ")."
        );

        notificationService.createNotification(
                tuteur.getUser(),
                "Nouvelle convention assignée",
                "Vous avez été assigné comme tuteur académique pour l'étudiant " +
                        convention.getCandidature().getEtudiant().getNom() + " " + convention.getCandidature().getEtudiant().getPrenom()
        );

        return mapToDto(updated);
    }

    @Transactional
    @AuditAction(
        action = "CONVENTION_SIGNEE_FINALE",
        entite = "ConventionStage",
        details = "Le tuteur académique a validé et signé la convention — PDF officiel généré et envoyé par email"
    )
    public ConventionStageDto validerParTuteur(Long conventionId, User tuteurUser) {
        Tuteur tuteur = tuteurRepository.findByUser(tuteurUser)
                .orElseThrow(() -> new RuntimeException("Profil tuteur non trouvé."));

        ConventionStage convention = conventionStageRepository.findById(conventionId)
                .orElseThrow(() -> new RuntimeException("Convention non trouvée."));

        if (convention.getTuteur() == null || !convention.getTuteur().getId().equals(tuteur.getId())) {
            throw new RuntimeException("Vous n'êtes pas le tuteur académique assigné à cette convention.");
        }

        convention.setStatutValidation(StatutConventionEnum.SIGNEE_FINALE);

        // 1. Generate PDF
        byte[] pdfBytes = pdfGeneratorService.generateConventionPdf(convention);

        // 2. Save PDF file
        String pdfUrl = fileStorageService.storeBytes(pdfBytes, "conventions", "convention_" + convention.getId(), "pdf");
        convention.setPdfUrl(pdfUrl);

        ConventionStage finalConvention = conventionStageRepository.save(convention);

        auditConventionService.logAction(
                finalConvention,
                tuteurUser,
                tuteur.getPrenom() + " " + tuteur.getNom(),
                "ROLE_TUTEUR",
                "SIGNATURE_FINALE_TUTEUR",
                "Validation académique et signature officielle de la convention de stage."
        );

        // 3. Send email to Student and Enterprise
        String emailSubject = "UniStage — Convention de stage officielle N° " + convention.getId() + " SIGNÉE";
        String emailBody = "Bonjour,\n\nLa convention de stage pour " +
                convention.getCandidature().getEtudiant().getNom() + " " + convention.getCandidature().getEtudiant().getPrenom() +
                " auprès de " + convention.getCandidature().getOffre().getEntreprise().getNomEntreprise() +
                " a été validée par l'ensemble des 3 parties.\n\nVeuillez trouver la convention officielle ci-jointe au format PDF.\n\nCordialement,\nService des Stages — Université de Labé";

        emailSenderService.sendEmailWithAttachment(
                convention.getCandidature().getEtudiant().getUser().getEmail(),
                emailSubject, emailBody, pdfBytes, "convention_stage_" + convention.getId() + ".pdf"
        );

        emailSenderService.sendEmailWithAttachment(
                convention.getCandidature().getOffre().getEntreprise().getUser().getEmail(),
                emailSubject, emailBody, pdfBytes, "convention_stage_" + convention.getId() + ".pdf"
        );

        // 4. Notifications
        notificationService.createNotification(
                convention.getCandidature().getEtudiant().getUser(),
                "Convention Finale Signée et Disponible !",
                "Votre convention de stage N° " + convention.getId() + " a été signée par le tuteur. Le PDF est désormais disponible au téléchargement."
        );

        return mapToDto(finalConvention);
    }

    @Transactional(readOnly = true)
    public List<ConventionStageDto> getConventionsEtudiant(User studentUser) {
        Etudiant etudiant = etudiantRepository.findByUser(studentUser)
                .orElseThrow(() -> new RuntimeException("Profil étudiant non trouvé."));
        return conventionStageRepository.findByCandidatureEtudiantId(etudiant.getId())
                .stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public List<ConventionStageDto> getConventionsEntreprise(User entrepriseUser) {
        Entreprise entreprise = entrepriseRepository.findByUser(entrepriseUser)
                .orElseThrow(() -> new RuntimeException("Profil entreprise non trouvé."));
        return conventionStageRepository.findByCandidatureOffreEntrepriseId(entreprise.getId())
                .stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public List<ConventionStageDto> getConventionsTuteur(User tuteurUser) {
        Tuteur tuteur = tuteurRepository.findByUser(tuteurUser)
                .orElseThrow(() -> new RuntimeException("Profil tuteur non trouvé."));
        return conventionStageRepository.findByTuteurId(tuteur.getId())
                .stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public List<ConventionStageDto> getAllConventionsAdmin() {
        return conventionStageRepository.findAll()
                .stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public ConventionStageDto getConventionById(Long id) {
        ConventionStage convention = conventionStageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Convention non trouvée."));
        return mapToDto(convention);
    }

    @Transactional(readOnly = true)
    public byte[] generatePdfPreview(Long id) {
        ConventionStage convention = conventionStageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Convention non trouvée."));
        return pdfGeneratorService.generateConventionPdf(convention);
    }

    public ConventionStageDto mapToDto(ConventionStage conv) {
        TuteurDto tuteurDto = null;
        if (conv.getTuteur() != null) {
            Tuteur t = conv.getTuteur();
            tuteurDto = TuteurDto.builder()
                    .id(t.getId())
                    .utilisateurId(t.getUser().getId())
                    .email(t.getUser().getEmail())
                    .nom(t.getNom())
                    .prenom(t.getPrenom())
                    .departement(t.getDepartement())
                    .build();
        }

        return ConventionStageDto.builder()
                .id(conv.getId())
                .candidature(candidatureService.mapToDto(conv.getCandidature()))
                .tuteur(tuteurDto)
                .dateDebut(conv.getDateDebut())
                .dateFin(conv.getDateFin())
                .missions(conv.getMissions())
                .gratification(conv.getGratification())
                .statutValidation(conv.getStatutValidation())
                .pdfUrl(conv.getPdfUrl())
                .dateCreation(conv.getDateCreation())
                .build();
    }
}
