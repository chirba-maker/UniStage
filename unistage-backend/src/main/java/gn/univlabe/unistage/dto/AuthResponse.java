package gn.univlabe.unistage.dto;

import gn.univlabe.unistage.domain.enums.RoleEnum;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long userId;
    private String email;
    private RoleEnum role;
    private String nomComplet;
    private String photoUrl;
    private String telephone;
    private String filiere;
    private String adresse;
    private String departement;
    private String organisation;
}
