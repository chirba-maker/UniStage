package gn.univlabe.unistage.domain.entities;

import gn.univlabe.unistage.domain.enums.StatutOffreEnum;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "offres_stage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OffreStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "entreprise_id", nullable = false)
    private Entreprise entreprise;

    @Column(nullable = false, length = 200)
    private String titre;

    @Column(nullable = false, unique = true, length = 220)
    private String slug;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 100)
    private String lieu;

    @Column(name = "duree_mois", nullable = false)
    private Integer dureeMois;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal gratification = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutOffreEnum statut = StatutOffreEnum.EN_ATTENTE_MODERATION;

    @Column(name = "date_publication", updatable = false)
    private LocalDateTime datePublication;

    @PrePersist
    protected void onCreate() {
        this.datePublication = LocalDateTime.now();
    }
}
