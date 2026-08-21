package gn.univlabe.unistage.service;

import gn.univlabe.unistage.domain.enums.StatutCandidatureEnum;
import gn.univlabe.unistage.domain.enums.StatutConventionEnum;

import gn.univlabe.unistage.dto.AnalyticsDto;
import gn.univlabe.unistage.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final EtudiantRepository etudiantRepository;
    private final EntrepriseRepository entrepriseRepository;
    private final OffreStageRepository offreStageRepository;
    private final CandidatureRepository candidatureRepository;
    private final ConventionStageRepository conventionStageRepository;

    @Transactional(readOnly = true)
    public AnalyticsDto getAnalyticsDashboard() {
        long totalEtudiants = etudiantRepository.count();
        long totalEntreprises = entrepriseRepository.count();
        long totalOffres = offreStageRepository.count();

        // Étudiants ayant au moins une candidature retenue ou une convention créée/signée
        long totalPlacedStudents = candidatureRepository.findAll().stream()
                .filter(c -> StatutCandidatureEnum.RETENUE.equals(c.getStatut()))
                .map(c -> c.getEtudiant().getId())
                .distinct()
                .count();

        double placementRate = 0.0;
        if (totalEtudiants > 0) {
            placementRate = BigDecimal.valueOf((double) totalPlacedStudents / totalEtudiants * 100.0)
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        long totalConventionsSignees = conventionStageRepository.findAll().stream()
                .filter(c -> StatutConventionEnum.SIGNEE_FINALE.equals(c.getStatutValidation()))
                .count();

        // 1. Répartition par filière
        Map<String, Long> repartitionParFiliere = etudiantRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        e -> e.getFiliere() != null ? e.getFiliere() : "Non spécifiée",
                        Collectors.counting()
                ));

        // 2. Répartition par entreprise (top entreprises accueillant des stagiaires)
        Map<String, Long> repartitionParEntreprise = conventionStageRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        c -> c.getCandidature().getOffre().getEntreprise().getNomEntreprise(),
                        Collectors.counting()
                ));

        // Fallback or top offers if conventions count is low
        if (repartitionParEntreprise.isEmpty()) {
            repartitionParEntreprise = offreStageRepository.findAll().stream()
                    .collect(Collectors.groupingBy(
                            o -> o.getEntreprise().getNomEntreprise(),
                            Collectors.counting()
                    ));
        }

        // 3. Répartition des conventions par statut
        Map<String, Long> repartitionParStatutConvention = conventionStageRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        c -> c.getStatutValidation().name(),
                        Collectors.counting()
                ));

        // 4. Répartition des candidatures par statut
        Map<String, Long> repartitionParStatutCandidature = candidatureRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        c -> c.getStatut().name(),
                        Collectors.counting()
                ));

        // 5. Offres par secteur d'activité
        Map<String, Long> offresParSecteur = offreStageRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        o -> o.getEntreprise().getSecteurActivite() != null ? o.getEntreprise().getSecteurActivite() : "Divers",
                        Collectors.counting()
                ));

        return AnalyticsDto.builder()
                .tauxPlacement(placementRate)
                .totalEtudiants(totalEtudiants)
                .totalEtudiantsPlaces(totalPlacedStudents)
                .totalEntreprisesPartenaires(totalEntreprises)
                .totalOffresPubliees(totalOffres)
                .totalConventionsSignees(totalConventionsSignees)
                .repartitionParFiliere(repartitionParFiliere)
                .repartitionParEntreprise(repartitionParEntreprise)
                .repartitionParStatutConvention(repartitionParStatutConvention)
                .repartitionParStatutCandidature(repartitionParStatutCandidature)
                .offresParSecteur(offresParSecteur)
                .build();
    }
}
