package gn.univlabe.unistage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Point d'entrée principal de l'application UniStage.
 *
 * {@code @EnableAsync} : active l'exécution asynchrone des méthodes annotées {@code @Async}
 *   (utilisé par {@link gn.univlabe.unistage.service.SystemAuditLogService} pour ne jamais
 *   bloquer les actions métier lors de l'écriture du journal d'audit).
 *
 * {@code @EnableAspectJAutoProxy} : active le support AOP qui permet à
 *   {@link gn.univlabe.unistage.audit.AuditAspect} d'intercepter les méthodes annotées
 *   {@code @AuditAction} et de les tracer automatiquement.
 */
@SpringBootApplication
@EnableAsync
@EnableAspectJAutoProxy
public class UnistageApplication {

    public static void main(String[] args) {
        SpringApplication.run(UnistageApplication.class, args);
        System.out.println("=================================================");
        System.out.println("🚀 UniStage Backend démarré avec succès !");
        System.out.println("🌐 API Base: http://localhost:8080");
        System.out.println("📚 Swagger UI: http://localhost:8080/swagger-ui.html");
        System.out.println("🔍 Audit AOP : actif (journal d'audit automatique)");
        System.out.println("=================================================");
    }
}

