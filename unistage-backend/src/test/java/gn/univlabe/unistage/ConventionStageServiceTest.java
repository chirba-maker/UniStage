package gn.univlabe.unistage;

import gn.univlabe.unistage.domain.entities.*;
import gn.univlabe.unistage.domain.enums.RoleEnum;
import gn.univlabe.unistage.domain.enums.StatutConventionEnum;
import gn.univlabe.unistage.repository.*;
import gn.univlabe.unistage.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests du cycle de vie d'une ConventionStage")
class ConventionStageServiceTest {

    @Mock private ConventionStageRepository conventionStageRepository;
    @Mock private EtudiantRepository etudiantRepository;
    @Mock private EntrepriseRepository entrepriseRepository;
    @Mock private TuteurRepository tuteurRepository;
    @Mock private CandidatureService candidatureService;
    @Mock private PdfGeneratorService pdfGeneratorService;
    @Mock private FileStorageService fileStorageService;
    @Mock private EmailSenderService emailSenderService;
    @Mock private NotificationService notificationService;
    @Mock private AuditConventionService auditConventionService;

    @InjectMocks
    private ConventionStageService conventionStageService;

    // ---- Fixtures ----
    private User userEntreprise;
    private User userTuteur;
    private User userEtudiant;
    private Entreprise entreprise;
    private Tuteur tuteur;
    private Etudiant etudiant;
    private OffreStage offre;
    private Candidature candidature;
    private ConventionStage convention;

    @BeforeEach
    void setUp() {
        userEntreprise = User.builder().id(1L).email("ent@test.com")
                .role(RoleEnum.ROLE_ENTREPRISE).actif(true).build();
        userTuteur = User.builder().id(2L).email("tut@test.com")
                .role(RoleEnum.ROLE_TUTEUR).actif(true).build();
        userEtudiant = User.builder().id(3L).email("etu@test.com")
                .role(RoleEnum.ROLE_ETUDIANT).actif(true).build();

        entreprise = Entreprise.builder().id(10L).nomEntreprise("Tech Labé SA")
                .user(userEntreprise).estValidee(true).build();
        tuteur = Tuteur.builder().id(20L).nom("Diallo").prenom("Alpha")
                .departement("Informatique").user(userTuteur).build();
        etudiant = Etudiant.builder().id(30L).nom("Bah").prenom("Mamadou")
                .matricule("ETU001").user(userEtudiant).build();

        offre = OffreStage.builder().id(100L).titre("Stage Dev Backend")
                .entreprise(entreprise).build();
        candidature = Candidature.builder().id(200L).offre(offre).etudiant(etudiant).build();

        convention = ConventionStage.builder()
                .id(1L)
                .candidature(candidature)
                .dateDebut(LocalDate.of(2026, 9, 1))
                .dateFin(LocalDate.of(2026, 12, 31))
                .missions("Développement API REST Spring Boot")
                .gratification(BigDecimal.valueOf(150_000))
                .statutValidation(StatutConventionEnum.BROUILLON)
                .build();
    }

    // =========================================================
    // Test 1 : updateConventionDetails() — BROUILLON → SOUMISE
    // =========================================================
    @Test
    @DisplayName("updateConventionDetails: statut passe de BROUILLON à SOUMISE")
    void testUpdateConventionDetails_ChangesStatusToSoumise() {
        gn.univlabe.unistage.dto.UpdateConventionDto dto =
                gn.univlabe.unistage.dto.UpdateConventionDto.builder()
                        .dateDebut(LocalDate.of(2026, 9, 1))
                        .dateFin(LocalDate.of(2026, 12, 31))
                        .missions("Développement microservices")
                        .gratification(BigDecimal.valueOf(200_000))
                        .build();

        when(conventionStageRepository.findById(1L)).thenReturn(Optional.of(convention));
        when(conventionStageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(candidatureService.mapToDto(any())).thenReturn(null);

        conventionStageService.updateConventionDetails(1L, dto);

        verify(conventionStageRepository).save(argThat(
                c -> c.getStatutValidation() == StatutConventionEnum.SOUMISE
        ));
        verify(auditConventionService).logAction(any(), any(), anyString(), anyString(),
                eq("SOUMISSION_TERMES"), anyString());
    }

    // =========================================================
    // Test 2 : validerParEntreprise() — SOUMISE → VALIDEE_ENTREPRISE
    // =========================================================
    @Test
    @DisplayName("validerParEntreprise: statut passe à VALIDEE_ENTREPRISE pour la bonne entreprise")
    void testValiderParEntreprise_Success() {
        convention.setStatutValidation(StatutConventionEnum.SOUMISE);

        when(entrepriseRepository.findByUser(userEntreprise)).thenReturn(Optional.of(entreprise));
        when(conventionStageRepository.findById(1L)).thenReturn(Optional.of(convention));
        when(conventionStageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(candidatureService.mapToDto(any())).thenReturn(null);

        conventionStageService.validerParEntreprise(1L, userEntreprise);

        verify(conventionStageRepository).save(argThat(
                c -> c.getStatutValidation() == StatutConventionEnum.VALIDEE_ENTREPRISE
        ));
        verify(notificationService).createNotification(eq(userEtudiant), anyString(), anyString());
        verify(notificationService).notifyAllAdmins(anyString(), anyString());
    }

    // =========================================================
    // Test 3 : validerParEntreprise() — Mauvaise entreprise → Exception
    // =========================================================
    @Test
    @DisplayName("validerParEntreprise: lève RuntimeException si entreprise non autorisée")
    void testValiderParEntreprise_WrongEntreprise_ThrowsException() {
        User autreUser = User.builder().id(99L).email("autre@test.com")
                .role(RoleEnum.ROLE_ENTREPRISE).actif(true).build();
        Entreprise autreEntreprise = Entreprise.builder().id(99L).nomEntreprise("Autre SA")
                .user(autreUser).estValidee(true).build();

        when(entrepriseRepository.findByUser(autreUser)).thenReturn(Optional.of(autreEntreprise));
        when(conventionStageRepository.findById(1L)).thenReturn(Optional.of(convention));

        assertThatThrownBy(() -> conventionStageService.validerParEntreprise(1L, autreUser))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("autorisé");
    }

    // =========================================================
    // Test 4 : validerParTuteur() — VALIDEE_ENTREPRISE → SIGNEE_FINALE + PDF
    // =========================================================
    @Test
    @DisplayName("validerParTuteur: génère le PDF et passe le statut à SIGNEE_FINALE")
    void testValiderParTuteur_GeneratesPdfAndSetsStatusFinal() {
        convention.setStatutValidation(StatutConventionEnum.VALIDEE_ENTREPRISE);
        convention.setTuteur(tuteur);
        byte[] fakePdf = "PDF_CONTENT".getBytes();

        when(tuteurRepository.findByUser(userTuteur)).thenReturn(Optional.of(tuteur));
        when(conventionStageRepository.findById(1L)).thenReturn(Optional.of(convention));
        when(conventionStageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(pdfGeneratorService.generateConventionPdf(any())).thenReturn(fakePdf);
        when(fileStorageService.storeBytes(any(), anyString(), anyString(), anyString()))
                .thenReturn("/uploads/conventions/convention_1.pdf");
        when(candidatureService.mapToDto(any())).thenReturn(null);

        conventionStageService.validerParTuteur(1L, userTuteur);

        verify(pdfGeneratorService).generateConventionPdf(any());
        verify(fileStorageService).storeBytes(eq(fakePdf), anyString(), anyString(), anyString());
        // Email envoyé à l'étudiant ET à l'entreprise
        verify(emailSenderService, times(2)).sendEmailWithAttachment(
                anyString(), anyString(), anyString(), eq(fakePdf), anyString());
        verify(conventionStageRepository).save(argThat(
                c -> c.getStatutValidation() == StatutConventionEnum.SIGNEE_FINALE
        ));
    }

    // =========================================================
    // Test 5 : validerParTuteur() — Mauvais tuteur → Exception
    // =========================================================
    @Test
    @DisplayName("validerParTuteur: lève RuntimeException si tuteur non assigné à la convention")
    void testValiderParTuteur_WrongTuteur_ThrowsException() {
        User autreTuteurUser = User.builder().id(50L).email("autre.tut@test.com")
                .role(RoleEnum.ROLE_TUTEUR).actif(true).build();
        Tuteur autreTuteur = Tuteur.builder().id(50L).nom("Other").prenom("Tut")
                .user(autreTuteurUser).build();

        // La convention a le tuteur original, pas autreTuteur
        convention.setTuteur(tuteur);

        when(tuteurRepository.findByUser(autreTuteurUser)).thenReturn(Optional.of(autreTuteur));
        when(conventionStageRepository.findById(1L)).thenReturn(Optional.of(convention));

        assertThatThrownBy(() -> conventionStageService.validerParTuteur(1L, autreTuteurUser))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("tuteur académique assigné");
    }
}
