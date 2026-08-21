package gn.univlabe.unistage.repository;

import gn.univlabe.unistage.domain.entities.ConventionStage;
import gn.univlabe.unistage.domain.enums.StatutConventionEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConventionStageRepository extends JpaRepository<ConventionStage, Long> {
    Optional<ConventionStage> findByCandidatureId(Long candidatureId);
    List<ConventionStage> findByCandidatureEtudiantId(Long etudiantId);
    List<ConventionStage> findByCandidatureOffreEntrepriseId(Long entrepriseId);
    List<ConventionStage> findByTuteurId(Long tuteurId);
    List<ConventionStage> findByStatutValidation(StatutConventionEnum statutValidation);
}
