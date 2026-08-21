package gn.univlabe.unistage.domain.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rapports_stage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RapportStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id", nullable = false, unique = true)
    private ConventionStage convention;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "etudiant_id", nullable = false)
    private Etudiant etudiant;

    @Column(nullable = false, length = 255)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String resume;

    @Column(name = "fichier_url", nullable = false, length = 255)
    private String fichierUrl;

    @Column(name = "date_depot", updatable = false)
    private LocalDateTime dateDepot;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String statut = "SOUMIS";

    @PrePersist
    protected void onCreate() {
        if (this.dateDepot == null) {
            this.dateDepot = LocalDateTime.now();
        }
    }
}
