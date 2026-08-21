package gn.univlabe.unistage.domain.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entité de journal d'audit système global.
 * Capture TOUTE action significative effectuée par n'importe quel utilisateur.
 * Alimentée automatiquement par le {@link gn.univlabe.unistage.audit.AuditAspect} via AOP.
 */
@Entity
@Table(
    name = "systeme_audit_logs",
    indexes = {
        @Index(name = "idx_sal_utilisateur", columnList = "utilisateur_id"),
        @Index(name = "idx_sal_date_action", columnList = "date_action"),
        @Index(name = "idx_sal_action", columnList = "action"),
        @Index(name = "idx_sal_entite", columnList = "entite, entite_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ─── Qui a effectué l'action ───────────────────────────────────────────
    @Column(name = "utilisateur_id")
    private Long utilisateurId;

    @Column(name = "nom_utilisateur", length = 200)
    private String nomUtilisateur;

    @Column(name = "email_utilisateur", length = 200)
    private String emailUtilisateur;

    @Column(name = "role_utilisateur", length = 50)
    private String roleUtilisateur;

    // ─── Quelle action ─────────────────────────────────────────────────────
    /** Ex: OFFRE_PUBLIEE, CANDIDATURE_SOUMISE, ENTREPRISE_VALIDEE, CONNEXION, etc. */
    @Column(nullable = false, length = 100)
    private String action;

    /** Description lisible de l'action pour affichage admin */
    @Column(columnDefinition = "TEXT")
    private String details;

    // ─── Sur quelle entité ─────────────────────────────────────────────────
    /** Ex: OffreStage, Candidature, Convention, Entreprise */
    @Column(length = 80)
    private String entite;

    @Column(name = "entite_id")
    private Long entiteId;

    // ─── Contexte technique ────────────────────────────────────────────────
    @Column(name = "ip_adresse", length = 50)
    private String ipAdresse;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "date_action", updatable = false)
    private LocalDateTime dateAction;

    // ─── Résultat de l'action ──────────────────────────────────────────────
    /** SUCCESS ou ERROR */
    @Column(length = 20)
    @Builder.Default
    private String statut = "SUCCESS";

    @Column(name = "message_erreur", columnDefinition = "TEXT")
    private String messageErreur;

    @PrePersist
    protected void onCreate() {
        if (this.dateAction == null) {
            this.dateAction = LocalDateTime.now();
        }
    }
}
