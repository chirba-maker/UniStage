package gn.univlabe.unistage.domain.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluations_tuteur")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationTuteur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id", nullable = false, unique = true)
    private ConventionStage convention;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tuteur_id", nullable = false)
    private Tuteur tuteur;

    @Column(name = "note_qualite_travail")
    @Builder.Default
    private Integer noteQualiteTravail = 15;

    @Column(name = "note_autonomie")
    @Builder.Default
    private Integer noteAutonomie = 15;

    @Column(name = "note_assiduite")
    @Builder.Default
    private Integer noteAssiduite = 15;

    @Column(name = "note_integration")
    @Builder.Default
    private Integer noteIntegration = 15;

    @Column(name = "note_globale", precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal noteGlobale = new BigDecimal("15.00");

    @Column(name = "appreciation_globale", columnDefinition = "TEXT")
    private String appreciationGlobale;

    @Column(name = "fichier_evaluation_url")
    private String fichierEvaluationUrl;

    @Column(name = "date_evaluation", updatable = false)
    private LocalDateTime dateEvaluation;

    @PrePersist
    protected void onCreate() {
        if (this.dateEvaluation == null) {
            this.dateEvaluation = LocalDateTime.now();
        }
    }
}
