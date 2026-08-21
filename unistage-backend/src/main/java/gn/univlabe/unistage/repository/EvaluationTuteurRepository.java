package gn.univlabe.unistage.repository;

import gn.univlabe.unistage.domain.entities.EvaluationTuteur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EvaluationTuteurRepository extends JpaRepository<EvaluationTuteur, Long> {
    Optional<EvaluationTuteur> findByConventionId(Long conventionId);
    boolean existsByConventionId(Long conventionId);
}
