package gn.univlabe.unistage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RapportStageDto {
    private Long id;
    private Long conventionId;
    private Long etudiantId;
    private String nomEtudiant;
    private String prenomEtudiant;
    private String titre;
    private String resume;
    private String fichierUrl;
    private LocalDateTime dateDepot;
    private String statut;
}
