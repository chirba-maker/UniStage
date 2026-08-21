import { OffreStage } from './offre.model';

export enum StatutCandidatureEnum {
  SOUMISE = 'SOUMISE',
  EN_EXAMEN = 'EN_EXAMEN',
  ENTRETIEN = 'ENTRETIEN',
  RETENUE = 'RETENUE',
  REFUSEE = 'REFUSEE'
}

export interface EtudiantDto {
  id: number;
  utilisateurId: number;
  email: string;
  matricule: string;
  nom: string;
  prenom: string;
  filiere: string;
  niveau: string;
  cvUrl?: string;
}

export interface Candidature {
  id: number;
  etudiant: EtudiantDto;
  offre: OffreStage;
  lettreMotivation?: string;
  cvUrl?: string;
  statut: StatutCandidatureEnum;
  dateCandidature: string;
}
