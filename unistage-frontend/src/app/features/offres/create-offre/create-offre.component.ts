import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OffreService } from '../../../core/services/offre.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-create-offre',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-wrap">
      
      <!-- Top banner / breadcrumbs -->
      <div class="breadcrumb-header">
        <div class="header-container">
          <a routerLink="/candidatures/entreprise-board" class="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Retour au tableau de bord
          </a>
        </div>
      </div>

      <!-- Main Form Container -->
      <div class="main-container">
        <div class="form-sheet">
          
          <div class="sheet-header">
            <div class="icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            <div>
              <span class="sub-badge">Recrutement</span>
              <h1 class="sheet-title">Publier une Offre de Stage</h1>
              <p class="sheet-sub">Rédigez votre offre pour la rendre visible à tous les étudiants de l'Université de Labé.</p>
            </div>
          </div>

          <div *ngIf="errorMessage()" class="alert-box-danger">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ errorMessage() }}
          </div>

          <form [formGroup]="offreForm" (ngSubmit)="onSubmit()" class="form-content">
            
            <!-- Titre -->
            <div class="form-group">
              <label for="titre">
                Intitulé du poste / Titre de l'offre
                <span class="req">*</span>
              </label>
              <div class="input-wrapper" [class.has-error]="isInvalid('titre')">
                <input 
                  id="titre" 
                  type="text" 
                  formControlName="titre" 
                  placeholder="Ex : Développeur Web Full-Stack (Angular / Spring Boot)" 
                />
              </div>
              <span class="field-hint" *ngIf="!isInvalid('titre')">Un titre clair attire plus de candidats qualifiés.</span>
              <span class="field-error" *ngIf="isInvalid('titre')">Le titre doit comporter au moins 5 caractères.</span>
            </div>

            <!-- Grille 3 colonnes: Lieu, Durée, Gratification -->
            <div class="form-grid-3">
              
              <!-- Lieu -->
              <div class="form-group">
                <label for="lieu">
                  Lieu du stage
                  <span class="req">*</span>
                </label>
                <div class="input-wrapper" [class.has-error]="isInvalid('lieu')">
                  <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <input id="lieu" type="text" formControlName="lieu" placeholder="Ex : Labé, Conakry, Télétravail" />
                </div>
                <span class="field-error" *ngIf="isInvalid('lieu')">Le lieu est obligatoire.</span>
              </div>

              <!-- Durée -->
              <div class="form-group">
                <label for="dureeMois">
                  Durée (en Mois)
                  <span class="req">*</span>
                </label>
                <div class="input-wrapper" [class.has-error]="isInvalid('dureeMois')">
                  <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <input id="dureeMois" type="number" formControlName="dureeMois" min="1" max="12" />
                </div>
                <span class="field-error" *ngIf="isInvalid('dureeMois')">Entre 1 et 12 mois.</span>
              </div>

              <!-- Gratification -->
              <div class="form-group">
                <label for="gratification">
                  Indemnité / Gratification (GNF/mois)
                </label>
                <div class="input-wrapper">
                  <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  <input id="gratification" type="number" formControlName="gratification" placeholder="0 si non rémunéré" />
                </div>
                <span class="field-hint">Mettre 0 si le stage n'est pas rémunéré.</span>
              </div>

            </div>

            <!-- Description -->
            <div class="form-group">
              <label for="description">
                Description détaillée des missions & profil recherché
                <span class="req">*</span>
              </label>
              <div class="textarea-wrapper" [class.has-error]="isInvalid('description')">
                <textarea 
                  id="description" 
                  rows="7" 
                  formControlName="description" 
                  placeholder="Décrivez les objectifs pédagogiques du stage, les missions principales confiées au stagiaire, l'environnement technique ou organisationnel, ainsi que les compétences souhaitées..."
                ></textarea>
              </div>
              <span class="field-error" *ngIf="isInvalid('description')">La description doit comporter au moins 20 caractères.</span>
            </div>

            <!-- Actions footer -->
            <div class="form-actions">
              <a routerLink="/candidatures/entreprise-board" class="btn-cancel">Annuler</a>
              <button type="submit" class="btn-submit" [disabled]="offreForm.invalid || submitting()">
                <span *ngIf="submitting()" class="spinner-sm"></span>
                <svg *ngIf="!submitting()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                <ng-container *ngIf="submitting()">Publication en cours...</ng-container>
                <ng-container *ngIf="!submitting()">Publier l'offre de stage</ng-container>
              </button>
            </div>

          </form>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .page-wrap {
      min-height: calc(100vh - 64px);
      background: #f8fafc;
    }

    /* ── Breadcrumb Header ── */
    .breadcrumb-header {
      background: #fff;
      border-bottom: 1px solid #e2e8f0;
      padding: 0.85rem 2rem;
    }
    .header-container {
      max-width: 900px;
      margin: 0 auto;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #64748b;
      text-decoration: none;
      transition: color 0.2s;
    }
    .back-link:hover {
      color: #2563eb;
    }

    /* ── Form Sheet ── */
    .main-container {
      max-width: 900px;
      margin: 2.5rem auto 5rem;
      padding: 0 1.5rem;
    }
    .form-sheet {
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 20px;
      padding: 2.75rem 2.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    }

    /* Header */
    .sheet-header {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      margin-bottom: 2.25rem;
      padding-bottom: 1.75rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .icon-wrap {
      width: 52px; height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, #eff6ff, #dbeafe);
      border: 1.5px solid #bfdbfe;
      color: #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .sub-badge {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #2563eb;
      background: #eff6ff;
      padding: 0.15rem 0.55rem;
      border-radius: 99px;
      margin-bottom: 0.35rem;
      display: inline-block;
    }
    .sheet-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin-bottom: 0.25rem;
    }
    .sheet-sub {
      font-size: 0.88rem;
      color: #64748b;
    }

    /* Alert */
    .alert-box-danger {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: #fef2f2;
      border: 1.5px solid #fecaca;
      color: #dc2626;
      padding: 0.85rem 1.25rem;
      border-radius: 12px;
      font-size: 0.85rem;
      margin-bottom: 1.75rem;
    }

    /* Form */
    .form-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }
    .form-group label {
      font-size: 0.85rem;
      font-weight: 700;
      color: #334155;
    }
    .req { color: #ef4444; margin-left: 0.2rem; }

    .input-wrapper {
      display: flex;
      align-items: center;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      background: #fff;
      padding: 0 0.85rem;
      transition: all 0.2s;
    }
    .input-wrapper:focus-within {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
    }
    .input-wrapper.has-error {
      border-color: #f87171;
    }
    .field-icon {
      color: #94a3b8;
      margin-right: 0.5rem;
      flex-shrink: 0;
    }
    .input-wrapper input {
      width: 100%;
      border: none;
      outline: none;
      padding: 0.75rem 0;
      font-size: 0.9rem;
      font-family: inherit;
      color: #1e293b;
      background: transparent;
    }
    .input-wrapper input::placeholder { color: #94a3b8; }

    .form-grid-3 {
      display: grid;
      grid-template-columns: 2fr 1fr 1.5fr;
      gap: 1rem;
    }

    .textarea-wrapper {
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      background: #fff;
      padding: 0.75rem;
      transition: all 0.2s;
    }
    .textarea-wrapper:focus-within {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
    }
    .textarea-wrapper.has-error {
      border-color: #f87171;
    }
    .textarea-wrapper textarea {
      width: 100%;
      border: none;
      outline: none;
      resize: vertical;
      font-size: 0.9rem;
      font-family: inherit;
      color: #1e293b;
      line-height: 1.6;
    }
    .textarea-wrapper textarea::placeholder { color: #94a3b8; }

    .field-hint {
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .field-error {
      font-size: 0.75rem;
      color: #ef4444;
      font-weight: 500;
    }

    /* Actions */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 1rem;
      padding-top: 1.5rem;
      border-top: 1px solid #f1f5f9;
      margin-top: 0.5rem;
    }
    .btn-cancel {
      font-size: 0.875rem;
      font-weight: 600;
      color: #64748b;
      text-decoration: none;
      padding: 0.7rem 1.25rem;
      border-radius: 10px;
      border: 1.5px solid #e2e8f0;
      transition: all 0.2s;
    }
    .btn-cancel:hover {
      background: #f1f5f9;
      color: #1e293b;
    }
    .btn-submit {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 0.75rem 1.75rem;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      box-shadow: 0 4px 14px rgba(37,99,235,0.3);
      transition: all 0.2s;
    }
    .btn-submit:hover:not(:disabled) {
      background: #1d4ed8;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(37,99,235,0.4);
    }
    .btn-submit:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    .spinner-sm {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .form-grid-3 { grid-template-columns: 1fr; }
      .form-sheet { padding: 1.75rem 1.25rem; }
    }
  `]
})
export class CreateOffreComponent {
  private toastService = inject(ToastService);
  offreForm: FormGroup;
  submitting = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private offreService: OffreService,
    private router: Router
  ) {
    this.offreForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(5)]],
      lieu: ['', [Validators.required]],
      dureeMois: [3, [Validators.required, Validators.min(1), Validators.max(12)]],
      gratification: [0],
      description: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  isInvalid(field: string): boolean {
    const c = this.offreForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onSubmit(): void {
    if (this.offreForm.invalid) return;
    this.submitting.set(true);
    this.errorMessage.set('');

    this.offreService.createOffre(this.offreForm.value).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toastService.success('🎉 Offre publiée !', "Votre offre de stage est maintenant visible par les étudiants.");
        this.router.navigate(['/candidatures/entreprise-board']);
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err.error?.message || "Erreur lors de la création de l'offre.";
        this.errorMessage.set(msg);
        this.toastService.error('Erreur de publication', msg);
      }
    });
  }
}
