import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleEnum } from '../models/user.model';

export const roleGuard = (expectedRoles: RoleEnum[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentUser();
    if (user && expectedRoles.includes(user.role)) {
      return true;
    }

    router.navigate(['/offres']);
    return false;
  };
};
