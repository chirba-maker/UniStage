package gn.univlabe.unistage.dto;

import gn.univlabe.unistage.domain.enums.StatutCandidatureEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidatureDto {
    private Long id;
    private EtudiantDto etudiant;
    private OffreStageDto offre;
    private String lettreMotivation;
    private String cvUrl;
    private StatutCandidatureEnum statut;
    private LocalDateTime dateCandidature;
}
