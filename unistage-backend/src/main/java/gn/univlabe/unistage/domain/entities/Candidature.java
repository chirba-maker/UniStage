package gn.univlabe.unistage.domain.entities;

import gn.univlabe.unistage.domain.enums.StatutCandidatureEnum;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "candidatures", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"etudiant_id", "offre_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Candidature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "etudiant_id", nullable = false)
    private Etudiant etudiant;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "offre_id", nullable = false)
    private OffreStage offre;

    @Column(name = "lettre_motivation", columnDefinition = "TEXT")
    private String lettreMotivation;

    @Column(name = "cv_url")
    private String cvUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutCandidatureEnum statut = StatutCandidatureEnum.SOUMISE;

    @Column(name = "date_candidature", updatable = false)
    private LocalDateTime dateCandidature;

    @PrePersist
    protected void onCreate() {
        this.dateCandidature = LocalDateTime.now();
    }
}
