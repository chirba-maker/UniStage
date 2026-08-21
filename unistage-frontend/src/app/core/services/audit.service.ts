import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditConventionDto } from '../models/audit.model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/conventions';

  getAuditTrail(conventionId: number): Observable<AuditConventionDto[]> {
    return this.http.get<AuditConventionDto[]>(`${this.apiUrl}/${conventionId}/audit-trail`);
  }
}
