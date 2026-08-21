package gn.univlabe.unistage.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * DTO de transfert pour un enregistrement du journal d'audit système global.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemAuditLogDto {

    private Long id;

    // ─── Auteur de l'action ───────────────────────────────────────────
    private Long utilisateurId;
    private String nomUtilisateur;
    private String emailUtilisateur;
    private String roleUtilisateur;

    // ─── Action ──────────────────────────────────────────────────────
    private String action;
    private String details;

    // ─── Entité cible ────────────────────────────────────────────────
    private String entite;
    private Long entiteId;

    // ─── Contexte ────────────────────────────────────────────────────
    private String ipAdresse;
    private LocalDateTime dateAction;
    private String statut;
    private String messageErreur;
}
