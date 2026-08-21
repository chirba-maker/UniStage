package gn.univlabe.unistage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDto {
    private Double tauxPlacement;
    private Long totalEtudiants;
    private Long totalEtudiantsPlaces;
    private Long totalEntreprisesPartenaires;
    private Long totalOffresPubliees;
    private Long totalConventionsSignees;

    private Map<String, Long> repartitionParFiliere;
    private Map<String, Long> repartitionParEntreprise;
    private Map<String, Long> repartitionParStatutConvention;
    private Map<String, Long> repartitionParStatutCandidature;
    private Map<String, Long> offresParSecteur;
}
