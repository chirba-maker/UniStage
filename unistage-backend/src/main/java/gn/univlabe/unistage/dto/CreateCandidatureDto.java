package gn.univlabe.unistage.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCandidatureDto {

    @NotNull(message = "L'ID de l'offre est obligatoire")
    private Long offreId;

    private String lettreMotivation;
}
