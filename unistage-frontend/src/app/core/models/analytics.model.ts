export interface AnalyticsDto {
  tauxPlacement: number;
  totalEtudiants: number;
  totalEtudiantsPlaces: number;
  totalEntreprisesPartenaires: number;
  totalOffresPubliees: number;
  totalConventionsSignees: number;

  repartitionParFiliere: { [key: string]: number };
  repartitionParEntreprise: { [key: string]: number };
  repartitionParStatutConvention: { [key: string]: number };
  repartitionParStatutCandidature: { [key: string]: number };
  offresParSecteur: { [key: string]: number };
}
