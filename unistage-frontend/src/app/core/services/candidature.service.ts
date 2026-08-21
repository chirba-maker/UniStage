import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidature, StatutCandidatureEnum } from '../models/candidature.model';

@Injectable({
  providedIn: 'root'
})
export class CandidatureService {
  private apiUrl = 'http://localhost:8080/api/candidatures';

  constructor(private http: HttpClient) {}

  postuler(offreId: number, lettreMotivation?: string, cvFile?: File): Observable<Candidature> {
    const formData = new FormData();
    formData.append('offreId', offreId.toString());
    if (lettreMotivation) {
      formData.append('lettreMotivation', lettreMotivation);
    }
    if (cvFile) {
      formData.append('cvFile', cvFile, cvFile.name);
    }
    return this.http.post<Candidature>(this.apiUrl, formData);
  }

  getMesCandidatures(): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.apiUrl}/mes-candidatures`);
  }

  getCandidaturesEntreprise(): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.apiUrl}/entreprise`);
  }

  getCandidatureById(id: number): Observable<Candidature> {
    return this.http.get<Candidature>(`${this.apiUrl}/${id}`);
  }

  updateStatut(id: number, statut: StatutCandidatureEnum): Observable<Candidature> {
    return this.http.put<Candidature>(`${this.apiUrl}/${id}/statut`, {}, {
      params: new HttpParams().set('statut', statut)
    });
  }
}
