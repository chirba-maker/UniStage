package gn.univlabe.unistage.dto;

import gn.univlabe.unistage.domain.enums.StatutCandidatureEnum;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCandidatureStatutDto {

    @NotNull(message = "Le statut est obligatoire")
    private StatutCandidatureEnum statut;
}
