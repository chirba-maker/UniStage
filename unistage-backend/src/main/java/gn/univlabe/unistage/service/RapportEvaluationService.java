package gn.univlabe.unistage.service;

import gn.univlabe.unistage.domain.entities.*;
import gn.univlabe.unistage.dto.*;
import gn.univlabe.unistage.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RapportEvaluationService {

    private final RapportStageRepository rapportStageRepository;
    private final EvaluationTuteurRepository evaluationTuteurRepository;
    private final ConventionStageRepository conventionStageRepository;
    private final EtudiantRepository etudiantRepository;
    private final TuteurRepository tuteurRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;
    private final AuditConventionService auditConventionService;

    // --- RAPPORT DE STAGE ---

    @Transactional
    public RapportStageDto submitRapport(Long conventionId, SubmitRapportDto dto, MultipartFile file, User studentUser) {
        Etudiant etudiant = etudiantRepository.findByUser(studentUser)
                .orElseThrow(() -> new RuntimeException("Profil étudiant non trouvé."));

        ConventionStage convention = conventionStageRepository.findById(conventionId)
                .orElseThrow(() -> new RuntimeException("Convention non trouvée."));

        if (!convention.getCandidature().getEtudiant().getId().equals(etudiant.getId())) {
            throw new RuntimeException("Seul l'étudiant concerné par la convention peut déposer son rapport.");
        }

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Le fichier PDF du rapport de stage est requis.");
        }

        String fileUrl = fileStorageService.storeFile(file, "rapports");

        RapportStage rapport = rapportStageRepository.findByConventionId(conventionId)
                .orElse(RapportStage.builder().convention(convention).etudiant(etudiant).build());

        rapport.setTitre(dto.getTitre());
        rapport.setResume(dto.getResume());
        rapport.setFichierUrl(fileUrl);
        rapport.setStatut("SOUMIS");

        RapportStage saved = rapportStageRepository.save(rapport);

        auditConventionService.logAction(
                convention,
                studentUser,
                etudiant.getPrenom() + " " + etudiant.getNom(),
                "ROLE_ETUDIANT",
                "DEPOT_RAPPORT_STAGE",
                "Dépôt du rapport de stage : '" + dto.getTitre() + "'"
        );

        if (convention.getTuteur() != null) {
            notificationService.createNotification(
                    convention.getTuteur().getUser(),
                    "Nouveau Rapport de Stage Déposé",
                    "L'étudiant " + etudiant.getPrenom() + " " + etudiant.getNom() + " a déposé son rapport de stage pour la convention N° " + convention.getId()
            );
        }

        return mapToRapportDto(saved);
    }

    @Transactional(readOnly = true)
    public Optional<RapportStageDto> getRapportByConvention(Long conventionId) {
        return rapportStageRepository.findByConventionId(conventionId)
                .map(this::mapToRapportDto);
    }

    // --- ÉVALUATION TUTEUR ---

    @Transactional
    public EvaluationTuteurDto submitEvaluation(Long conventionId, SubmitEvaluationDto dto, MultipartFile evaluationFile, User tuteurUser) {
        Tuteur tuteur = tuteurRepository.findByUser(tuteurUser)
                .orElseThrow(() -> new RuntimeException("Profil tuteur non trouvé."));

        ConventionStage convention = conventionStageRepository.findById(conventionId)
                .orElseThrow(() -> new RuntimeException("Convention non trouvée."));

        if (convention.getTuteur() == null || !convention.getTuteur().getId().equals(tuteur.getId())) {
            throw new RuntimeException("Seul le tuteur académique assigné peut évaluer ce stage.");
        }

        // Calcul de la note globale moyenne sur 20
        double average = (dto.getNoteQualiteTravail() + dto.getNoteAutonomie() + dto.getNoteAssiduite() + dto.getNoteIntegration()) / 4.0;
        BigDecimal noteGlobale = BigDecimal.valueOf(average).setScale(2, RoundingMode.HALF_UP);

        EvaluationTuteur eval = evaluationTuteurRepository.findByConventionId(conventionId)
                .orElse(EvaluationTuteur.builder().convention(convention).tuteur(tuteur).build());

        eval.setNoteQualiteTravail(dto.getNoteQualiteTravail());
        eval.setNoteAutonomie(dto.getNoteAutonomie());
        eval.setNoteAssiduite(dto.getNoteAssiduite());
        eval.setNoteIntegration(dto.getNoteIntegration());
        eval.setNoteGlobale(noteGlobale);
        eval.setAppreciationGlobale(dto.getAppreciationGlobale());

        if (evaluationFile != null && !evaluationFile.isEmpty()) {
            String fileUrl = fileStorageService.storeFile(evaluationFile, "evaluations");
            eval.setFichierEvaluationUrl(fileUrl);
        }

        EvaluationTuteur saved = evaluationTuteurRepository.save(eval);

        auditConventionService.logAction(
                convention,
                tuteurUser,
                tuteur.getPrenom() + " " + tuteur.getNom(),
                "ROLE_TUTEUR",
                "DEPOT_EVALUATION_TUTEUR",
                "Dépôt de la fiche d'évaluation du stage avec une note globale de " + noteGlobale + "/20"
        );

        notificationService.createNotification(
                convention.getCandidature().getEtudiant().getUser(),
                "Évaluation de Stage disponible",
                "Votre tuteur académique a déposé votre fiche d'évaluation de stage (Note globale: " + noteGlobale + "/20)."
        );

        return mapToEvaluationDto(saved);
    }

    @Transactional(readOnly = true)
    public Optional<EvaluationTuteurDto> getEvaluationByConvention(Long conventionId) {
        return evaluationTuteurRepository.findByConventionId(conventionId)
                .map(this::mapToEvaluationDto);
    }

    // --- MAPPING HELPERS ---

    public RapportStageDto mapToRapportDto(RapportStage r) {
        return RapportStageDto.builder()
                .id(r.getId())
                .conventionId(r.getConvention().getId())
                .etudiantId(r.getEtudiant().getId())
                .nomEtudiant(r.getEtudiant().getNom())
                .prenomEtudiant(r.getEtudiant().getPrenom())
                .titre(r.getTitre())
                .resume(r.getResume())
                .fichierUrl(r.getFichierUrl())
                .dateDepot(r.getDateDepot())
                .statut(r.getStatut())
                .build();
    }

    public EvaluationTuteurDto mapToEvaluationDto(EvaluationTuteur e) {
        return EvaluationTuteurDto.builder()
                .id(e.getId())
                .conventionId(e.getConvention().getId())
                .tuteurId(e.getTuteur().getId())
                .nomTuteur(e.getTuteur().getNom())
                .prenomTuteur(e.getTuteur().getPrenom())
                .noteQualiteTravail(e.getNoteQualiteTravail())
                .noteAutonomie(e.getNoteAutonomie())
                .noteAssiduite(e.getNoteAssiduite())
                .noteIntegration(e.getNoteIntegration())
                .noteGlobale(e.getNoteGlobale())
                .appreciationGlobale(e.getAppreciationGlobale())
                .fichierEvaluationUrl(e.getFichierEvaluationUrl())
                .dateEvaluation(e.getDateEvaluation())
                .build();
    }
}
