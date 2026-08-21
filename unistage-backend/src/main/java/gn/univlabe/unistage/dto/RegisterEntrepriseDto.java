package gn.univlabe.unistage.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterEntrepriseDto {

    @NotBlank(message = "L'adresse e-mail est obligatoire")
    @Email(message = "Format d'adresse e-mail invalide")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String password;

    @NotBlank(message = "Le nom de l'entreprise est obligatoire")
    private String nomEntreprise;

    private String rccmNif;

    @NotBlank(message = "Le secteur d'activité est obligatoire")
    private String secteurActivite;

    @NotBlank(message = "L'adresse est obligatoire")
    private String adresse;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    private String telephone;
}
