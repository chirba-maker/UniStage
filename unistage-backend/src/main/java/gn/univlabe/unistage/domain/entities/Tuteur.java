package gn.univlabe.unistage.domain.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tuteurs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tuteur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "utilisateur_id", referencedColumnName = "id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(nullable = false, length = 100)
    private String departement;
}
