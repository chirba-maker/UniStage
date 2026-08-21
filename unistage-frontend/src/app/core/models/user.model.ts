export enum RoleEnum {
  ROLE_ETUDIANT = 'ROLE_ETUDIANT',
  ROLE_ENTREPRISE = 'ROLE_ENTREPRISE',
  ROLE_TUTEUR = 'ROLE_TUTEUR',
  ROLE_ADMIN = 'ROLE_ADMIN'
}

export interface User {
  id: number;
  email: string;
  role: RoleEnum;
  nomComplet?: string;
  photoUrl?: string;
  telephone?: string;
  adresse?: string;
  filiere?: string;
  niveau?: string;
  matricule?: string;
  departement?: string;
  organisation?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  email: string;
  role: RoleEnum;
  nomComplet?: string;
  photoUrl?: string;
  telephone?: string;
  filiere?: string;
  adresse?: string;
  departement?: string;
  organisation?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterStudentDto {
  email: string;
  password: string;
  matricule: string;
  nom: string;
  prenom: string;
  filiere: string;
  niveau: string;
}

export interface RegisterEntrepriseDto {
  email: string;
  password: string;
  nomEntreprise: string;
  rccmNif?: string;
  secteurActivite: string;
  adresse: string;
  telephone: string;
}
