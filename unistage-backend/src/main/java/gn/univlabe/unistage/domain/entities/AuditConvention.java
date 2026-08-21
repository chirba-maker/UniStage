package gn.univlabe.unistage.domain.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_conventions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditConvention {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id", nullable = false)
    private ConventionStage convention;

    @Column(name = "utilisateur_id")
    private Long utilisateurId;

    @Column(name = "nom_utilisateur", length = 150)
    private String nomUtilisateur;

    @Column(name = "role_utilisateur", length = 50)
    private String roleUtilisateur;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "date_action", updatable = false)
    private LocalDateTime dateAction;

    @Column(name = "ip_adresse", length = 50)
    private String ipAdresse;

    @PrePersist
    protected void onCreate() {
        if (this.dateAction == null) {
            this.dateAction = LocalDateTime.now();
        }
    }
}
