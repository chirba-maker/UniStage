package gn.univlabe.unistage.repository;

import gn.univlabe.unistage.domain.entities.OffreStage;
import gn.univlabe.unistage.domain.enums.StatutOffreEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OffreStageRepository extends JpaRepository<OffreStage, Long> {
    Optional<OffreStage> findBySlug(String slug);
    List<OffreStage> findByStatut(StatutOffreEnum statut);
    List<OffreStage> findByEntrepriseId(Long entrepriseId);
    List<OffreStage> findByEntrepriseIdAndStatut(Long entrepriseId, StatutOffreEnum statut);
    
    @Query("SELECT o FROM OffreStage o WHERE o.statut = 'PUBLIEE' AND " +
           "(LOWER(o.titre) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(o.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(o.lieu) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(o.entreprise.nomEntreprise) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<OffreStage> searchOffresPubliees(@Param("query") String query);
}
