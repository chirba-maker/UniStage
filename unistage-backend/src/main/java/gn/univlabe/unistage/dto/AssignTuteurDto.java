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
public class AssignTuteurDto {

    @NotNull(message = "L'ID du tuteur est obligatoire")
    private Long tuteurId;
}
