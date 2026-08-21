package gn.univlabe.unistage.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileDto {
    private String nomComplet;
    private String email;
    private String photoUrl;
    private String telephone;
    private String filiere;
    private String adresse;
    private String departement;
    private String organisation;
}
