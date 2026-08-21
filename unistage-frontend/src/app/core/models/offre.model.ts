export enum StatutOffreEnum {
  EN_ATTENTE_MODERATION = 'EN_ATTENTE_MODERATION',
  PUBLIEE = 'PUBLIEE',
  CLOTUREE = 'CLOTUREE',
  REJETEE = 'REJETEE'
}

export interface OffreStage {
  id: number;
  entrepriseId: number;
  nomEntreprise: string;
  logoUrlEntreprise?: string;
  titre: string;
  slug: string;
  description: string;
  lieu: string;
  dureeMois: number;
  gratification?: number;
  statut: StatutOffreEnum;
  datePublication: string;
}

export interface CreateOffreDto {
  titre: string;
  description: string;
  lieu: string;
  dureeMois: number;
  gratification?: number;
}
