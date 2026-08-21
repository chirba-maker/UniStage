package gn.univlabe.unistage.repository;

import gn.univlabe.unistage.domain.entities.Etudiant;
import gn.univlabe.unistage.domain.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    Optional<Etudiant> findByUser(User user);
    Optional<Etudiant> findByMatricule(String matricule);
    Boolean existsByMatricule(String matricule);
}
