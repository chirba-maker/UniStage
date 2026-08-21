package gn.univlabe.unistage.repository;

import gn.univlabe.unistage.domain.entities.RapportStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RapportStageRepository extends JpaRepository<RapportStage, Long> {
    Optional<RapportStage> findByConventionId(Long conventionId);
    boolean existsByConventionId(Long conventionId);
}
