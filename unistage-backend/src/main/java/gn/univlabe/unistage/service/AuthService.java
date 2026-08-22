package gn.univlabe.unistage.service;

import gn.univlabe.unistage.audit.AuditAction;
import gn.univlabe.unistage.domain.entities.Entreprise;
import gn.univlabe.unistage.domain.entities.Etudiant;
import gn.univlabe.unistage.domain.entities.Tuteur;
import gn.univlabe.unistage.domain.entities.User;
import gn.univlabe.unistage.domain.enums.RoleEnum;
import gn.univlabe.unistage.dto.*;
import gn.univlabe.unistage.repository.EntrepriseRepository;
import gn.univlabe.unistage.repository.EtudiantRepository;
import gn.univlabe.unistage.repository.TuteurRepository;
import gn.univlabe.unistage.repository.UserRepository;
import gn.univlabe.unistage.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final EtudiantRepository etudiantRepository;
    private final EntrepriseRepository entrepriseRepository;
    private final TuteurRepository tuteurRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final NotificationService notificationService;

    @Transactional
    @AuditAction(
        action = "INSCRIPTION_ETUDIANT",
        entite = "User",
        details = "Inscription d'un nouvel étudiant sur la plateforme UniStage"
    )
    public AuthResponse registerEtudiant(RegisterStudentDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Erreur: Un utilisateur existe déjà avec cet e-mail.");
        }
        if (etudiantRepository.existsByMatricule(dto.getMatricule())) {
            throw new RuntimeException("Erreur: Un étudiant existe déjà avec ce matricule.");
        }

        User user = User.builder()
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(RoleEnum.ROLE_ETUDIANT)
                .actif(true)
                .build();

        user = userRepository.save(user);

        Etudiant etudiant = Etudiant.builder()
                .user(user)
                .matricule(dto.getMatricule())
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .filiere(dto.getFiliere())
                .niveau(dto.getNiveau())
                .build();

        etudiantRepository.save(etudiant);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
        );

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .nomComplet(etudiant.getPrenom() + " " + etudiant.getNom())
                .build();
    }

    @Transactional
    public AuthResponse registerEntreprise(RegisterEntrepriseDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Erreur: Un utilisateur existe déjà avec cet e-mail.");
        }

        User user = User.builder()
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(RoleEnum.ROLE_ENTREPRISE)
                .actif(true)
                .build();

        user = userRepository.save(user);

        Entreprise entreprise = Entreprise.builder()
                .user(user)
                .nomEntreprise(dto.getNomEntreprise())
                .rccmNif(dto.getRccmNif())
                .secteurActivite(dto.getSecteurActivite())
                .adresse(dto.getAdresse())
                .telephone(dto.getTelephone())
                .estValidee(false) // Validation Admin nécessaire
                .build();

        entrepriseRepository.save(entreprise);

        // Notifier les administrateurs qu'une nouvelle entreprise s'est inscrite
        notificationService.notifyAllAdmins(
                "Nouvelle entreprise à valider",
                "L'entreprise '" + entreprise.getNomEntreprise() + "' vient de s'inscrire et est en attente de validation."
        );

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
        );

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .nomComplet(entreprise.getNomEntreprise())
                .build();
    }

    @Transactional
    @AuditAction(
        action = "INSCRIPTION_TUTEUR",
        entite = "User",
        details = "Inscription d'un nouveau tuteur academique sur la plateforme UniStage"
    )
    public AuthResponse registerTuteur(RegisterTuteurDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Erreur: Un utilisateur existe deja avec cet e-mail.");
        }

        User user = User.builder()
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(RoleEnum.ROLE_TUTEUR)
                .actif(true)
                .build();

        user = userRepository.save(user);

        Tuteur tuteur = Tuteur.builder()
                .user(user)
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .departement(dto.getDepartement())
                .build();

        tuteurRepository.save(tuteur);

        notificationService.notifyAllAdmins(
                "Nouveau tuteur inscrit",
                "Le tuteur " + tuteur.getPrenom() + " " + tuteur.getNom() +
                " (" + tuteur.getDepartement() + ") vient de s'inscrire sur UniStage."
        );

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
        );

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .nomComplet(tuteur.getPrenom() + " " + tuteur.getNom())
                .departement(tuteur.getDepartement())
                .build();
    }

    @AuditAction(
        action = "CONNEXION",
        entite = "User",
        details = "Connexion d'un utilisateur à la plateforme UniStage"
    )
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé."));

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    public AuthResponse getCurrentUserProfile(User user) {
        return buildAuthResponse(user, null, null);
    }

    @Transactional
    public AuthResponse updateUserProfile(User user, UpdateProfileDto dto) {
        if (dto.getEmail() != null && !dto.getEmail().isBlank() && !dto.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new RuntimeException("Erreur: L'e-mail '" + dto.getEmail() + "' est déjà utilisé par un autre compte.");
            }
            user.setEmail(dto.getEmail());
        }

        if (dto.getNomComplet() != null && !dto.getNomComplet().isBlank()) {
            user.setNomComplet(dto.getNomComplet());
        }
        if (dto.getPhotoUrl() != null) {
            user.setPhotoUrl(dto.getPhotoUrl());
        }
        if (dto.getTelephone() != null) {
            user.setTelephone(dto.getTelephone());
        }

        String orgValue = dto.getOrganisation();
        if (orgValue == null || orgValue.isBlank()) {
            orgValue = dto.getFiliere() != null ? dto.getFiliere()
                     : (dto.getAdresse() != null ? dto.getAdresse() : dto.getDepartement());
        }
        if (orgValue != null) {
            user.setOrganisation(orgValue);
        }

        userRepository.save(user);

        if (user.getRole() == RoleEnum.ROLE_ETUDIANT) {
            var optEtud = etudiantRepository.findByUser(user);
            if (optEtud.isPresent()) {
                Etudiant etud = optEtud.get();
                if (dto.getNomComplet() != null && !dto.getNomComplet().isBlank()) {
                    String[] parts = dto.getNomComplet().trim().split("\\s+", 2);
                    if (parts.length > 1) {
                        etud.setPrenom(parts[0]);
                        etud.setNom(parts[1]);
                    } else {
                        etud.setNom(parts[0]);
                    }
                }
                if (dto.getFiliere() != null) {
                    etud.setFiliere(dto.getFiliere());
                }
                etudiantRepository.save(etud);
            }
        } else if (user.getRole() == RoleEnum.ROLE_ENTREPRISE) {
            var optEnt = entrepriseRepository.findByUser(user);
            if (optEnt.isPresent()) {
                Entreprise ent = optEnt.get();
                if (dto.getNomComplet() != null && !dto.getNomComplet().isBlank()) {
                    ent.setNomEntreprise(dto.getNomComplet());
                }
                if (dto.getAdresse() != null) {
                    ent.setAdresse(dto.getAdresse());
                }
                if (dto.getTelephone() != null) {
                    ent.setTelephone(dto.getTelephone());
                }
                entrepriseRepository.save(ent);
            }
        } else if (user.getRole() == RoleEnum.ROLE_TUTEUR) {
            var optTut = tuteurRepository.findByUser(user);
            if (optTut.isPresent()) {
                Tuteur tut = optTut.get();
                if (dto.getNomComplet() != null && !dto.getNomComplet().isBlank()) {
                    String[] parts = dto.getNomComplet().trim().split("\\s+", 2);
                    if (parts.length > 1) {
                        tut.setPrenom(parts[0]);
                        tut.setNom(parts[1]);
                    } else {
                        tut.setNom(parts[0]);
                    }
                }
                if (dto.getDepartement() != null) {
                    tut.setDepartement(dto.getDepartement());
                }
                tuteurRepository.save(tut);
            }
        }

        return buildAuthResponse(user, null, null);
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        if (request == null || request.getRefreshToken() == null || !tokenProvider.validateToken(request.getRefreshToken())) {
            throw new org.springframework.security.authentication.BadCredentialsException("Erreur: Refresh token expiré ou invalide.");
        }

        String email = tokenProvider.getEmailFromToken(request.getRefreshToken());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException("Utilisateur non trouvé."));

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(), null, null
        );

        String newAccessToken = tokenProvider.generateAccessToken(authentication);
        String newRefreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        return buildAuthResponse(user, newAccessToken, newRefreshToken);
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        String nomComplet = user.getNomComplet();
        String filiere = null;
        String adresse = null;
        String departement = null;

        if (user.getRole() == RoleEnum.ROLE_ETUDIANT) {
            var opt = etudiantRepository.findByUser(user);
            if (opt.isPresent()) {
                if (nomComplet == null || nomComplet.isBlank()) {
                    nomComplet = opt.get().getPrenom() + " " + opt.get().getNom();
                }
                filiere = opt.get().getFiliere();
            }
        } else if (user.getRole() == RoleEnum.ROLE_ENTREPRISE) {
            var opt = entrepriseRepository.findByUser(user);
            if (opt.isPresent()) {
                if (nomComplet == null || nomComplet.isBlank()) {
                    nomComplet = opt.get().getNomEntreprise();
                }
                adresse = opt.get().getAdresse();
            }
        } else if (user.getRole() == RoleEnum.ROLE_TUTEUR) {
            var opt = tuteurRepository.findByUser(user);
            if (opt.isPresent()) {
                if (nomComplet == null || nomComplet.isBlank()) {
                    nomComplet = opt.get().getPrenom() + " " + opt.get().getNom();
                }
                departement = opt.get().getDepartement();
            }
        }

        if (nomComplet == null || nomComplet.isBlank()) {
            nomComplet = user.getEmail();
        }

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .nomComplet(nomComplet)
                .photoUrl(user.getPhotoUrl())
                .telephone(user.getTelephone())
                .filiere(filiere != null ? filiere : user.getOrganisation())
                .adresse(adresse != null ? adresse : user.getOrganisation())
                .departement(departement != null ? departement : user.getOrganisation())
                .organisation(user.getOrganisation())
                .build();
    }
}
