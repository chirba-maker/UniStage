import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">

      <!-- ── Left Visual Panel ── -->
      <div class="auth-left">
        <div class="left-mesh-glow"></div>
        <div class="left-grid-pattern"></div>

        <div class="auth-left-inner">
          <!-- Official Platform Pill -->
          <div class="brand-top-pill">
            <span class="pulse-indicator">
              <span class="dot"></span>
              <span class="ring"></span>
            </span>
            <span>Université de Labé • République de Guinée</span>
          </div>

          <!-- Main Hero Text -->
          <div class="hero-left-content">
            <div class="brand-logo-title">
              <div class="brand-logo-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <h1>Uni<span>Stage</span></h1>
            </div>

            <h2 class="hero-headline">
              L'écosystème numérique unifié pour vos <span class="headline-gradient">stages universitaires</span>
            </h2>
            <p class="hero-desc">
              Connectez étudiants, recruteurs et tuteurs académiques sur une seule plateforme sécurisée.
            </p>

            <!-- Feature Showcase Cards -->
            <div class="features-stack">
              <div class="feature-glass-card" *ngFor="let f of features">
                <div class="feature-icon-badge" [ngClass]="f.theme">{{ f.icon }}</div>
                <div class="feature-details">
                  <strong>{{ f.title }}</strong>
                  <span>{{ f.desc }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Left Footer with national flag -->
          <div class="left-bottom-footer">
            <div class="guinea-strip">
              <span class="flag red"></span>
              <span class="flag yellow"></span>
              <span class="flag green"></span>
            </div>
            <span>Portail académique sécurisé • Direction des Études & Stages</span>
          </div>
        </div>
      </div>

      <!-- ── Right Form Panel ── -->
      <div class="auth-right">
        <div class="form-container-card">

          <div class="form-header-area">
            <div class="icon-avatar-header">👋</div>
            <h2>Bon retour parmi nous !</h2>
            <p>Saisissez vos identifiants pour accéder à votre espace de travail</p>
          </div>

          <!-- Error Alert -->
          <div class="alert-error-box" *ngIf="errorMessage()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{{ errorMessage() }}</span>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>

            <div class="form-group-field">
              <label for="email">Adresse e-mail institutionnelle / pro</label>
              <div class="input-container" [class.is-invalid]="isFieldInvalid('email')">
                <svg class="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input id="email" type="email" formControlName="email" placeholder="nom.prenom@univ-labe.edu.gn" />
              </div>
              <span class="field-err-msg" *ngIf="isFieldInvalid('email')">Format d'adresse e-mail invalide</span>
            </div>

            <div class="form-group-field">
              <div class="label-with-link">
                <label for="password">Mot de passe</label>
              </div>
              <div class="input-container" [class.is-invalid]="isFieldInvalid('password')">
                <svg class="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input id="password" [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="••••••••" />
                <button type="button" class="btn-toggle-eye" (click)="togglePasswordVisibility()" [attr.aria-label]="showPassword() ? 'Masquer' : 'Afficher'">
                  <svg *ngIf="!showPassword()" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg *ngIf="showPassword()" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
              <span class="field-err-msg" *ngIf="isFieldInvalid('password')">Veuillez saisir votre mot de passe</span>
            </div>

            <button type="submit" class="btn-login-submit" [disabled]="loginForm.invalid || isLoading()">
              <span class="spinner-inline" *ngIf="isLoading()"></span>
              <span *ngIf="!isLoading()">Se connecter à mon espace</span>
              <span *ngIf="isLoading()">Authentification en cours…</span>
              <svg *ngIf="!isLoading()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </form>

          <div class="divider-text">
            <span>Vous n'avez pas encore de compte ?</span>
          </div>

          <div class="alt-register-grid">
            <a routerLink="/auth/register-student" class="alt-btn-role alt-blue">
              <span class="role-icon">👨‍🎓</span>
              <div class="role-text">
                <strong>Créer compte Étudiant</strong>
                <small>Inscription universitaire</small>
              </div>
            </a>

            <a routerLink="/auth/register-entreprise" class="alt-btn-role alt-green">
              <span class="role-icon">🏢</span>
              <div class="role-text">
                <strong>Espace Entreprise</strong>
                <small>Recruter des stagiaires</small>
              </div>
            </a>

            <a routerLink="/auth/register-tuteur" class="alt-btn-role alt-purple">
              <span class="role-icon">🎓</span>
              <div class="role-text">
                <strong>Espace Tuteur / Enseignant</strong>
                <small>Supervision académique</small>
              </div>
            </a>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      min-height: calc(100vh - 64px);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* ── LEFT PANEL ── */
    .auth-left {
      position: relative;
      background: radial-gradient(circle at 20% 20%, #1e3a8a 0%, #0f172a 65%, #020617 100%);
      color: #fff;
      overflow: hidden;
      display: flex;
      align-items: stretch;
    }
    .left-mesh-glow {
      position: absolute;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(124, 58, 237, 0.15) 50%, transparent 70%);
      top: -100px;
      left: -100px;
      filter: blur(80px);
      pointer-events: none;
    }
    .left-grid-pattern {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 32px 32px;
      pointer-events: none;
    }
    .auth-left-inner {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 3.5rem;
      width: 100%;
      position: relative;
      z-index: 2;
    }

    /* Top Pill */
    .brand-top-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 0.4rem 1rem;
      border-radius: 99px;
      font-size: 0.76rem;
      font-weight: 700;
      color: #93c5fd;
      letter-spacing: 0.02em;
      width: fit-content;
      backdrop-filter: blur(8px);
    }
    .pulse-indicator {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 8px;
      height: 8px;
    }
    .dot {
      width: 8px;
      height: 8px;
      background: #38bdf8;
      border-radius: 50%;
    }
    .ring {
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid #38bdf8;
      animation: ripple 2s infinite ease-out;
    }
    @keyframes ripple {
      0% { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    /* Hero Text */
    .hero-left-content {
      margin: 2.5rem 0;
    }
    .brand-logo-title {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      margin-bottom: 1.5rem;
    }
    .brand-logo-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
    }
    .brand-logo-title h1 {
      font-size: 1.8rem;
      font-weight: 900;
      color: #fff;
      margin: 0;
      letter-spacing: -0.03em;
    }
    .brand-logo-title h1 span {
      color: #38bdf8;
    }
    .hero-headline {
      font-size: 2.15rem;
      font-weight: 800;
      color: #f8fafc;
      line-height: 1.2;
      letter-spacing: -0.03em;
      margin: 0 0 1rem 0;
    }
    .headline-gradient {
      background: linear-gradient(135deg, #60a5fa, #a78bfa, #38bdf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-desc {
      font-size: 0.95rem;
      line-height: 1.65;
      color: #94a3b8;
      margin-bottom: 2.5rem;
      max-width: 480px;
    }

    /* Features Stack */
    .features-stack {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .feature-glass-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 0.9rem 1.25rem;
      backdrop-filter: blur(10px);
      transition: all 0.2s ease;
    }
    .feature-glass-card:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.16);
      transform: translateX(4px);
    }
    .feature-icon-badge {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    .feature-icon-badge.blue   { background: rgba(37, 99, 235, 0.2); border: 1px solid rgba(59, 130, 246, 0.4); }
    .feature-icon-badge.green  { background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.4); }
    .feature-icon-badge.purple { background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.4); }

    .feature-details {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .feature-details strong {
      font-size: 0.88rem;
      font-weight: 700;
      color: #f1f5f9;
    }
    .feature-details span {
      font-size: 0.78rem;
      color: #94a3b8;
    }

    /* Left Footer */
    .left-bottom-footer {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.76rem;
      color: #64748b;
      font-weight: 600;
    }
    .guinea-strip {
      display: flex;
      gap: 2px;
    }
    .flag {
      width: 5px;
      height: 12px;
      border-radius: 1px;
    }
    .flag.red { background: #dc2626; }
    .flag.yellow { background: #facc15; }
    .flag.green { background: #16a34a; }

    /* ── RIGHT PANEL ── */
    .auth-right {
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
    }
    .form-container-card {
      background: #ffffff;
      border-radius: 22px;
      border: 1.5px solid #e2e8f0;
      padding: 2.75rem 2.5rem;
      width: 100%;
      max-width: 460px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);
    }
    .form-header-area {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .icon-avatar-header {
      font-size: 2.2rem;
      margin-bottom: 0.5rem;
    }
    .form-header-area h2 {
      font-size: 1.55rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0 0 0.35rem 0;
    }
    .form-header-area p {
      font-size: 0.86rem;
      color: #64748b;
      margin: 0;
      line-height: 1.5;
    }

    /* Error Alert */
    .alert-error-box {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: #fef2f2;
      border: 1.5px solid #fecaca;
      color: #dc2626;
      padding: 0.8rem 1rem;
      border-radius: 12px;
      font-size: 0.84rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }

    /* Form Fields */
    .form-group-field {
      margin-bottom: 1.25rem;
    }
    .form-group-field label {
      display: block;
      font-size: 0.82rem;
      font-weight: 700;
      color: #334155;
      margin-bottom: 0.45rem;
    }
    .input-container {
      display: flex;
      align-items: center;
      border: 1.5px solid #cbd5e1;
      border-radius: 12px;
      background: #fff;
      overflow: hidden;
      transition: all 0.2s ease;
    }
    .input-container:focus-within {
      border-color: #2563eb;
      box-shadow: 0 0 0 3.5px rgba(37, 99, 235, 0.14);
    }
    .input-container.is-invalid {
      border-color: #ef4444;
      background: #fff5f5;
    }
    .field-icon {
      color: #94a3b8;
      margin-left: 0.9rem;
      margin-right: 0.5rem;
      flex-shrink: 0;
    }
    .input-container input {
      width: 100%;
      border: none;
      outline: none;
      font-size: 0.9rem;
      color: #0f172a;
      font-weight: 500;
      padding: 0.8rem 0.85rem 0.8rem 0;
      background: transparent;
      font-family: inherit;
    }
    .input-container input::placeholder {
      color: #94a3b8;
      font-weight: 400;
    }
    .btn-toggle-eye {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 0 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }
    .btn-toggle-eye:hover {
      color: #2563eb;
    }
    .field-err-msg {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      color: #dc2626;
      margin-top: 0.35rem;
    }

    /* Submit Button */
    .btn-login-submit {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #ffffff;
      border: none;
      border-radius: 12px;
      padding: 0.88rem 1.5rem;
      font-size: 0.94rem;
      font-weight: 700;
      cursor: pointer;
      margin-top: 0.5rem;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .btn-login-submit:hover:not(:disabled) {
      background: linear-gradient(135deg, #1d4ed8, #1e40af);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45);
    }
    .btn-login-submit:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none;
    }
    .spinner-inline {
      width: 16px;
      height: 16px;
      border: 2.5px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Divider */
    .divider-text {
      position: relative;
      text-align: center;
      margin: 1.75rem 0 1.25rem;
    }
    .divider-text::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e2e8f0;
    }
    .divider-text span {
      background: #ffffff;
      padding: 0 0.85rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: #64748b;
      position: relative;
    }

    /* Alt registration buttons */
    .alt-register-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .alt-btn-role {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.75rem 0.85rem;
      border-radius: 12px;
      text-decoration: none;
      border: 1.5px solid;
      transition: all 0.2s ease;
    }
    .role-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }
    .role-text {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }
    .role-text strong {
      font-size: 0.78rem;
      font-weight: 800;
    }
    .role-text small {
      font-size: 0.68rem;
      opacity: 0.8;
    }
    .alt-blue {
      color: #1d4ed8;
      background: #eff6ff;
      border-color: #bfdbfe;
    }
    .alt-blue:hover {
      background: #dbeafe;
      border-color: #93c5fd;
      transform: translateY(-1px);
    }
    .alt-green {
      color: #047857;
      background: #ecfdf5;
      border-color: #a7f3d0;
    }
    .alt-green:hover {
      background: #d1fae5;
      border-color: #6ee7b7;
      transform: translateY(-1px);
    }
    .alt-purple {
      color: #6d28d9;
      background: #f5f3ff;
      border-color: #ddd6fe;
      grid-column: span 2;
    }
    .alt-purple:hover {
      background: #ede9fe;
      border-color: #c4b5fd;
      transform: translateY(-1px);
    }

    @media (max-width: 900px) {
      .auth-page { grid-template-columns: 1fr; }
      .auth-left { display: none; }
      .auth-right { padding: 2rem 1rem; }
      .form-container-card { padding: 2rem 1.5rem; }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal<boolean>(false);

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  features = [
    { icon: '🎓', theme: 'blue',   title: 'Espace Étudiants', desc: 'Postulez aux offres, uploadez votre CV et suivez vos candidatures' },
    { icon: '🏢', theme: 'green',  title: 'Espace Entreprises', desc: 'Publiez des offres vérifiées et recrutez les meilleurs talents de Labé' },
    { icon: '👨‍🏫', theme: 'purple', title: 'Suivi Académique', desc: 'Supervision tripartite et génération de conventions signées' },
  ];

  loginForm: FormGroup = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  fillAccount(email: string): void {
    this.loginForm.patchValue({
      email: email,
      password: 'password123'
    });
  }

  isFieldInvalid(field: string): boolean {
    const c = this.loginForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        const user = this.authService.currentUser();
        if (user?.role === 'ROLE_ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (user?.role === 'ROLE_ENTREPRISE') {
          this.router.navigate(['/candidatures/entreprise-board']);
        } else if (user?.role === 'ROLE_TUTEUR') {
          this.router.navigate(['/tuteur/dashboard']);
        } else {
          this.router.navigate(['/offres']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Identifiants incorrects. Réessayez.');
      }
    });
  }
}
