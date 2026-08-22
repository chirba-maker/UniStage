import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { RoleEnum } from './core/models/user.model';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'offres',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register-student',
    loadComponent: () => import('./features/auth/register-student/register-student.component').then(m => m.RegisterStudentComponent)
  },
  {
    path: 'auth/register-entreprise',
    loadComponent: () => import('./features/auth/register-entreprise/register-entreprise.component').then(m => m.RegisterEntrepriseComponent)
  },
  {
    path: 'auth/register-tuteur',
    loadComponent: () => import('./features/auth/register-tuteur/register-tuteur.component').then(m => m.RegisterTuteurComponent)
  },
  {
    path: 'offres',
    loadComponent: () => import('./features/offres/offres-list/offres-list.component').then(m => m.OffresListComponent)
  },
  {
    path: 'offres/creer',
    canActivate: [authGuard, roleGuard([RoleEnum.ROLE_ENTREPRISE])],
    loadComponent: () => import('./features/offres/create-offre/create-offre.component').then(m => m.CreateOffreComponent)
  },
  {
    path: 'offres/:slug',
    loadComponent: () => import('./features/offres/offre-detail/offre-detail.component').then(m => m.OffreDetailComponent)
  },
  {
    path: 'candidatures/mes-candidatures',
    canActivate: [authGuard, roleGuard([RoleEnum.ROLE_ETUDIANT])],
    loadComponent: () => import('./features/candidatures/mes-candidatures/mes-candidatures.component').then(m => m.MesCandidaturesComponent)
  },
  {
    path: 'candidatures/entreprise-board',
    canActivate: [authGuard, roleGuard([RoleEnum.ROLE_ENTREPRISE])],
    loadComponent: () => import('./features/candidatures/entreprise-candidatures/entreprise-candidatures.component').then(m => m.EntrepriseCandidaturesComponent)
  },
  {
    path: 'conventions/mes-conventions',
    canActivate: [authGuard, roleGuard([RoleEnum.ROLE_ETUDIANT])],
    loadComponent: () => import('./features/conventions/mes-conventions/mes-conventions.component').then(m => m.MesConventionsComponent)
  },
  {
    path: 'conventions/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/conventions/convention-detail/convention-detail.component').then(m => m.ConventionDetailComponent)
  },
  {
    path: 'admin/dashboard',
    canActivate: [authGuard, roleGuard([RoleEnum.ROLE_ADMIN])],
    loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'tuteur/dashboard',
    canActivate: [authGuard, roleGuard([RoleEnum.ROLE_TUTEUR])],
    loadComponent: () => import('./features/tuteur/tuteur-dashboard/tuteur-dashboard.component').then(m => m.TuteurDashboardComponent)
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
  },
  {
    path: 'profil',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profil/profil.component').then(m => m.ProfilComponent)
  },
  {
    path: '**',
    redirectTo: 'offres'
  }
];
