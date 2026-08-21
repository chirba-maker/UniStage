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
}
