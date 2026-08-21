package gn.univlabe.unistage.repository;

import gn.univlabe.unistage.domain.entities.Candidature;
import gn.univlabe.unistage.domain.enums.StatutCandidatureEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidatureRepository extends JpaRepository<Candidature, Long> {
    List<Candidature> findByEtudiantId(Long etudiantId);
    List<Candidature> findByOffreId(Long offreId);
    List<Candidature> findByOffreEntrepriseId(Long entrepriseId);
    List<Candidature> findByOffreEntrepriseIdAndStatut(Long entrepriseId, StatutCandidatureEnum statut);
    Optional<Candidature> findByEtudiantIdAndOffreId(Long etudiantId, Long offreId);
    boolean existsByEtudiantIdAndOffreId(Long etudiantId, Long offreId);
}
