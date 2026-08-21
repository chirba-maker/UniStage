package gn.univlabe.unistage.audit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation AOP pour tracer automatiquement les actions métier dans le journal d'audit système.
 *
 * <p>Utilisez cette annotation sur les méthodes de service qui représentent
 * une action significative effectuée par un utilisateur.</p>
 *
 * <pre>
 * {@literal @}AuditAction(action = "OFFRE_PUBLIEE", entite = "OffreStage",
 *             details = "Publication d'une offre de stage par l'administrateur")
 * public OffreStageDto validerOffre(Long id, StatutOffreEnum newStatut) { ... }
 * </pre>
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AuditAction {

    /**
     * Code de l'action (ex: OFFRE_PUBLIEE, CANDIDATURE_SOUMISE, ENTREPRISE_VALIDEE)
     */
    String action();

    /**
     * Nom de l'entité concernée (ex: OffreStage, Candidature, ConventionStage)
     */
    String entite() default "";

    /**
     * Description lisible de l'action pour l'affichage dans le journal admin
     */
    String details() default "";

    /**
     * Si true, les erreurs sont aussi auditées (statut=ERROR)
     */
    boolean auditErrors() default true;
}
