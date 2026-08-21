package gn.univlabe.unistage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationTuteurDto {
    private Long id;
    private Long conventionId;
    private Long tuteurId;
    private String nomTuteur;
    private String prenomTuteur;
    private Integer noteQualiteTravail;
    private Integer noteAutonomie;
    private Integer noteAssiduite;
    private Integer noteIntegration;
    private BigDecimal noteGlobale;
    private String appreciationGlobale;
    private String fichierEvaluationUrl;
    private LocalDateTime dateEvaluation;
}
