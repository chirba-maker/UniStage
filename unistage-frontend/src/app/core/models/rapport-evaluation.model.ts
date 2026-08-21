export interface RapportStageDto {
  id: number;
  conventionId: number;
  etudiantId: number;
  nomEtudiant: string;
  prenomEtudiant: string;
  titre: string;
  resume?: string;
  fichierUrl: string;
  dateDepot: string;
  statut: string;
}

export interface SubmitRapportDto {
  titre: string;
  resume?: string;
}

export interface EvaluationTuteurDto {
  id: number;
  conventionId: number;
  tuteurId: number;
  nomTuteur: string;
  prenomTuteur: string;
  noteQualiteTravail: number;
  noteAutonomie: number;
  noteAssiduite: number;
  noteIntegration: number;
  noteGlobale: number;
  appreciationGlobale?: string;
  fichierEvaluationUrl?: string;
  dateEvaluation: string;
}

export interface SubmitEvaluationDto {
  noteQualiteTravail: number;
  noteAutonomie: number;
  noteAssiduite: number;
  noteIntegration: number;
  appreciationGlobale?: string;
}
