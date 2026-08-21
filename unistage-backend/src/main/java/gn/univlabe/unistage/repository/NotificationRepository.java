package gn.univlabe.unistage.repository;

import gn.univlabe.unistage.domain.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByUserIdAndLueFalseOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndLueFalse(Long userId);
}
