import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterStudentDto, RegisterEntrepriseDto, RoleEnum, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private router = inject(Router);

  currentUser = signal<User | null>(this.getUserFromStorage());
  token = signal<string | null>(localStorage.getItem('access_token'));

  constructor(private http: HttpClient) {}

  registerEtudiant(dto: RegisterStudentDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register/etudiant`, dto).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  registerEntreprise(dto: RegisterEntrepriseDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register/entreprise`, dto).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    this.currentUser.set(null);
    this.token.set(null);
    this.router.navigate(['/']).then(() => {
      window.scrollTo(0, 0);
    });
  }

  /**
   * Vérifie la validité de la session auprès du backend au démarrage de l'application.
   * Si le backend a été redémarré ou si le token est invalide, déconnecte et redirige vers l'accueil (/).
   */
  validateSessionOnStart(): void {
    if (!this.isLoggedIn()) {
      return;
    }
    this.fetchCurrentUserProfile().subscribe({
      error: () => {
        console.warn('Backend redémarré ou token invalide. Redirection vers la page d\'accueil.');
        this.logout();
      }
    });
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /** Used by the JWT interceptor — only refreshes the token without re-running handleAuthSuccess */
  refreshTokenRequest(refreshToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.accessToken);
        this.token.set(res.accessToken);
      })
    );
  }

  hasRole(role: RoleEnum): boolean {
    const user = this.currentUser();
    return user ? user.role === role : false;
  }

  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem('access_token', res.accessToken);
    localStorage.setItem('refresh_token', res.refreshToken);

    const user: User = {
      id: res.userId,
      email: res.email,
      role: res.role,
      nomComplet: res.nomComplet,
      photoUrl: res.photoUrl,
      telephone: res.telephone,
      filiere: res.filiere,
      adresse: res.adresse,
      departement: res.departement,
      organisation: res.organisation
    };

    localStorage.setItem('user_data', JSON.stringify(user));
    this.currentUser.set(user);
    this.token.set(res.accessToken);
  }

  saveProfileBackend(updatedData: Partial<User>): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.apiUrl}/profile`, updatedData).pipe(
      tap(res => {
        const user: User = {
          id: res.userId || this.currentUser()?.id || 0,
          email: res.email || this.currentUser()?.email || '',
          role: res.role || this.currentUser()?.role || RoleEnum.ROLE_ETUDIANT,
          nomComplet: res.nomComplet || updatedData.nomComplet,
          photoUrl: res.photoUrl || updatedData.photoUrl,
          telephone: res.telephone || updatedData.telephone,
          filiere: res.filiere || updatedData.filiere,
          adresse: res.adresse || updatedData.adresse,
          departement: res.departement || updatedData.departement,
          organisation: res.organisation || updatedData.organisation || updatedData.filiere || updatedData.adresse || updatedData.departement
        };
        localStorage.setItem('user_data', JSON.stringify(user));
        this.currentUser.set(user);
      })
    );
  }

  fetchCurrentUserProfile(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/me`).pipe(
      tap(res => {
        const user: User = {
          id: res.userId,
          email: res.email,
          role: res.role,
          nomComplet: res.nomComplet,
          photoUrl: res.photoUrl,
          telephone: res.telephone,
          filiere: res.filiere,
          adresse: res.adresse,
          departement: res.departement,
          organisation: res.organisation
        };
        localStorage.setItem('user_data', JSON.stringify(user));
        this.currentUser.set(user);
      })
    );
  }

  updateCurrentUser(updatedData: Partial<User>): void {
    const current = this.currentUser();
    if (!current) return;
    const updated: User = { ...current, ...updatedData };
    localStorage.setItem('user_data', JSON.stringify(updated));
    this.currentUser.set(updated);
  }

  private getUserFromStorage(): User | null {
    const data = localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  }
}
