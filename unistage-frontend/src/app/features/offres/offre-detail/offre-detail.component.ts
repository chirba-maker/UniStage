import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OffreService } from '../../../core/services/offre.service';
import { CandidatureService } from '../../../core/services/candidature.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { OffreStage } from '../../../core/models/offre.model';
import { RoleEnum } from '../../../core/models/user.model';

@Component({
  selector: 'app-offre-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Loading state -->
    <div class="loading-page" *ngIf="!offre() && !pageError()">
      <div class="spinner"></div>
      <p>Chargement de l'offre…</p>
    </div>

    <!-- Error state -->
    <div class="error-page" *ngIf="pageError()">
      <div class="error-icon">⚠️</div>
      <h3>Offre introuvable</h3>
      <p>Cette offre n'existe pas ou a été supprimée.</p>
      <a routerLink="/offres" class="btn-back">← Retour aux offres</a>
    </div>

    <!-- Main content -->
    <div class="detail-page" *ngIf="offre()">

      <!-- Breadcrumb -->
      <div class="breadcrumb-bar">
        <div class="bc-inner">
          <a routerLink="/offres" class="bc-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Toutes les offres
          </a>
          <span class="bc-sep">›</span>
          <span class="bc-current">{{ offre()?.titre }}</span>
        </div>
      </div>

      <!-- Hero Banner -->
      <div class="offre-hero">
        <div class="hero-inner">
          <div class="hero-company">
            <div class="company-logo-xl">{{ offre()?.nomEntreprise?.charAt(0) }}</div>
            <div class="company-details">
              <div class="company-verified">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                Entreprise vérifiée
              </div>
              <h3 class="company-name-xl">{{ offre()?.nomEntreprise }}</h3>
            </div>
          </div>
          <h1 class="offre-title-hero">{{ offre()?.titre }}</h1>
          <div class="offre-quick-tags">
            <span class="qtag">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ offre()?.lieu }}
            </span>
            <span class="qtag">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ offre()?.dureeMois }} mois
            </span>
            <span class="qtag qtag-green" *ngIf="offre()?.gratification && offre()!.gratification! > 0">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              {{ offre()?.gratification | number:'1.0-0' }} GNF/mois
            </span>
            <span class="qtag qtag-orange" *ngIf="!offre()?.gratification || offre()!.gratification! === 0">
              Non rémunéré
            </span>
            <span class="qtag qtag-muted">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Publié le {{ offre()?.datePublication | date:'dd MMM yyyy' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="detail-layout">
        <div class="layout-inner">

          <!-- Left: Description -->
          <div class="main-col">
            <div class="section-card">
              <h2 class="section-title">Description du poste</h2>
              <div class="description-text">{{ offre()?.description }}</div>
            </div>

            <div class="section-card info-grid">
              <h2 class="section-title">Informations clés</h2>
              <div class="info-items">
                <div class="info-item">
                  <div class="info-icon blue">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div>
                    <span>Lieu de stage</span>
                    <strong>{{ offre()?.lieu }}</strong>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-icon purple">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div>
                    <span>Durée du stage</span>
                    <strong>{{ offre()?.dureeMois }} mois</strong>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-icon green">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <div>
                    <span>Gratification mensuelle</span>
                    <strong>{{ offre()?.gratification ? (offre()!.gratification! | number:'1.0-0') + ' GNF' : 'Non rémunéré' }}</strong>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-icon orange">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div>
                    <span>Date de publication</span>
                    <strong>{{ offre()?.datePublication | date:'dd MMMM yyyy' }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Apply Sidebar -->
          <div class="side-col">
            <div class="apply-card">

              <!-- Not logged in -->
              <div class="apply-gate" *ngIf="!isLoggedIn()">
                <div class="gate-icon">🔐</div>
                <h4>Connexion requise</h4>
                <p>Connectez-vous en tant qu'<strong>Étudiant</strong> pour postuler à cette offre.</p>
                <a routerLink="/auth/login" class="btn-full-primary">Se connecter</a>
                <a routerLink="/auth/register-student" class="btn-full-ghost">Créer un compte →</a>
              </div>

              <!-- Wrong role -->
              <div class="apply-gate" *ngIf="isLoggedIn() && !isStudent()">
                <div class="gate-icon">⚠️</div>
                <h4>Accès réservé</h4>
                <p>Seuls les comptes <strong>Étudiant</strong> peuvent postuler.</p>
              </div>

              <!-- Student form -->
              <div *ngIf="isLoggedIn() && isStudent()">
                <!-- Success -->
                <div class="apply-success" *ngIf="successMessage()">
                  <div class="success-icon">✅</div>
                  <h4>Candidature envoyée !</h4>
                  <p>{{ successMessage() }}</p>
                  <a routerLink="/candidatures/mes-candidatures" class="btn-full-primary">Voir mes candidatures</a>
                </div>

                <!-- Form -->
                <div *ngIf="!successMessage()">
                  <div class="apply-header">
                    <h3>Postuler à cette offre</h3>
                    <p>Complétez votre candidature ci-dessous</p>
                  </div>

                  <div class="alert-error" *ngIf="errorMessage()">{{ errorMessage() }}</div>

                  <form (ngSubmit)="onPostuler()">
                    <div class="field">
                      <label>Lettre de motivation <span class="optional">(optionnel)</span></label>
                      <textarea
                        [(ngModel)]="lettreMotivation"
                        name="lettreMotivation"
                        rows="5"
                        placeholder="Présentez vos motivations pour ce poste…"
                      ></textarea>
                    </div>

                    <div class="field">
                      <label>CV au format PDF <span class="optional">(optionnel)</span></label>
                      <div class="file-input-wrap" (click)="cvInput.click()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                        <span *ngIf="!selectedCvFile">Cliquez pour sélectionner un fichier PDF</span>
                        <span *ngIf="selectedCvFile" class="file-name">{{ selectedCvFile.name }}</span>
                        <input #cvInput type="file" accept="application/pdf" (change)="onFileSelected($event)" style="display:none" />
                      </div>
                      <p class="field-hint">Si vide, votre CV de profil sera utilisé.</p>
                    </div>

                    <button type="submit" class="btn-submit-apply" [disabled]="submitting()">
                      <span class="btn-spinner" *ngIf="submitting()"></span>
                      <svg *ngIf="!submitting()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      {{ submitting() ? 'Envoi en cours…' : 'Soumettre ma candidature' }}
                    </button>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Loading & Error */
    .loading-page, .error-page {
      text-align: center;
      padding: 6rem 2rem;
      color: #64748b;
    }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid #e2e8f0;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error-icon { font-size: 3rem; margin-bottom: 1rem; }
    .error-page h3 { font-size: 1.3rem; color: #1e293b; margin-bottom: 0.5rem; }
    .btn-back {
      display: inline-flex; align-items: center; gap: 0.4rem;
      margin-top: 1.5rem; font-size: 0.875rem; font-weight: 600;
      color: #2563eb; text-decoration: none; background: #eff6ff;
      padding: 0.6rem 1.2rem; border-radius: 9px;
    }

    /* Breadcrumb */
    .breadcrumb-bar {
      background: #fff;
      border-bottom: 1px solid #f1f5f9;
    }
    .bc-inner {
      max-width: 1200px; margin: 0 auto;
      padding: 0.75rem 1.5rem;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .bc-link {
      display: inline-flex; align-items: center; gap: 0.25rem;
      font-size: 0.82rem; font-weight: 600; color: #64748b; text-decoration: none;
    }
    .bc-link:hover { color: #2563eb; }
    .bc-sep { color: #cbd5e1; font-size: 0.9rem; }
    .bc-current { font-size: 0.82rem; color: #334155; font-weight: 500;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 400px; }

    /* Hero */
    .offre-hero {
      background: linear-gradient(160deg, #0f172a 0%, #1e3a5f 100%);
      padding: 3rem 1.5rem;
    }
    .hero-inner { max-width: 1200px; margin: 0 auto; }
    .hero-company {
      display: flex; align-items: center; gap: 0.9rem; margin-bottom: 1.25rem;
    }
    .company-logo-xl {
      width: 52px; height: 52px; border-radius: 12px;
      background: linear-gradient(135deg, #1d4ed8, #2563eb);
      border: 2px solid rgba(255,255,255,0.15);
      color: #fff; font-size: 1.4rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
    }
    .company-details { display: flex; flex-direction: column; gap: 0.25rem; }
    .company-verified {
      display: inline-flex; align-items: center; gap: 0.25rem;
      font-size: 0.72rem; font-weight: 700; color: #34d399;
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .company-name-xl { font-size: 1rem; font-weight: 700; color: #fff; margin: 0; }
    .offre-title-hero {
      font-size: clamp(1.5rem, 3vw, 2.2rem);
      font-weight: 800; color: #fff;
      letter-spacing: -0.02em; line-height: 1.2;
      margin-bottom: 1.25rem;
    }
    .offre-quick-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .qtag {
      display: inline-flex; align-items: center; gap: 0.3rem;
      font-size: 0.78rem; font-weight: 600;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      color: #cbd5e1; padding: 0.3rem 0.75rem; border-radius: 99px;
    }
    .qtag-green { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.25); color: #34d399; }
    .qtag-orange { background: rgba(245,158,11,0.15); border-color: rgba(245,158,11,0.25); color: #fbbf24; }
    .qtag-muted { color: #64748b; }

    /* Layout */
    .detail-layout { background: #f8fafc; padding: 2.5rem 1.5rem 5rem; }
    .layout-inner {
      max-width: 1200px; margin: 0 auto;
      display: grid; grid-template-columns: 1fr 380px; gap: 2rem; align-items: start;
    }

    /* Cards */
    .section-card {
      background: #fff; border: 1.5px solid #e2e8f0;
      border-radius: 16px; padding: 1.75rem; margin-bottom: 1.25rem;
    }
    .section-title {
      font-size: 1.05rem; font-weight: 700; color: #0f172a;
      margin-bottom: 1.25rem; padding-bottom: 0.75rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .description-text {
      font-size: 0.9rem; color: #475569; line-height: 1.8;
      white-space: pre-line;
    }
    .info-items { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .info-item {
      display: flex; align-items: center; gap: 0.75rem;
      background: #f8fafc; border: 1px solid #f1f5f9;
      border-radius: 10px; padding: 0.9rem;
    }
    .info-icon {
      width: 38px; height: 38px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .info-icon.blue   { background: #eff6ff; color: #2563eb; }
    .info-icon.purple { background: #f5f3ff; color: #7c3aed; }
    .info-icon.green  { background: #ecfdf5; color: #059669; }
    .info-icon.orange { background: #fffbeb; color: #d97706; }
    .info-item div { display: flex; flex-direction: column; gap: 0.15rem; }
    .info-item span { font-size: 0.72rem; color: #94a3b8; font-weight: 500; }
    .info-item strong { font-size: 0.88rem; color: #1e293b; font-weight: 700; }

    /* Apply sidebar */
    .apply-card {
      background: #fff; border: 1.5px solid #e2e8f0;
      border-radius: 16px; padding: 1.75rem;
      position: sticky; top: 88px;
    }
    .apply-header { margin-bottom: 1.5rem; }
    .apply-header h3 { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-bottom: 0.25rem; }
    .apply-header p { font-size: 0.82rem; color: #64748b; }

    .apply-gate { text-align: center; padding: 1rem 0; }
    .gate-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
    .apply-gate h4 { font-size: 1rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem; }
    .apply-gate p { font-size: 0.85rem; color: #64748b; margin-bottom: 1.25rem; line-height: 1.6; }

    .apply-success { text-align: center; padding: 1rem 0; }
    .success-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
    .apply-success h4 { font-size: 1.1rem; font-weight: 700; color: #059669; margin-bottom: 0.5rem; }
    .apply-success p { font-size: 0.85rem; color: #64748b; margin-bottom: 1.25rem; }

    .alert-error {
      background: #fef2f2; border: 1.5px solid #fecaca;
      color: #dc2626; padding: 0.75rem; border-radius: 9px;
      font-size: 0.82rem; margin-bottom: 1rem;
    }

    .field { margin-bottom: 1.1rem; }
    .field label {
      display: block; font-size: 0.8rem; font-weight: 600;
      color: #374151; margin-bottom: 0.4rem;
    }
    .optional { color: #94a3b8; font-weight: 400; }
    .field textarea {
      width: 100%; border: 1.5px solid #e2e8f0; border-radius: 10px;
      padding: 0.75rem; font-size: 0.85rem; color: #1e293b;
      font-family: inherit; resize: vertical; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .field textarea:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    }
    .field textarea::placeholder { color: #94a3b8; }

    .file-input-wrap {
      display: flex; align-items: center; gap: 0.75rem;
      border: 2px dashed #e2e8f0; border-radius: 10px;
      padding: 1rem; cursor: pointer; color: #94a3b8;
      font-size: 0.82rem; transition: all 0.2s;
      background: #f8fafc;
    }
    .file-input-wrap:hover { border-color: #93c5fd; color: #2563eb; background: #eff6ff; }
    .file-name { color: #2563eb; font-weight: 600; }
    .field-hint { font-size: 0.75rem; color: #94a3b8; margin-top: 0.35rem; }

    .btn-full-primary, .btn-full-ghost {
      display: block; width: 100%; text-align: center;
      padding: 0.75rem; border-radius: 10px; font-size: 0.875rem;
      font-weight: 600; text-decoration: none; margin-bottom: 0.5rem;
      transition: all 0.2s;
    }
    .btn-full-primary { background: #2563eb; color: #fff; box-shadow: 0 2px 8px rgba(37,99,235,0.25); }
    .btn-full-primary:hover { background: #1d4ed8; color: #fff; }
    .btn-full-ghost { background: transparent; color: #64748b; border: 1.5px solid #e2e8f0; }
    .btn-full-ghost:hover { background: #f1f5f9; }

    .btn-submit-apply {
      width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      background: #2563eb; color: #fff; border: none; border-radius: 10px;
      padding: 0.8rem; font-size: 0.875rem; font-weight: 700;
      cursor: pointer; font-family: inherit; margin-top: 0.5rem;
      box-shadow: 0 2px 10px rgba(37,99,235,0.3);
      transition: all 0.2s;
    }
    .btn-submit-apply:hover:not(:disabled) {
      background: #1d4ed8;
      box-shadow: 0 6px 20px rgba(37,99,235,0.4);
      transform: translateY(-1px);
    }
    .btn-submit-apply:disabled { opacity: 0.55; cursor: not-allowed; }
    .btn-spinner {
      width: 16px; height: 16px;
      border: 2.5px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%; animation: spin 0.7s linear infinite;
    }

    @media (max-width: 900px) {
      .layout-inner { grid-template-columns: 1fr; }
      .apply-card { position: static; }
      .info-items { grid-template-columns: 1fr; }
    }
  `]
})
export class OffreDetailComponent implements OnInit {
  offre = signal<OffreStage | null>(null);
  pageError = signal<boolean>(false);
  lettreMotivation = '';
  selectedCvFile: File | null = null;
  submitting = signal<boolean>(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  private toastService = inject(ToastService);

  constructor(
    private route: ActivatedRoute,
    private offreService: OffreService,
    private candidatureService: CandidatureService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.offreService.getOffreBySlug(slug).subscribe({
        next: (data) => this.offre.set(data),
        error: () => this.pageError.set(true)
      });
    }
  }

  isLoggedIn(): boolean { return this.authService.isLoggedIn(); }
  isStudent(): boolean { return this.authService.hasRole(RoleEnum.ROLE_ETUDIANT); }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.selectedCvFile = file;
  }

  onPostuler(): void {
    if (!this.offre()) return;
    this.submitting.set(true);
    this.errorMessage.set('');
    this.candidatureService.postuler(this.offre()!.id, this.lettreMotivation, this.selectedCvFile || undefined)
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.successMessage.set("Votre candidature a été soumise ! L'entreprise a été notifiée.");
          this.toastService.success(
            '🎉 Candidature envoyée !',
            "Votre candidature a bien été transmise à l'entreprise."
          );
        },
        error: (err) => {
          this.submitting.set(false);
          const msg = err.error?.message || "Erreur lors de l'envoi de votre candidature.";
          this.errorMessage.set(msg);
          this.toastService.error('Candidature échouée', msg);
        }
      });
  }
}
