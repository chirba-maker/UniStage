package gn.univlabe.unistage.audit;

import gn.univlabe.unistage.domain.entities.User;
import gn.univlabe.unistage.domain.enums.StatutOffreEnum;
import gn.univlabe.unistage.repository.UserRepository;
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
 */
@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditAspect {

    private final SystemAuditLogService systemAuditLogService;
    private final UserRepository userRepository;

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
        if (auth != null && auth.isAuthenticated() && auth.getName() != null && !"anonymousUser".equals(auth.getName())) {
            String email = auth.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                User currentUser = userOpt.get();
                utilisateurId = currentUser.getId();
                emailUtilisateur = currentUser.getEmail();
                roleUtilisateur = currentUser.getRole().name();
                nomUtilisateur = (currentUser.getNomComplet() != null && !currentUser.getNomComplet().isBlank())
                        ? currentUser.getNomComplet()
                        : currentUser.getEmail();
            }
        }

        // ── 2. Extraire l'IP de la requête HTTP ──────────────────────────────
        String ipAdresse = extractIpAddress();

        // ── 3. Préparer les métadonnées de l'action ───────────────────────────
        String action = auditAction.action();
        String entite = auditAction.entite();
        String detailsTemplate = auditAction.details();

        // Dynamique : Ajuster action & détails pour la validation/désactivation entreprise
        if ("ENTREPRISE_VALIDEE".equals(action)) {
            for (Object arg : joinPoint.getArgs()) {
                if (arg instanceof Boolean b) {
                    if (Boolean.FALSE.equals(b)) {
                        action = "ENTREPRISE_DESACTIVEE";
                        detailsTemplate = "Désactivation du compte entreprise par l'administration";
                    } else {
                        action = "ENTREPRISE_VALIDEE";
                        detailsTemplate = "Approbation et validation du compte entreprise par l'administration";
                    }
                }
            }
        }

        // Dynamique : Ajuster action & détails pour la modération d'offre (PUBLIEE / REJETEE)
        if ("OFFRE_MODEREE".equals(action)) {
            for (Object arg : joinPoint.getArgs()) {
                if (arg instanceof StatutOffreEnum statut) {
                    if (statut == StatutOffreEnum.PUBLIEE) {
                        action = "OFFRE_PUBLIEE";
                        detailsTemplate = "Approbation et publication de l'offre de stage par l'administration";
                    } else if (statut == StatutOffreEnum.REJETEE) {
                        action = "OFFRE_REJETEE";
                        detailsTemplate = "Rejet de l'offre de stage lors de la modération par l'administration";
                    }
                }
            }
        }

        // Enrichir les détails avec les paramètres si nécessaires
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

    private String extractIpAddress() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) return "N/A";

            HttpServletRequest request = attrs.getRequest();
            String[] ipHeaders = {"X-Forwarded-For", "X-Real-IP", "Proxy-Client-IP", "WL-Proxy-Client-IP"};
            for (String header : ipHeaders) {
                String ip = request.getHeader(header);
                if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip)) {
                    return ip.split(",")[0].trim();
                }
            }
            return request.getRemoteAddr();
        } catch (Exception e) {
            return "N/A";
        }
    }

    private String buildDetails(String template, ProceedingJoinPoint joinPoint, String nomUtilisateur) {
        if (template == null || template.isBlank()) {
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

    private Long extractEntityId(Object result, ProceedingJoinPoint joinPoint) {
        if (result != null) {
            try {
                Method getIdMethod = result.getClass().getMethod("getId");
                Object id = getIdMethod.invoke(result);
                if (id instanceof Long l) return l;
                if (id instanceof Integer i) return i.longValue();
            } catch (Exception ignored) {}
        }
        for (Object arg : joinPoint.getArgs()) {
            if (arg instanceof Long l && l > 0) return l;
        }
        return null;
    }
}
