package gn.univlabe.unistage;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class PasswordTest {
    @Test
    public void testPassword() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String raw = "password123";
        String hashInDb = "$2a$10$bt2yBtUkaV2KYVGDdBeG5.uHb6cdn6q.mx6l9MqmJIOwEzucxxIgq";
        System.out.println("==========================================");
        System.out.println("Matches password123 : " + encoder.matches(raw, hashInDb));
        System.out.println("New Hash for password123 : " + encoder.encode(raw));
        System.out.println("==========================================");
        assertTrue(encoder.matches(raw, hashInDb));
    }
}
