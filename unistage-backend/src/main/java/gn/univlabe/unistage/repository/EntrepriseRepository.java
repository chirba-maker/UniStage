package gn.univlabe.unistage.repository;

import gn.univlabe.unistage.domain.entities.Entreprise;
import gn.univlabe.unistage.domain.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EntrepriseRepository extends JpaRepository<Entreprise, Long> {
    Optional<Entreprise> findByUser(User user);
    List<Entreprise> findByEstValidee(Boolean estValidee);
}
