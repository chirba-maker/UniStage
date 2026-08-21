package gn.univlabe.unistage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TuteurDto {
    private Long id;
    private Long utilisateurId;
    private String email;
    private String nom;
    private String prenom;
    private String departement;
}
