package gn.univlabe.unistage.repository;

import gn.univlabe.unistage.domain.entities.User;
import gn.univlabe.unistage.domain.enums.RoleEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    long countByRole(RoleEnum role);
    java.util.List<User> findByRole(RoleEnum role);
}
