package gn.univlabe.unistage.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOffreDto {

    @NotBlank(message = "Le titre de l'offre est obligatoire")
    private String titre;

    @NotBlank(message = "La description de l'offre est obligatoire")
    private String description;

    @NotBlank(message = "Le lieu de stage est obligatoire")
    private String lieu;

    @NotNull(message = "La durée en mois est obligatoire")
    @Min(value = 1, message = "La durée minimale est de 1 mois")
    private Integer dureeMois;

    private BigDecimal gratification;
}
