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
public class AuditConventionDto {
    private Long id;
    private Long conventionId;
    private Long utilisateurId;
    private String nomUtilisateur;
    private String roleUtilisateur;
    private String action;
    private String details;
    private LocalDateTime dateAction;
    private String ipAdresse;
}
