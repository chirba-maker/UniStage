package gn.univlabe.unistage.web;

import gn.univlabe.unistage.dto.*;
import gn.univlabe.unistage.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import gn.univlabe.unistage.domain.entities.User;
import gn.univlabe.unistage.repository.UserRepository;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "Endpoints de connexion, d'inscription et de gestion du profil")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register/etudiant")
    @Operation(summary = "Inscription d'un compte Étudiant")
    public ResponseEntity<AuthResponse> registerEtudiant(@Valid @RequestBody RegisterStudentDto dto) {
        AuthResponse response = authService.registerEtudiant(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/register/entreprise")
    @Operation(summary = "Inscription d'un compte Entreprise")
    public ResponseEntity<AuthResponse> registerEntreprise(@Valid @RequestBody RegisterEntrepriseDto dto) {
        AuthResponse response = authService.registerEntreprise(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/register/tuteur")
    @Operation(summary = "Inscription d'un compte Tuteur Academique")
    public ResponseEntity<AuthResponse> registerTuteur(@Valid @RequestBody RegisterTuteurDto dto) {
        AuthResponse response = authService.registerTuteur(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Connexion utilisateur (Étudiant, Entreprise, Tuteur, Admin)")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Rafraîchissement de l'Access Token JWT via Refresh Token")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Récupérer les informations du profil utilisateur connecté")
    public ResponseEntity<AuthResponse> getCurrentUser(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return ResponseEntity.ok(authService.getCurrentUserProfile(user));
    }

    @PutMapping("/profile")
    @Operation(summary = "Mettre à jour les informations et la photo de profil de l'utilisateur")
    public ResponseEntity<AuthResponse> updateProfile(@RequestBody UpdateProfileDto dto, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return ResponseEntity.ok(authService.updateUserProfile(user, dto));
    }
}
