package gn.univlabe.unistage.audit;

import gn.univlabe.unistage.domain.entities.User;
import gn.univlabe.unistage.service.SystemAuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Aspect AOP qui intercepte toutes les méthodes annotées avec {@link AuditAction}
 * et enregistre automatiquement l'action dans le journal d'audit système.
 *
 * <p><b>Fonctionnement :</b>
 * <ol>
 *   <li>Récupère l'utilisateur connecté depuis le {@code SecurityContext}</li>
 *   <li>Extrait l'adresse IP de la requête HTTP</li>
 *   <li>Exécute la méthode métier normalement</li>
 *   <li>En cas de succès → log SUCCESS asynchrone</li>
 *   <li>En cas d'exception → log ERROR asynchrone (si auditErrors=true)</li>
 * </ol>
 * </p>
 */
@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditAspect {

    private final SystemAuditLogService systemAuditLogService;

    /**
     * Intercepte toutes les méthodes annotées {@literal @}AuditAction dans le package service.
     */
    @Around("@annotation(auditAction)")
    public Object auditMethod(ProceedingJoinPoint joinPoint, AuditAction auditAction) throws Throwable {

        // ── 1. Extraire l'utilisateur courant depuis le SecurityContext ──────
        String nomUtilisateur = "Système";
        String emailUtilisateur = "system";
        String roleUtilisateur = "SYSTEM";
        Long utilisateurId = null;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof User currentUser) {
            utilisateurId = currentUser.getId();
            emailUtilisateur = currentUser.getEmail();
            roleUtilisateur = currentUser.getRole().name();
            // Nom affiché : nomComplet si dispo, sinon email
            nomUtilisateur = (currentUser.getNomComplet() != null && !currentUser.getNomComplet().isBlank())
                    ? currentUser.getNomComplet()
                    : currentUser.getEmail();
        }

        // ── 2. Extraire l'IP de la requête HTTP ──────────────────────────────
        String ipAdresse = extractIpAddress();

        // ── 3. Préparer les métadonnées de l'action ───────────────────────────
        String action = auditAction.action();
        String entite = auditAction.entite();
        String detailsTemplate = auditAction.details();

        // Enrichir les détails avec les paramètres de la méthode si disponibles
        String details = buildDetails(detailsTemplate, joinPoint, nomUtilisateur);

        // ── 4. Exécuter la méthode métier ─────────────────────────────────────
        Object result = null;
        try {
            result = joinPoint.proceed();

            // ── 5. Extraire l'ID de l'entité si possible depuis le résultat ──
            Long entiteId = extractEntityId(result, joinPoint);

            // ── 6. Log SUCCESS (asynchrone, transaction indépendante) ─────────
            systemAuditLogService.log(
                    utilisateurId,
                    nomUtilisateur,
                    emailUtilisateur,
                    roleUtilisateur,
                    action,
                    details,
                    entite,
                    entiteId,
                    ipAdresse,
                    "SUCCESS",
                    null
            );

            return result;

        } catch (Throwable ex) {
            // ── 7. Log ERROR si auditErrors=true ──────────────────────────────
            if (auditAction.auditErrors()) {
                systemAuditLogService.log(
                        utilisateurId,
                        nomUtilisateur,
                        emailUtilisateur,
                        roleUtilisateur,
                        action + "_ERREUR",
                        "Erreur lors de: " + details,
                        entite,
                        null,
                        ipAdresse,
                        "ERROR",
                        ex.getMessage()
                );
            }
            throw ex;
        }
    }

    // ─── Helpers privés ──────────────────────────────────────────────────────

    /**
     * Extrait l'adresse IP réelle de la requête HTTP en tenant compte des proxies.
     */
    private String extractIpAddress() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) return "N/A";

            HttpServletRequest request = attrs.getRequest();

            // Ordre de priorité : X-Forwarded-For → X-Real-IP → remoteAddr
            String[] ipHeaders = {"X-Forwarded-For", "X-Real-IP", "Proxy-Client-IP", "WL-Proxy-Client-IP"};
            for (String header : ipHeaders) {
                String ip = request.getHeader(header);
                if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip)) {
                    // X-Forwarded-For peut contenir plusieurs IPs → prendre la première
                    return ip.split(",")[0].trim();
                }
            }
            return request.getRemoteAddr();

        } catch (Exception e) {
            return "N/A";
        }
    }

    /**
     * Construit un message de détail enrichi à partir du template et des paramètres de la méthode.
     */
    private String buildDetails(String template, ProceedingJoinPoint joinPoint, String nomUtilisateur) {
        if (template == null || template.isBlank()) {
            // Générer un résumé automatique depuis les paramètres
            String params = Arrays.stream(joinPoint.getArgs())
                    .filter(arg -> arg != null && !(arg instanceof User))
                    .map(arg -> {
                        if (arg instanceof Enum<?> e) return e.name();
                        return arg.toString();
                    })
                    .collect(Collectors.joining(", "));
            String methodName = joinPoint.getSignature().getName();
            return String.format("Action '%s' par %s%s",
                    methodName,
                    nomUtilisateur,
                    params.isBlank() ? "" : " [params: " + params + "]");
        }
        return template;
    }

    /**
     * Tente d'extraire l'ID de l'entité depuis le résultat de la méthode ou les arguments.
     */
    private Long extractEntityId(Object result, ProceedingJoinPoint joinPoint) {
        // Essai 1 : si le résultat a une méthode getId()
        if (result != null) {
            try {
                Method getIdMethod = result.getClass().getMethod("getId");
                Object id = getIdMethod.invoke(result);
                if (id instanceof Long l) return l;
                if (id instanceof Integer i) return i.longValue();
            } catch (Exception ignored) { /* pas de getId sur le résultat */ }
        }

        // Essai 2 : premier argument Long (souvent l'ID de l'entité)
        for (Object arg : joinPoint.getArgs()) {
            if (arg instanceof Long l && l > 0) return l;
        }

        return null;
    }
}
