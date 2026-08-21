package gn.univlabe.unistage.web;

import gn.univlabe.unistage.domain.entities.User;
import gn.univlabe.unistage.dto.NotificationDto;
import gn.univlabe.unistage.repository.UserRepository;
import gn.univlabe.unistage.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    // Liste des notifications de l'utilisateur connecté")
    public ResponseEntity<List<NotificationDto>> getMyNotifications(Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(notificationService.getNotificationsForUser(user));
    }

    @GetMapping("/unread-count")
    // Nombre de notifications non lues")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(user)));
    }

    @PutMapping("/{id}/lire")
    // Marquer une notification comme lue")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        notificationService.markAsRead(id, user);
        return ResponseEntity.noContent().build();
    }

    private User getCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }
}
