import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { catchError, switchMap, throwError } from 'rxjs';

// Track in-flight refresh attempts to avoid infinite loops
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

      // ── 401 Unauthorized ──────────────────────────────────────────────
      if (error.status === 401 && !req.url.includes('/api/auth/login') && !req.url.includes('/api/auth/refresh-token')) {
        if (!isRefreshing) {
          isRefreshing = true;
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            return authService.refreshTokenRequest(refreshToken).pipe(
              switchMap(res => {
                isRefreshing = false;
                // Retry original request with new token
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
                  'Le serveur a été redémarré. Vous avez été redirigé vers l\'accueil.'
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

      // ── 403 Forbidden ─────────────────────────────────────────────────
      if (error.status === 403 && !req.url.includes('/api/auth/login')) {
        if (authService.isLoggedIn()) {
          authService.logout();
          toastService.warning('Accès réinitialisé', 'Le serveur a été redémarré. Redirection vers l\'accueil.');
        }
      }

      // ── 500+ Server Error ──────────────────────────────────────────────
      if (error.status >= 500) {
        toastService.error(
          'Erreur serveur',
          'Une erreur interne est survenue. Veuillez réessayer dans quelques instants.'
        );
      }

      // ── Network / offline ─────────────────────────────────────────────
      if (error.status === 0) {
        toastService.error(
          'Connexion perdue',
          'Impossible de contacter le serveur. Vérifiez votre connexion internet.'
        );
      }

      return throwError(() => error);
    })
  );
};
