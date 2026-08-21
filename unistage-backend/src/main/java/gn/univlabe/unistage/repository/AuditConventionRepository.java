package gn.univlabe.unistage.repository;

import gn.univlabe.unistage.domain.entities.AuditConvention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditConventionRepository extends JpaRepository<AuditConvention, Long> {
    List<AuditConvention> findByConventionIdOrderByDateActionAsc(Long conventionId);
}
