import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConventionStage, UpdateConventionDto } from '../models/convention.model';

@Injectable({
  providedIn: 'root'
})
export class ConventionService {
  private apiUrl = 'http://localhost:8080/api/conventions';

  constructor(private http: HttpClient) {}

  getMesConventions(): Observable<ConventionStage[]> {
    return this.http.get<ConventionStage[]>(`${this.apiUrl}/mes-conventions`);
  }

  getConventionsEntreprise(): Observable<ConventionStage[]> {
    return this.http.get<ConventionStage[]>(`${this.apiUrl}/entreprise`);
  }

  getConventionsTuteur(): Observable<ConventionStage[]> {
    return this.http.get<ConventionStage[]>(`${this.apiUrl}/tuteur`);
  }

  getAllConventionsAdmin(): Observable<ConventionStage[]> {
    return this.http.get<ConventionStage[]>(`${this.apiUrl}/admin/all`);
  }

  getConventionById(id: number): Observable<ConventionStage> {
    return this.http.get<ConventionStage>(`${this.apiUrl}/${id}`);
  }

  updateDetails(id: number, dto: UpdateConventionDto): Observable<ConventionStage> {
    return this.http.put<ConventionStage>(`${this.apiUrl}/${id}`, dto);
  }

  validerParEntreprise(id: number): Observable<ConventionStage> {
    return this.http.put<ConventionStage>(`${this.apiUrl}/${id}/valider-entreprise`, {});
  }

  assignerTuteur(id: number, tuteurId: number): Observable<ConventionStage> {
    return this.http.put<ConventionStage>(`${this.apiUrl}/${id}/assigner-tuteur`, { tuteurId });
  }

  validerParTuteur(id: number): Observable<ConventionStage> {
    return this.http.put<ConventionStage>(`${this.apiUrl}/${id}/valider-tuteur`, {});
  }

  getPreviewPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/preview-pdf`, { responseType: 'blob' });
  }

  getFileUrl(relativePath?: string): string {
    if (!relativePath) return '';
    return `http://localhost:8080/api/files/download/${relativePath}`;
  }
}
