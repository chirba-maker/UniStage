import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RapportStageDto, SubmitRapportDto, EvaluationTuteurDto, SubmitEvaluationDto } from '../models/rapport-evaluation.model';

@Injectable({
  providedIn: 'root'
})
export class RapportEvaluationService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/conventions';

  // Dépôt de rapport de stage par l'étudiant
  submitRapport(conventionId: number, dto: SubmitRapportDto, file: File): Observable<RapportStageDto> {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
    formData.append('data', jsonBlob);
    formData.append('file', file);

    return this.http.post<RapportStageDto>(`${this.apiUrl}/${conventionId}/rapport`, formData);
  }

  // Obtenir le rapport de stage d'une convention
  getRapport(conventionId: number): Observable<RapportStageDto> {
    return this.http.get<RapportStageDto>(`${this.apiUrl}/${conventionId}/rapport`);
  }

  // Dépôt de la fiche d'évaluation par le tuteur
  submitEvaluation(conventionId: number, dto: SubmitEvaluationDto, file?: File): Observable<EvaluationTuteurDto> {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
    formData.append('data', jsonBlob);
    if (file) {
      formData.append('file', file);
    }

    return this.http.post<EvaluationTuteurDto>(`${this.apiUrl}/${conventionId}/evaluation`, formData);
  }

  // Obtenir la fiche d'évaluation d'une convention
  getEvaluation(conventionId: number): Observable<EvaluationTuteurDto> {
    return this.http.get<EvaluationTuteurDto>(`${this.apiUrl}/${conventionId}/evaluation`);
  }
}
