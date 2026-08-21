package gn.univlabe.unistage.dto;

import gn.univlabe.unistage.domain.enums.StatutOffreEnum;
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
public class OffreStageDto {
    private Long id;
    private Long entrepriseId;
    private String nomEntreprise;
    private String logoUrlEntreprise;
    private String titre;
    private String slug;
    private String description;
    private String lieu;
    private Integer dureeMois;
    private BigDecimal gratification;
    private StatutOffreEnum statut;
    private LocalDateTime datePublication;
}
