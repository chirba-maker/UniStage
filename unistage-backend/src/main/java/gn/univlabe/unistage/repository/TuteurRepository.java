package gn.univlabe.unistage.repository;

import gn.univlabe.unistage.domain.entities.Tuteur;
import gn.univlabe.unistage.domain.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TuteurRepository extends JpaRepository<Tuteur, Long> {
    Optional<Tuteur> findByUser(User user);
    Optional<Tuteur> findByUserId(Long userId);
}
