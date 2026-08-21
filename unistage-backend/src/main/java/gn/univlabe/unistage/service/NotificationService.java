package gn.univlabe.unistage.service;

import gn.univlabe.unistage.domain.entities.Notification;
import gn.univlabe.unistage.domain.entities.User;
import gn.univlabe.unistage.dto.NotificationDto;
import gn.univlabe.unistage.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import gn.univlabe.unistage.domain.enums.RoleEnum;
import gn.univlabe.unistage.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public Notification createNotification(User user, String titre, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .titre(titre)
                .message(message)
                .lue(false)
                .build();
        return notificationRepository.save(notification);
    }

    @Transactional
    public void notifyAllAdmins(String titre, String message) {
        List<User> admins = userRepository.findByRole(RoleEnum.ROLE_ADMIN);
        for (User admin : admins) {
            createNotification(admin, titre, message);
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getNotificationsForUser(User user) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserIdAndLueFalse(user.getId());
    }

    @Transactional
    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Accès non autorisé à cette notification");
        }
        notification.setLue(true);
        notificationRepository.save(notification);
    }

    private NotificationDto mapToDto(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .utilisateurId(notification.getUser().getId())
                .titre(notification.getTitre())
                .message(notification.getMessage())
                .lue(notification.getLue())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
