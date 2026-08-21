import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { catchError, switchMap, throwError } from 'rxjs';

let isRefreshing = false;

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const token = authService.getToken();

  if (token && req.url.includes('/api/')) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      // ── 1. Erreur sur les requêtes d'authentification (me / refresh-token) ──────────────
      if (req.url.includes('/api/auth/me') || req.url.includes('/api/auth/refresh-token')) {
        if (authService.isLoggedIn()) {
          authService.logout();
        }
        return throwError(() => error);
      }

      // ── 2. 401 Unauthorized ──────────────────────────────────────────────
      if (error.status === 401 && !req.url.includes('/api/auth/login')) {
        if (!isRefreshing) {
          isRefreshing = true;
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            return authService.refreshTokenRequest(refreshToken).pipe(
              switchMap(res => {
                isRefreshing = false;
                const retryReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${res.accessToken}` }
                });
                return next(retryReq);
              }),
              catchError(refreshErr => {
                isRefreshing = false;
                authService.logout();
                toastService.warning(
                  'Session réinitialisée',
                  'Le serveur a été redémarré. Vous avez été déconnecté.'
                );
                return throwError(() => refreshErr);
              })
            );
          } else {
            isRefreshing = false;
            authService.logout();
            toastService.warning('Session réinitialisée', 'Veuillez vous reconnecter.');
          }
        }
        return throwError(() => error);
      }

      // ── 3. 403 Forbidden ─────────────────────────────────────────────────
      if (error.status === 403 && !req.url.includes('/api/auth/login')) {
        if (authService.isLoggedIn()) {
          authService.logout();
          toastService.warning('Accès réinitialisé', 'Le serveur a été redémarré. Redirection vers l\'accueil.');
        }
      }

      // ── 4. 500+ Server Error ──────────────────────────────────────────────
      if (error.status >= 500) {
        toastService.error(
          'Erreur serveur',
          'Une erreur interne est survenue. Veuillez réessayer dans quelques instants.'
        );
      }

      // ── 5. Network / offline ─────────────────────────────────────────────
      if (error.status === 0) {
        if (authService.isLoggedIn()) {
          authService.logout();
        }
        toastService.error(
          'Connexion perdue',
          'Le serveur est en cours de redémarrage ou inaccessible. Redirection vers l\'accueil.'
        );
      }

      return throwError(() => error);
    })
  );
};
