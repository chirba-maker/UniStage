import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalyticsDto } from '../models/analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/admin/analytics';

  getAnalytics(): Observable<AnalyticsDto> {
    return this.http.get<AnalyticsDto>(this.apiUrl);
  }
}
