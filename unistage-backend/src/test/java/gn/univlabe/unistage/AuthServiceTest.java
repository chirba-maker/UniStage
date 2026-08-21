package gn.univlabe.unistage;

import gn.univlabe.unistage.domain.entities.*;
import gn.univlabe.unistage.domain.enums.RoleEnum;
import gn.univlabe.unistage.dto.*;
import gn.univlabe.unistage.repository.*;
import gn.univlabe.unistage.security.JwtTokenProvider;
import gn.univlabe.unistage.service.AuthService;
import gn.univlabe.unistage.service.NotificationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests AuthService — Register, Login et UpdateProfile")
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private EtudiantRepository etudiantRepository;
    @Mock private EntrepriseRepository entrepriseRepository;
    @Mock private TuteurRepository tuteurRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtTokenProvider tokenProvider;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private AuthService authService;

    // =========================================================
    // Test 1 : Register étudiant — email déjà existant → Exception
    // =========================================================
    @Test
    @DisplayName("registerEtudiant: lève RuntimeException si l'email est déjà utilisé")
    void testRegisterEtudiant_EmailAlreadyExists_ThrowsException() {
        RegisterStudentDto dto = new RegisterStudentDto();
        dto.setEmail("existe@test.com");
        dto.setPassword("password123");
        dto.setMatricule("ETU001");
        dto.setNom("Bah");
        dto.setPrenom("Mamadou");
        dto.setFiliere("Informatique");
        dto.setNiveau("L3");

        when(userRepository.existsByEmail("existe@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.registerEtudiant(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("utilisateur existe déjà");
    }

    // =========================================================
    // Test 2 : Register étudiant — matricule déjà existant → Exception
    // =========================================================
    @Test
    @DisplayName("registerEtudiant: lève RuntimeException si le matricule est déjà utilisé")
    void testRegisterEtudiant_MatriculeAlreadyExists_ThrowsException() {
        RegisterStudentDto dto = new RegisterStudentDto();
        dto.setEmail("nouveau@test.com");
        dto.setPassword("password123");
        dto.setMatricule("ETU001");
        dto.setNom("Bah");
        dto.setPrenom("Mamadou");
        dto.setFiliere("Informatique");
        dto.setNiveau("L3");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(etudiantRepository.existsByMatricule("ETU001")).thenReturn(true);

        assertThatThrownBy(() -> authService.registerEtudiant(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("matricule");
    }

    // =========================================================
    // Test 3 : Login réussi → AuthResponse contient tokens et profil
    // =========================================================
    @Test
    @DisplayName("login: retourne un AuthResponse avec accessToken et nomComplet")
    void testLogin_Success_ReturnsAuthResponse() {
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@test.com");
        request.setPassword("password123");

        User user = User.builder().id(1L).email("admin@test.com")
                .role(RoleEnum.ROLE_ADMIN).actif(true).build();

        var auth = new UsernamePasswordAuthenticationToken("admin@test.com", null, null);
        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(user));
        when(tokenProvider.generateAccessToken(any())).thenReturn("ACCESS_TOKEN_XYZ");
        when(tokenProvider.generateRefreshToken(any())).thenReturn("REFRESH_TOKEN_XYZ");

        AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("ACCESS_TOKEN_XYZ");
        assertThat(response.getRefreshToken()).isEqualTo("REFRESH_TOKEN_XYZ");
        assertThat(response.getRole()).isEqualTo(RoleEnum.ROLE_ADMIN);
        assertThat(response.getEmail()).isEqualTo("admin@test.com");
    }

    // =========================================================
    // Test 4 : updateUserProfile — nomComplet persiste en base
    // =========================================================
    @Test
    @DisplayName("updateUserProfile: nomComplet et telephone sont persistés sur l'entité User")
    void testUpdateUserProfile_PersistsNomCompletAndTelephone() {
        User user = User.builder().id(1L).email("admin@test.com")
                .role(RoleEnum.ROLE_ADMIN).actif(true).build();

        UpdateProfileDto dto = new UpdateProfileDto();
        dto.setNomComplet("Mamadou Bassirou Diallo");
        dto.setTelephone("+224 620 123 456");
        dto.setEmail("admin@test.com"); // Pas de changement d'email

        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse response = authService.updateUserProfile(user, dto);

        verify(userRepository).save(argThat(u ->
                "Mamadou Bassirou Diallo".equals(u.getNomComplet()) &&
                "+224 620 123 456".equals(u.getTelephone())
        ));
        assertThat(response.getNomComplet()).isEqualTo("Mamadou Bassirou Diallo");
    }

    // =========================================================
    // Test 5 : updateUserProfile — changement email déjà pris → Exception
    // =========================================================
    @Test
    @DisplayName("updateUserProfile: lève RuntimeException si le nouvel email est déjà pris")
    void testUpdateUserProfile_EmailConflict_ThrowsException() {
        User user = User.builder().id(1L).email("ancien@test.com")
                .role(RoleEnum.ROLE_ETUDIANT).actif(true).build();

        UpdateProfileDto dto = new UpdateProfileDto();
        dto.setEmail("pris@test.com");

        when(userRepository.existsByEmail("pris@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.updateUserProfile(user, dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("déjà utilisé");
    }
}
