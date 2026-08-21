import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOffreDto, OffreStage, StatutOffreEnum } from '../models/offre.model';

@Injectable({
  providedIn: 'root'
})
export class OffreService {
  private apiUrl = 'http://localhost:8080/api/offres';

  constructor(private http: HttpClient) {}

  getOffresPubliees(search?: string): Observable<OffreStage[]> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<OffreStage[]>(this.apiUrl, { params });
  }

  getOffreBySlug(slug: string): Observable<OffreStage> {
    return this.http.get<OffreStage>(`${this.apiUrl}/${slug}`);
  }

  createOffre(dto: CreateOffreDto): Observable<OffreStage> {
    return this.http.post<OffreStage>(this.apiUrl, dto);
  }

  getMesOffres(): Observable<OffreStage[]> {
    return this.http.get<OffreStage[]>(`${this.apiUrl}/mes-offres`);
  }

  getAllOffresAdmin(): Observable<OffreStage[]> {
    return this.http.get<OffreStage[]>(`${this.apiUrl}/admin/all`);
  }

  validerOffre(id: number, statut: StatutOffreEnum): Observable<OffreStage> {
    return this.http.put<OffreStage>(`${this.apiUrl}/${id}/valider`, {}, {
      params: new HttpParams().set('statut', statut)
    });
  }
}
