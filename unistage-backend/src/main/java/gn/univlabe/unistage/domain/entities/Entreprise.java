package gn.univlabe.unistage.domain.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "entreprises")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Entreprise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "utilisateur_id", referencedColumnName = "id", nullable = false, unique = true)
    private User user;

    @Column(name = "nom_entreprise", nullable = false, length = 150)
    private String nomEntreprise;

    @Column(name = "rccm_nif", length = 50)
    private String rccmNif;

    @Column(name = "secteur_activite", nullable = false, length = 100)
    private String secteurActivite;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String adresse;

    @Column(nullable = false, length = 30)
    private String telephone;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "est_validee", nullable = false)
    @Builder.Default
    private Boolean estValidee = false;
}
