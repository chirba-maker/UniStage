package gn.univlabe.unistage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EtudiantDto {
    private Long id;
    private Long utilisateurId;
    private String email;
    private String matricule;
    private String nom;
    private String prenom;
    private String filiere;
    private String niveau;
    private String cvUrl;
}
