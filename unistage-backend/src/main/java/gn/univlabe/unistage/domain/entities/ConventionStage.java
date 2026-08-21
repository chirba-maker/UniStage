package gn.univlabe.unistage.domain.entities;

import gn.univlabe.unistage.domain.enums.StatutConventionEnum;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "conventions_stage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConventionStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "candidature_id", nullable = false, unique = true)
    private Candidature candidature;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tuteur_id")
    private Tuteur tuteur;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDate dateFin;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String missions;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal gratification = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_validation", nullable = false)
    @Builder.Default
    private StatutConventionEnum statutValidation = StatutConventionEnum.BROUILLON;

    @Column(name = "pdf_url")
    private String pdfUrl;

    // ─── Signatures Tripartites ──────────────────────────────────────────────
    @Column(name = "date_signature_etudiant")
    private LocalDateTime dateSignatureEtudiant;

    @Column(name = "signature_etudiant_url", columnDefinition = "TEXT")
    private String signatureEtudiantUrl;

    @Column(name = "date_signature_entreprise")
    private LocalDateTime dateSignatureEntreprise;

    @Column(name = "signature_entreprise_url", columnDefinition = "TEXT")
    private String signatureEntrepriseUrl;

    @Column(name = "date_signature_tuteur")
    private LocalDateTime dateSignatureTuteur;

    @Column(name = "signature_tuteur_url", columnDefinition = "TEXT")
    private String signatureTuteurUrl;

    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
    }
}
