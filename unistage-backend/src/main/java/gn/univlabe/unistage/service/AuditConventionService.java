package gn.univlabe.unistage.service;

import gn.univlabe.unistage.domain.entities.AuditConvention;
import gn.univlabe.unistage.domain.entities.ConventionStage;
import gn.univlabe.unistage.domain.entities.User;
import gn.univlabe.unistage.dto.AuditConventionDto;
import gn.univlabe.unistage.repository.AuditConventionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditConventionService {

    private final AuditConventionRepository auditConventionRepository;

    @Transactional
    public void logAction(ConventionStage convention, User user, String nomUtilisateur, String roleUtilisateur, String action, String details) {
        AuditConvention audit = AuditConvention.builder()
                .convention(convention)
                .utilisateurId(user != null ? user.getId() : null)
                .nomUtilisateur(nomUtilisateur)
                .roleUtilisateur(roleUtilisateur != null ? roleUtilisateur : (user != null ? user.getRole().name() : "SYSTEM"))
                .action(action)
                .details(details)
                .dateAction(LocalDateTime.now())
                .build();

        auditConventionRepository.save(audit);
    }

    @Transactional(readOnly = true)
    public List<AuditConventionDto> getAuditTrail(Long conventionId) {
        return auditConventionRepository.findByConventionIdOrderByDateActionAsc(conventionId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    public AuditConventionDto mapToDto(AuditConvention audit) {
        return AuditConventionDto.builder()
                .id(audit.getId())
                .conventionId(audit.getConvention().getId())
                .utilisateurId(audit.getUtilisateurId())
                .nomUtilisateur(audit.getNomUtilisateur())
                .roleUtilisateur(audit.getRoleUtilisateur())
                .action(audit.getAction())
                .details(audit.getDetails())
                .dateAction(audit.getDateAction())
                .ipAdresse(audit.getIpAdresse())
                .build();
    }
}
