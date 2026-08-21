package gn.univlabe.unistage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntrepriseDto {
    private Long id;
    private Long utilisateurId;
    private String email;
    private String nomEntreprise;
    private String rccmNif;
    private String secteurActivite;
    private String adresse;
    private String telephone;
    private String logoUrl;
    private Boolean estValidee;
}
