import { Component, OnInit, OnDestroy, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RoleEnum } from '../../../core/models/user.model';
import { Subscription, interval } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="navbar-shell">
      <nav class="navbar-inner">

        <!-- Brand -->
        <a routerLink="/offres" class="brand">
          <div class="brand-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <span class="brand-text">Uni<span>Stage</span></span>
          <span class="brand-pill">Univ. de Labé</span>
        </a>

        <!-- Center Nav Links -->
        <div class="nav-center">
          <a routerLink="/offres" routerLinkActive="nav-active" class="nav-link">
            Offres de Stage
          </a>

          <ng-container *ngIf="authService.isLoggedIn()">
            <a *ngIf="authService.hasRole(roleEnum.ROLE_ETUDIANT)"
               routerLink="/candidatures/mes-candidatures"
               routerLinkActive="nav-active" class="nav-link">
              Mes Candidatures
            </a>
            <a *ngIf="authService.hasRole(roleEnum.ROLE_ETUDIANT)"
               routerLink="/conventions/mes-conventions"
               routerLinkActive="nav-active" class="nav-link">
              Mes Conventions
            </a>
            <a *ngIf="authService.hasRole(roleEnum.ROLE_ENTREPRISE)"
               routerLink="/candidatures/entreprise-board"
               routerLinkActive="nav-active" class="nav-link">
              Candidats reçus
            </a>
            <a *ngIf="authService.hasRole(roleEnum.ROLE_TUTEUR)"
               routerLink="/tuteur/dashboard"
               routerLinkActive="nav-active" class="nav-link">
              Espace Tuteur
            </a>
            <a *ngIf="authService.hasRole(roleEnum.ROLE_ADMIN)"
               routerLink="/admin/dashboard"
               routerLinkActive="nav-active" class="nav-link">
              Administration
            </a>
          </ng-container>
        </div>

        <!-- Right Actions -->
        <div class="nav-actions">

          <!-- Not logged in -->
          <ng-container *ngIf="!authService.isLoggedIn()">
            <a routerLink="/auth/login" class="btn-nav-ghost">Connexion</a>
            <a routerLink="/auth/register-student" class="btn-nav-primary">Espace Étudiant</a>
            <a routerLink="/auth/register-entreprise" class="btn-nav-green">Espace Recruteur</a>
          </ng-container>

          <!-- Logged in -->
          <ng-container *ngIf="authService.isLoggedIn()">
            <!-- "+ Offre" button for enterprise -->
            <a *ngIf="authService.hasRole(roleEnum.ROLE_ENTREPRISE)"
               routerLink="/offres/creer" class="btn-nav-add">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nouvelle Offre
            </a>

            <!-- Notifications -->
            <a routerLink="/notifications" class="notif-btn" title="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span class="notif-dot" *ngIf="notificationService.unreadCount() > 0">
                {{ notificationService.unreadCount() }}
              </span>
            </a>

            <!-- User chip — cliquable → profil -->
            <a routerLink="/profil" class="user-chip" title="Mon profil">
              <div class="user-avatar">
                <img *ngIf="authService.currentUser()?.photoUrl" [src]="authService.currentUser()?.photoUrl" class="user-avatar-img" alt="Photo" />
                <span *ngIf="!authService.currentUser()?.photoUrl">
                  {{ (authService.currentUser()?.nomComplet || authService.currentUser()?.email)?.charAt(0)?.toUpperCase() }}
                </span>
              </div>
              <div class="user-info">
                <span class="user-email">{{ authService.currentUser()?.nomComplet || authService.currentUser()?.email }}</span>
                <span class="user-role">{{ formatRole(authService.currentUser()?.role) }}</span>
              </div>
            </a>

            <button (click)="authService.logout()" class="btn-nav-logout">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Déconnexion
            </button>
          </ng-container>
        </div>
        <!-- Hamburger button (Mobile) -->
        <button class="btn-hamburger" (click)="mobileMenuOpen.set(!mobileMenuOpen())" [attr.aria-expanded]="mobileMenuOpen()" aria-label="Menu principal">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="3" y1="6" x2="21" y2="6" *ngIf="!mobileMenuOpen()"/>
            <line x1="3" y1="12" x2="21" y2="12" *ngIf="!mobileMenuOpen()"/>
            <line x1="3" y1="18" x2="21" y2="18" *ngIf="!mobileMenuOpen()"/>
            <line x1="18" y1="6" x2="6" y2="18" *ngIf="mobileMenuOpen()"/>
            <line x1="6" y1="6" x2="18" y2="18" *ngIf="mobileMenuOpen()"/>
          </svg>
        </button>

      </nav>

      <!-- Mobile Backdrop -->
      <div class="mobile-backdrop" *ngIf="mobileMenuOpen()" (click)="mobileMenuOpen.set(false)"></div>

      <!-- Mobile Drawer Menu -->
      <div class="mobile-drawer" [class.open]="mobileMenuOpen()">
        <div class="mobile-drawer-inner">
          <a routerLink="/offres" routerLinkActive="mobile-nav-active" (click)="mobileMenuOpen.set(false)" class="mobile-nav-link">
            🔍 Offres de Stage
          </a>

          <ng-container *ngIf="authService.isLoggedIn()">
            <a *ngIf="authService.hasRole(roleEnum.ROLE_ETUDIANT)"
               routerLink="/candidatures/mes-candidatures"
               routerLinkActive="mobile-nav-active" (click)="mobileMenuOpen.set(false)" class="mobile-nav-link">
              📂 Mes Candidatures
            </a>
            <a *ngIf="authService.hasRole(roleEnum.ROLE_ETUDIANT)"
               routerLink="/conventions/mes-conventions"
               routerLinkActive="mobile-nav-active" (click)="mobileMenuOpen.set(false)" class="mobile-nav-link">
              📜 Mes Conventions
            </a>
            <a *ngIf="authService.hasRole(roleEnum.ROLE_ENTREPRISE)"
               routerLink="/candidatures/entreprise-board"
               routerLinkActive="mobile-nav-active" (click)="mobileMenuOpen.set(false)" class="mobile-nav-link">
              👥 Candidats reçus
            </a>
            <a *ngIf="authService.hasRole(roleEnum.ROLE_ENTREPRISE)"
               routerLink="/offres/creer"
               routerLinkActive="mobile-nav-active" (click)="mobileMenuOpen.set(false)" class="mobile-nav-link highlight">
              ➕ Publier une nouvelle offre
            </a>
            <a *ngIf="authService.hasRole(roleEnum.ROLE_TUTEUR)"
               routerLink="/tuteur/dashboard"
               routerLinkActive="mobile-nav-active" (click)="mobileMenuOpen.set(false)" class="mobile-nav-link">
              🎓 Espace Tuteur
            </a>
            <a *ngIf="authService.hasRole(roleEnum.ROLE_ADMIN)"
               routerLink="/admin/dashboard"
               routerLinkActive="mobile-nav-active" (click)="mobileMenuOpen.set(false)" class="mobile-nav-link">
              ⚙️ Administration
            </a>
            <a routerLink="/notifications" (click)="mobileMenuOpen.set(false)" class="mobile-nav-link">
              🔔 Notifications ({{ notificationService.unreadCount() }})
            </a>
            <a routerLink="/profil" (click)="mobileMenuOpen.set(false)" class="mobile-nav-link">
              👤 Mon Profil
            </a>
            <button (click)="authService.logout(); mobileMenuOpen.set(false)" class="mobile-btn-logout">
              🚪 Déconnexion
            </button>
          </ng-container>

          <ng-container *ngIf="!authService.isLoggedIn()">
            <a routerLink="/auth/login" (click)="mobileMenuOpen.set(false)" class="mobile-nav-btn btn-ghost">Connexion</a>
            <a routerLink="/auth/register-student" (click)="mobileMenuOpen.set(false)" class="mobile-nav-btn btn-primary">Espace Étudiant</a>
            <a routerLink="/auth/register-entreprise" (click)="mobileMenuOpen.set(false)" class="mobile-nav-btn btn-green">Espace Recruteur</a>
          </ng-container>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar-shell {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255, 255, 255, 0.90);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(226, 232, 240, 0.8);
      box-shadow: 0 1px 0 rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.03);
    }
    .navbar-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1.5rem;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    /* Brand */
    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      flex-shrink: 0;
    }
    .brand-logo {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);
    }
    .brand-text {
      font-size: 1.1rem;
      font-weight: 800;
      color: #1e293b;
      letter-spacing: -0.02em;
    }
    .brand-text span { color: #2563eb; }
    .brand-pill {
      font-size: 0.7rem;
      font-weight: 600;
      color: #64748b;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      letter-spacing: 0.01em;
      white-space: nowrap;
    }

    /* Center nav */
    .nav-center {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .nav-link {
      font-size: 0.875rem;
      font-weight: 500;
      color: #475569;
      text-decoration: none;
      padding: 0.45rem 0.75rem;
      border-radius: 8px;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .nav-link:hover {
      color: #1e293b;
      background: #f1f5f9;
    }
    .nav-link.nav-active {
      color: #2563eb;
      background: #eff6ff;
      font-weight: 600;
    }

    /* Right actions */
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    /* Nav Buttons */
    .btn-nav-ghost {
      font-size: 0.875rem;
      font-weight: 500;
      color: #475569;
      text-decoration: none;
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      border: 1.5px solid #e2e8f0;
      transition: all 0.2s ease;
    }
    .btn-nav-ghost:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      color: #1e293b;
    }
    .btn-nav-primary {
      font-size: 0.875rem;
      font-weight: 600;
      color: #fff;
      text-decoration: none;
      padding: 0.45rem 0.95rem;
      border-radius: 8px;
      background: #2563eb;
      box-shadow: 0 1px 3px rgba(37,99,235,0.3);
      transition: all 0.2s ease;
    }
    .btn-nav-primary:hover {
      background: #1d4ed8;
      box-shadow: 0 4px 12px rgba(37,99,235,0.35);
      transform: translateY(-1px);
      color: #fff;
    }
    .btn-nav-green {
      font-size: 0.875rem;
      font-weight: 600;
      color: #fff;
      text-decoration: none;
      padding: 0.45rem 0.95rem;
      border-radius: 8px;
      background: #059669;
      box-shadow: 0 1px 3px rgba(5,150,105,0.3);
      transition: all 0.2s ease;
    }
    .btn-nav-green:hover {
      background: #047857;
      box-shadow: 0 4px 12px rgba(5,150,105,0.35);
      transform: translateY(-1px);
      color: #fff;
    }
    .btn-nav-add {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #2563eb;
      text-decoration: none;
      padding: 0.4rem 0.8rem;
      border-radius: 8px;
      background: #eff6ff;
      border: 1.5px solid #bfdbfe;
      transition: all 0.2s ease;
    }
    .btn-nav-add:hover {
      background: #dbeafe;
      border-color: #93c5fd;
      color: #1d4ed8;
    }
    .btn-nav-logout {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #ef4444;
      background: transparent;
      border: 1.5px solid #fecaca;
      padding: 0.4rem 0.8rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-nav-logout:hover {
      background: #fef2f2;
      border-color: #fca5a5;
    }

    /* Notifications */
    .notif-btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 9px;
      border: 1.5px solid #e2e8f0;
      color: #64748b;
      transition: all 0.2s ease;
      background: #fff;
    }
    .notif-btn:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
      color: #1e293b;
    }
    .notif-dot {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ef4444;
      color: #fff;
      font-size: 0.6rem;
      font-weight: 700;
      min-width: 16px;
      height: 16px;
      padding: 0 3px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #fff;
    }

    /* User chip */
    .user-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.3rem 0.6rem 0.3rem 0.3rem;
      border-radius: 10px;
      border: 1.5px solid #e2e8f0;
      background: #fff;
      cursor: pointer;
      text-decoration: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .user-chip:hover {
      border-color: #93c5fd;
      box-shadow: 0 2px 8px rgba(37,99,235,0.1);
    }
    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .user-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .user-info {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }
    .user-email {
      font-size: 0.75rem;
      font-weight: 600;
      color: #1e293b;
      max-width: 130px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    /* Hamburger button */
    .btn-hamburger {
      display: none;
      background: transparent;
      border: none;
      color: #334155;
      padding: 0.4rem;
      cursor: pointer;
      border-radius: 8px;
      transition: background 0.2s;
    }
    .btn-hamburger:hover {
      background: #f1f5f9;
    }

    /* Mobile drawer & backdrop */
    .mobile-backdrop {
      position: fixed;
      inset: 0;
      top: 64px;
      background: rgba(15, 23, 42, 0.4);
      -webkit-backdrop-filter: blur(4px);
      backdrop-filter: blur(4px);
      z-index: 98;
    }
    .mobile-drawer {
      display: none;
      position: fixed;
      top: 64px;
      left: 0;
      right: 0;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 12px 32px rgba(0,0,0,0.15);
      z-index: 99;
      transform: translateY(-100%);
      opacity: 0;
      transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
      pointer-events: none;
    }
    .mobile-drawer.open {
      transform: translateY(0);
      opacity: 1;
      pointer-events: all;
    }
    .mobile-drawer-inner {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: calc(100vh - 80px);
      overflow-y: auto;
    }
    .mobile-nav-link {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      font-size: 0.92rem;
      font-weight: 600;
      color: #334155;
      text-decoration: none;
      transition: all 0.2s;
    }
    .mobile-nav-link:hover, .mobile-nav-active {
      background: #eff6ff;
      color: #2563eb;
    }
    .mobile-nav-link.highlight {
      background: #2563eb;
      color: #fff;
    }
    .mobile-btn-logout {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      font-size: 0.92rem;
      font-weight: 600;
      color: #ef4444;
      background: #fef2f2;
      border: 1px solid #fca5a5;
      cursor: pointer;
      font-family: inherit;
      margin-top: 0.5rem;
    }
    .mobile-nav-btn {
      display: block;
      text-align: center;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 700;
      text-decoration: none;
      margin-bottom: 0.35rem;
    }
    .mobile-nav-btn.btn-ghost { background: #f8fafc; color: #334155; border: 1px solid #cbd5e1; }
    .mobile-nav-btn.btn-primary { background: #2563eb; color: #fff; }
    .mobile-nav-btn.btn-green { background: #16a34a; color: #fff; }

    @media (max-width: 900px) {
      .nav-center, .nav-actions { display: none !important; }
      .btn-hamburger { display: block; }
      .mobile-drawer { display: block; }
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  roleEnum = RoleEnum;
  mobileMenuOpen = signal<boolean>(false);

  private pollSub?: Subscription;

  constructor() {
    // Re-fetch count whenever login state changes
    effect(() => {
      const loggedIn = this.authService.isLoggedIn();
      if (loggedIn) {
        this.startPolling();
      } else {
        this.stopPolling();
        this.notificationService.unreadCount.set(0);
      }
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.startPolling();
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private startPolling(): void {
    this.stopPolling();
    // Immediate fetch
    this.notificationService.fetchUnreadCount().subscribe();
    // Then poll every 30 seconds
    this.pollSub = interval(30_000).subscribe(() => {
      if (this.authService.isLoggedIn()) {
        this.notificationService.fetchUnreadCount().subscribe();
      }
    });
  }

  private stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
  }

  formatRole(role?: string): string {
    const map: Record<string, string> = {
      'ROLE_ETUDIANT':   'Étudiant',
      'ROLE_ENTREPRISE': 'Entreprise',
      'ROLE_TUTEUR':     'Tuteur',
      'ROLE_ADMIN':      'Administrateur',
    };
    return role ? (map[role] ?? role) : '';
  }
}
