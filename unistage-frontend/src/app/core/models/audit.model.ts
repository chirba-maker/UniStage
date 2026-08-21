export interface AuditConventionDto {
  id: number;
  conventionId: number;
  utilisateurId?: number;
  nomUtilisateur?: string;
  roleUtilisateur?: string;
  action: string;
  details?: string;
  dateAction: string;
  ipAdresse?: string;
}
