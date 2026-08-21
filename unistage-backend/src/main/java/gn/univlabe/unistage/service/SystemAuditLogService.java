package gn.univlabe.unistage.service;

import gn.univlabe.unistage.domain.entities.SystemAuditLog;
import gn.univlabe.unistage.dto.SystemAuditLogDto;
import gn.univlabe.unistage.repository.SystemAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service de gestion du journal d'audit système global.
 *
 * <p>Les enregistrements sont écrits de façon <strong>asynchrone</strong>
 * (via {@code @Async}) et dans une transaction indépendante ({@code REQUIRES_NEW})
 * pour que l'audit ne bloque jamais l'action principale et ne soit pas
 * annulé si cette action échoue.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SystemAuditLogService {

    private final SystemAuditLogRepository systemAuditLogRepository;

    /**
     * Enregistre une action dans le journal d'audit système.
     * Méthode appelée depuis {@link gn.univlabe.unistage.audit.AuditAspect}.
     *
     * @param utilisateurId  ID de l'utilisateur (peut être null pour des actions système)
     * @param nomUtilisateur Nom affiché de l'utilisateur
     * @param emailUtilisateur Email de l'utilisateur
     * @param roleUtilisateur Rôle (ROLE_ADMIN, ROLE_ETUDIANT, etc.)
     * @param action Code de l'action (ex: OFFRE_PUBLIEE)
     * @param details Description lisible de l'action
     * @param entite Nom de l'entité concernée (ex: OffreStage)
     * @param entiteId ID de l'entité concernée
     * @param ipAdresse Adresse IP de la requête
     * @param statut SUCCESS ou ERROR
     * @param messageErreur Message d'erreur si statut=ERROR
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(
            Long utilisateurId,
            String nomUtilisateur,
            String emailUtilisateur,
            String roleUtilisateur,
            String action,
            String details,
            String entite,
            Long entiteId,
            String ipAdresse,
            String statut,
            String messageErreur
    ) {
        try {
            SystemAuditLog auditLog = SystemAuditLog.builder()
                    .utilisateurId(utilisateurId)
                    .nomUtilisateur(nomUtilisateur)
                    .emailUtilisateur(emailUtilisateur)
                    .roleUtilisateur(roleUtilisateur)
                    .action(action)
                    .details(details)
                    .entite(entite)
                    .entiteId(entiteId)
                    .ipAdresse(ipAdresse)
                    .statut(statut != null ? statut : "SUCCESS")
                    .messageErreur(messageErreur)
                    .dateAction(LocalDateTime.now())
                    .build();

            systemAuditLogRepository.save(auditLog);

            log.debug("[AUDIT] {} | {} | {} | entite={} id={} | statut={}",
                    action, nomUtilisateur, roleUtilisateur, entite, entiteId, statut);

        } catch (Exception e) {
            // Ne jamais bloquer l'action principale en cas d'erreur d'audit
            log.error("[AUDIT] Erreur lors de l'enregistrement du log d'audit: action={}, utilisateur={}", action, emailUtilisateur, e);
        }
    }

    // ─── Méthodes de lecture ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<SystemAuditLogDto> getAllLogs() {
        return systemAuditLogRepository.findAllByOrderByDateActionDesc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SystemAuditLogDto> getLogsByUser(Long userId) {
        return systemAuditLogRepository.findByUtilisateurIdOrderByDateActionDesc(userId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SystemAuditLogDto> getLogsByEntite(String entite, Long entiteId) {
        return systemAuditLogRepository.findByEntiteAndEntiteIdOrderByDateActionDesc(entite, entiteId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public long countRecentActions(int minutes) {
        return systemAuditLogRepository.countRecentActions(LocalDateTime.now().minusMinutes(minutes));
    }

    // ─── Mapping ─────────────────────────────────────────────────────────────

    private SystemAuditLogDto toDto(SystemAuditLog log) {
        return SystemAuditLogDto.builder()
                .id(log.getId())
                .utilisateurId(log.getUtilisateurId())
                .nomUtilisateur(log.getNomUtilisateur())
                .emailUtilisateur(log.getEmailUtilisateur())
                .roleUtilisateur(log.getRoleUtilisateur())
                .action(log.getAction())
                .details(log.getDetails())
                .entite(log.getEntite())
                .entiteId(log.getEntiteId())
                .ipAdresse(log.getIpAdresse())
                .dateAction(log.getDateAction())
                .statut(log.getStatut())
                .messageErreur(log.getMessageErreur())
                .build();
    }
}
