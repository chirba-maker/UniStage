package gn.univlabe.unistage.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitRapportDto {
    @NotBlank(message = "Le titre du rapport est obligatoire")
    private String titre;

    private String resume;
}
