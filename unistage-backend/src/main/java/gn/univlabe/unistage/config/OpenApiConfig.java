package gn.univlabe.unistage.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuration OpenAPI 3 / Swagger UI pour UniStage Backend.
 * Accessible à l'adresse : http://localhost:8080/swagger-ui.html
 */
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI unistageOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("UniStage API — Université de Labé")
                        .description("Plateforme de Gestion des Offres, Candidatures et Conventions de Stage de l'Université de Labé (Guinée).\n\n" +
                                "### Rôles pris en charge :\n" +
                                "- **ROLE_ETUDIANT** : Consultation des offres, postulation, génération et signature des conventions de stage.\n" +
                                "- **ROLE_ENTREPRISE** : Publication et gestion des offres, validation des candidatures et signature entreprise.\n" +
                                "- **ROLE_TUTEUR** : Suivi pédagogique et validation académique des conventions.\n" +
                                "- **ROLE_ADMIN** : Gestion globale, validation des comptes entreprises, pilotage et statistiques.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Direction Informatique & Stages — Université de Labé")
                                .email("contact@univ-labe.edu.gn")
                                .url("https://univ-labe.edu.gn"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Serveur Local de Développement"),
                        new Server().url("https://api.unistage.univ-labe.edu.gn").description("Serveur de Production (Optionnel)")
                ))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Insérez votre JWT Access Token généré via `/api/auth/login` (ex: Bearer eyJhbGciOi...)")));
    }
}
