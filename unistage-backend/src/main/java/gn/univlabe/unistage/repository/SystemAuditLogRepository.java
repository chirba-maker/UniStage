package gn.univlabe.unistage.repository;

import gn.univlabe.unistage.domain.entities.SystemAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SystemAuditLogRepository extends JpaRepository<SystemAuditLog, Long> {

    List<SystemAuditLog> findAllByOrderByDateActionDesc();

    Page<SystemAuditLog> findAllByOrderByDateActionDesc(Pageable pageable);

    List<SystemAuditLog> findByUtilisateurIdOrderByDateActionDesc(Long utilisateurId);

    List<SystemAuditLog> findByActionOrderByDateActionDesc(String action);

    List<SystemAuditLog> findByEntiteAndEntiteIdOrderByDateActionDesc(String entite, Long entiteId);

    @Query("SELECT s FROM SystemAuditLog s WHERE s.dateAction BETWEEN :from AND :to ORDER BY s.dateAction DESC")
    List<SystemAuditLog> findByDateRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(s) FROM SystemAuditLog s WHERE s.dateAction >= :since")
    long countRecentActions(@Param("since") LocalDateTime since);
}
