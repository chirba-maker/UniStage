package gn.univlabe.unistage.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitEvaluationDto {

    @NotNull
    @Min(0) @Max(20)
    private Integer noteQualiteTravail;

    @NotNull
    @Min(0) @Max(20)
    private Integer noteAutonomie;

    @NotNull
    @Min(0) @Max(20)
    private Integer noteAssiduite;

    @NotNull
    @Min(0) @Max(20)
    private Integer noteIntegration;

    private String appreciationGlobale;
}
