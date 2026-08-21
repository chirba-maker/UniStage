import { Candidature } from './candidature.model';

export enum StatutConventionEnum {
  BROUILLON = 'BROUILLON',
  SOUMISE = 'SOUMISE',
  VALIDEE_ENTREPRISE = 'VALIDEE_ENTREPRISE',
  VALIDEE_TUTEUR = 'VALIDEE_TUTEUR',
  SIGNEE_FINALE = 'SIGNEE_FINALE',
  REJETEE = 'REJETEE'
}

export interface TuteurDto {
  id: number;
  utilisateurId: number;
  email: string;
  nom: string;
  prenom: string;
  departement: string;
}

export interface ConventionStage {
  id: number;
  candidature: Candidature;
  tuteur?: TuteurDto;
  dateDebut: string;
  dateFin: string;
  missions: string;
  gratification?: number;
  statutValidation: StatutConventionEnum;
  pdfUrl?: string;
  dateCreation: string;
}

export interface UpdateConventionDto {
  dateDebut: string;
  dateFin: string;
  missions: string;
  gratification?: number;
}
