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
    <div class="container py-5 text-center text-muted" *ngIf="!offre() && !pageError()">
      <div class="spinner-border text-primary mb-3" role="status"></div>
      <p class="fw-semibold">Chargement de l'offre…</p>
    </div>

    <!-- Error state -->
    <div class="container py-5 text-center" *ngIf="pageError()">
      <div class="display-1 mb-3">⚠️</div>
      <h3 class="fw-bold text-dark">Offre introuvable</h3>
      <p class="text-secondary mb-4">Cette offre n'existe pas ou a été supprimée.</p>
      <a routerLink="/offres" class="btn btn-outline-primary rounded-pill px-4 fw-semibold">← Retour aux offres</a>
    </div>

    @if (offre(); as o) {
      <div class="bg-light min-vh-100 pb-5">
      
      <!-- Premium Hero Header -->
      <div class="bg-white border-bottom pt-4 pb-5 mb-5 shadow-sm">
        <div class="container" style="max-width: 1140px;">
          <!-- Breadcrumb -->
          <nav aria-label="breadcrumb" class="mb-4">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item">
                <a routerLink="/offres" class="text-decoration-none text-secondary fw-semibold d-inline-flex align-items-center gap-1 hover-primary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                  Toutes les offres
                </a>
              </li>
              <li class="breadcrumb-item active fw-bold text-dark text-truncate" aria-current="page" style="max-width: 300px;">{{ o.titre }}</li>
            </ol>
          </nav>

          <div class="d-flex flex-column flex-md-row gap-4 align-items-md-center">
            <div class="company-logo-xl flex-shrink-0 rounded-4 bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-1 shadow-sm" style="width: 80px; height: 80px; background: linear-gradient(135deg, #2563eb, #3b82f6);">
              {{ (o.nomEntreprise || '🏢').charAt(0) }}
            </div>
            <div>
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  Entreprise vérifiée
                </span>
                <span class="text-secondary fw-bold">{{ o.nomEntreprise }}</span>
              </div>
              <h1 class="fw-extrabold text-dark mb-3 display-6" style="letter-spacing: -0.03em;">{{ o.titre }}</h1>
              <div class="d-flex flex-wrap gap-2">
                <span class="badge bg-white text-secondary border px-3 py-2 rounded-pill fw-semibold fs-6 shadow-sm">📍 {{ o.lieu }}</span>
                <span class="badge bg-white text-secondary border px-3 py-2 rounded-pill fw-semibold fs-6 shadow-sm">⏱️ {{ o.dureeMois }} mois</span>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-bold fs-6 shadow-sm" *ngIf="o.gratification && o.gratification > 0">
                  💰 {{ o.gratification | number:'1.0-0' }} GNF/mois
                </span>
                <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 rounded-pill fw-bold fs-6 shadow-sm" *ngIf="!o.gratification || o.gratification === 0">
                  🤝 Non rémunéré
                </span>
                <span class="badge bg-white text-secondary border px-3 py-2 rounded-pill fw-semibold fs-6 shadow-sm">📅 Publié le {{ o.datePublication | date:'dd MMM yyyy' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container" style="max-width: 1140px;">
        <div class="row g-4">
          <!-- Left Column -->
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm rounded-4 mb-4">
              <div class="card-body p-4 p-md-5">
                <h4 class="fw-bold text-dark mb-4 pb-3 border-bottom d-flex align-items-center gap-2">
                  <span class="fs-4 text-primary">📝</span> Description du poste
                </h4>
                <div class="text-secondary description-text">
                  {{ o.description }}
                </div>
              </div>
            </div>

            <div class="card border-0 shadow-sm rounded-4">
              <div class="card-body p-4 p-md-5">
                <h4 class="fw-bold text-dark mb-4 pb-3 border-bottom d-flex align-items-center gap-2">
                  <span class="fs-4 text-primary">🎯</span> Informations clés
                </h4>
                <div class="row g-3">
                  <!-- Lieu -->
                  <div class="col-sm-6">
                    <div class="d-flex align-items-center gap-3 p-3 bg-light rounded-4 border border-light transition-all hover-shadow-sm h-100">
                      <div class="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px;">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      </div>
                      <div>
                        <div class="text-muted small fw-bold text-uppercase mb-1" style="letter-spacing: 0.05em;">Lieu de stage</div>
                        <div class="fw-bolder text-dark">{{ o.lieu }}</div>
                      </div>
                    </div>
                  </div>
                  <!-- Durée -->
                  <div class="col-sm-6">
                    <div class="d-flex align-items-center gap-3 p-3 bg-light rounded-4 border border-light transition-all hover-shadow-sm h-100">
                      <div class="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px; background-color: #e0e7ff; color: #4f46e5;">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      </div>
                      <div>
                        <div class="text-muted small fw-bold text-uppercase mb-1" style="letter-spacing: 0.05em;">Durée du stage</div>
                        <div class="fw-bolder text-dark">{{ o.dureeMois }} mois</div>
                      </div>
                    </div>
                  </div>
                  <!-- Gratification -->
                  <div class="col-sm-6">
                    <div class="d-flex align-items-center gap-3 p-3 bg-light rounded-4 border border-light transition-all hover-shadow-sm h-100">
                      <div class="rounded-3 bg-success-subtle text-success d-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px;">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      </div>
                      <div>
                        <div class="text-muted small fw-bold text-uppercase mb-1" style="letter-spacing: 0.05em;">Gratification mensuelle</div>
                        <div class="fw-bolder text-dark">{{ o.gratification ? (o.gratification | number:'1.0-0') + ' GNF' : 'Non rémunéré' }}</div>
                      </div>
                    </div>
                  </div>
                  <!-- Publication -->
                  <div class="col-sm-6">
                    <div class="d-flex align-items-center gap-3 p-3 bg-light rounded-4 border border-light transition-all hover-shadow-sm h-100">
                      <div class="rounded-3 bg-warning-subtle text-warning-emphasis d-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px;">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      </div>
                      <div>
                        <div class="text-muted small fw-bold text-uppercase mb-1" style="letter-spacing: 0.05em;">Date de publication</div>
                        <div class="fw-bolder text-dark">{{ o.datePublication | date:'dd MMMM yyyy' }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Sidebar -->
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm rounded-4 sticky-top" style="top: 2rem; z-index: 10;">
              <div class="card-body p-4 p-md-5 text-center">
                
                <!-- Not logged in -->
                <div *ngIf="!isLoggedIn()">
                  <div class="display-3 mb-3 d-flex justify-content-center">
                    <div class="bg-light rounded-circle d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">🔐</div>
                  </div>
                  <h4 class="fw-bold text-dark mb-2">Connexion requise</h4>
                  <p class="text-secondary mb-4 small" style="line-height: 1.6;">Connectez-vous en tant qu'<strong>Étudiant</strong> pour postuler à cette offre.</p>
                  <a routerLink="/auth/login" class="btn btn-primary w-100 rounded-pill py-2.5 fw-bold mb-3 shadow-sm d-flex align-items-center justify-content-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                    Se connecter
                  </a>
                  <a routerLink="/auth/register-student" class="btn btn-outline-secondary w-100 rounded-pill py-2.5 fw-semibold border-2 bg-light">Créer un compte →</a>
                </div>

                <!-- Wrong role -->
                <div *ngIf="isLoggedIn() && !isStudent()">
                  <div class="display-3 mb-3 d-flex justify-content-center">
                    <div class="bg-warning-subtle rounded-circle d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">⚠️</div>
                  </div>
                  <h4 class="fw-bold text-dark mb-2">Accès réservé</h4>
                  <p class="text-secondary mb-0 small" style="line-height: 1.6;">Seuls les comptes <strong>Étudiant</strong> peuvent postuler à des offres de stage.</p>
                </div>

                <!-- Student form -->
                <div *ngIf="isLoggedIn() && isStudent()">
                  <!-- Success -->
                  <div *ngIf="successMessage()" class="py-2">
                    <div class="display-3 mb-3 d-flex justify-content-center">
                      <div class="bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">✅</div>
                    </div>
                    <h4 class="fw-bold text-success mb-2">Candidature envoyée !</h4>
                    <p class="text-secondary mb-4 small" style="line-height: 1.6;">{{ successMessage() }}</p>
                    <a routerLink="/candidatures/mes-candidatures" class="btn btn-success w-100 rounded-pill py-2.5 fw-bold shadow-sm">Voir mes candidatures</a>
                  </div>

                  <!-- Form -->
                  <div *ngIf="!successMessage()" class="text-start">
                    <div class="text-center mb-4">
                      <h4 class="fw-bold text-dark mb-1">Postuler à cette offre</h4>
                      <p class="text-secondary small">Complétez votre candidature ci-dessous</p>
                    </div>

                    <div class="alert alert-danger rounded-3 small py-2 px-3 mb-3 border-0 d-flex align-items-center gap-2" *ngIf="errorMessage()">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {{ errorMessage() }}
                    </div>

                    <form (ngSubmit)="onPostuler()">
                      <div class="mb-4">
                        <label class="form-label fw-bold text-dark small mb-2 d-flex justify-content-between">
                          <span>Lettre de motivation</span>
                          <span class="text-muted fw-normal">(optionnel)</span>
                        </label>
                        <textarea
                          [(ngModel)]="lettreMotivation"
                          name="lettreMotivation"
                          rows="4"
                          class="form-control form-control-lg bg-light border-0 rounded-4 fs-6 shadow-none"
                          placeholder="Présentez vos motivations pour ce poste…"
                          style="resize: vertical;"
                        ></textarea>
                      </div>

                      <div class="mb-4">
                        <label class="form-label fw-bold text-dark small mb-2 d-flex justify-content-between">
                          <span>CV (PDF)</span>
                          <span class="text-muted fw-normal">(optionnel)</span>
                        </label>
                        <div class="file-drop-zone p-4 bg-light border border-2 border-dashed rounded-4 text-center cursor-pointer transition-all" 
                             (click)="cvInput.click()"
                             [class.border-primary]="selectedCvFile"
                             [class.bg-primary-subtle]="selectedCvFile"
                             [style.border-style]="selectedCvFile ? 'solid' : 'dashed'">
                          
                          <div class="icon-circle mx-auto mb-2 bg-white shadow-sm d-flex align-items-center justify-content-center rounded-circle" style="width: 40px; height: 40px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                          </div>

                          <div *ngIf="!selectedCvFile" class="small text-secondary fw-medium">Cliquez pour sélectionner un fichier</div>
                          <div *ngIf="selectedCvFile" class="small fw-bold text-primary text-truncate px-2">{{ selectedCvFile.name }}</div>
                          <input #cvInput type="file" accept="application/pdf" (change)="onFileSelected($event)" style="display:none" />
                        </div>
                        <div class="form-text mt-2 small text-muted text-center"><i class="opacity-75">Si vide, le CV de votre profil sera utilisé.</i></div>
                      </div>

                      <button type="submit" class="btn btn-primary w-100 rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm transition-all btn-submit" [disabled]="submitting()">
                        <div class="spinner-border spinner-border-sm" *ngIf="submitting()"></div>
                        <svg *ngIf="!submitting()" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        <span>{{ submitting() ? 'Envoi en cours…' : 'Soumettre ma candidature' }}</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    }
  `,
  styles: [`
    .transition-all { transition: all 0.2s ease-in-out; }
    .hover-shadow-sm:hover {
      box-shadow: 0 0.25rem 0.75rem rgba(0,0,0,0.05) !important;
      border-color: #e2e8f0 !important;
      transform: translateY(-2px);
    }
    .hover-primary:hover { color: #2563eb !important; }
    .cursor-pointer { cursor: pointer; }
    
    .file-drop-zone { border-color: #cbd5e1 !important; }
    .file-drop-zone:hover { background-color: #f1f5f9 !important; border-color: #94a3b8 !important; }
    .bg-primary-subtle.file-drop-zone:hover { background-color: #dbeafe !important; border-color: #93c5fd !important; }
    
    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 0.5rem 1rem rgba(37,99,235,0.2) !important;
    }
    .btn-submit:active:not(:disabled) { transform: translateY(0); }

    .description-text {
      font-size: 1.05rem; 
      line-height: 1.8; 
      white-space: pre-line;
    }
    
    .form-control:focus {
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
      background-color: #fff !important;
      border: 1px solid #93c5fd !important;
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
