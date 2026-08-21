package gn.univlabe.unistage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class UnistageApplication {

    public static void main(String[] args) {
        SpringApplication.run(UnistageApplication.class, args);
        System.out.println("=================================================");
        System.out.println("🚀 UniStage Backend démarré avec succès !");
        System.out.println("🌐 API Base: http://localhost:8080");
        System.out.println("📚 Swagger UI: http://localhost:8080/swagger-ui.html");
        System.out.println("=================================================");
    }
}
