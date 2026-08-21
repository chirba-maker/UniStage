package gn.univlabe.unistage.dto;

import gn.univlabe.unistage.domain.enums.StatutConventionEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConventionStageDto {
    private Long id;
    private CandidatureDto candidature;
    private TuteurDto tuteur;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String missions;
    private BigDecimal gratification;
    private StatutConventionEnum statutValidation;
    private String pdfUrl;

    // Signatures Tripartites
    private LocalDateTime dateSignatureEtudiant;
    private String signatureEtudiantUrl;
    private LocalDateTime dateSignatureEntreprise;
    private String signatureEntrepriseUrl;
    private LocalDateTime dateSignatureTuteur;
    private String signatureTuteurUrl;

    private LocalDateTime dateCreation;
}
