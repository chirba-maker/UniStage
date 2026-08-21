import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TuteurDto } from '../models/convention.model';

export interface EntrepriseDto {
  id: number;
  utilisateurId: number;
  email: string;
  nomEntreprise: string;
  rccmNif?: string;
  secteurActivite: string;
  adresse: string;
  telephone: string;
  logoUrl?: string;
  estValidee: boolean;
}

/** Modèle du journal d'audit système (alimenté par @AuditAction AOP) */
export interface SystemAuditLogDto {
  id: number;
  utilisateurId: number;
  nomUtilisateur: string;
  emailUtilisateur: string;
  roleUtilisateur: string;
  action: string;
  details: string;
  entite: string;
  entiteId: number;
  ipAdresse: string;
  dateAction: string;
  statut: 'SUCCESS' | 'ERROR';
  messageErreur?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  getEntreprises(estValidee?: boolean): Observable<EntrepriseDto[]> {
    let params = new HttpParams();
    if (estValidee !== undefined && estValidee !== null) {
      params = params.set('estValidee', estValidee);
    }
    return this.http.get<EntrepriseDto[]>(`${this.apiUrl}/entreprises`, { params });
  }

  validerEntreprise(id: number, estValidee: boolean): Observable<EntrepriseDto> {
    return this.http.put<EntrepriseDto>(`${this.apiUrl}/entreprises/${id}/valider`, {}, {
      params: new HttpParams().set('estValidee', estValidee)
    });
  }

  getTuteurs(): Observable<TuteurDto[]> {
    return this.http.get<TuteurDto[]>(`${this.apiUrl}/tuteurs`);
  }

  createTuteur(data: any): Observable<TuteurDto> {
    return this.http.post<TuteurDto>(`${this.apiUrl}/tuteurs`, data);
  }

  /** Journal d'audit système global (toutes les actions, temps réel) */
  getSystemAuditLogs(): Observable<SystemAuditLogDto[]> {
    return this.http.get<SystemAuditLogDto[]>(`${this.apiUrl}/system-audit-logs`);
  }

  /** Journal d'audit spécifique aux conventions (legacy) */
  getAuditLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/audit-logs`);
  }

  /** Résumé des actions récentes pour le widget dashboard */
  getAuditSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/audit-summary`);
  }
}
