import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register-entreprise',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="badge-icon">🏢 Espace Recruteur</div>
          <h2>Inscription Entreprise Partenaire</h2>
          <p>Publiez vos offres de stage et recrutez les meilleurs talents de l'Université de Labé</p>
        </div>

        <div *ngIf="errorMessage()" class="alert-danger">
          ⚠️ {{ errorMessage() }}
        </div>

        <form [formGroup]="entrepriseForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="nomEntreprise">Nom de l'Entreprise / Organisation</label>
            <input id="nomEntreprise" type="text" formControlName="nomEntreprise" placeholder="Orange Guinée, Kamsar Petroleum..." [class.invalid]="isFieldInvalid('nomEntreprise')" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="secteurActivite">Secteur d'Activité</label>
              <select id="secteurActivite" formControlName="secteurActivite" [class.invalid]="isFieldInvalid('secteurActivite')">
                <option value="">Sélectionner...</option>
                <option value="Télécommunications & IT">Télécommunications & IT</option>
                <option value="Banque & Finance">Banque & Finance</option>
                <option value="Mines & Énergie">Mines & Énergie</option>
                <option value="BTP & Construction">BTP & Construction</option>
                <option value="Commerce & Distribution">Commerce & Distribution</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div class="form-group">
              <label for="rccmNif">N° RCCM / NIF (Optionnel)</label>
              <input id="rccmNif" type="text" formControlName="rccmNif" placeholder="GN-CKRY-2024-B-1234" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="email">Email RH / Professionnel</label>
              <input id="email" type="email" formControlName="email" placeholder="recrutement@entreprise.com" [class.invalid]="isFieldInvalid('email')" />
            </div>

            <div class="form-group">
              <label for="telephone">Téléphone Contact</label>
              <input id="telephone" type="tel" formControlName="telephone" placeholder="+224 620 00 00 00" [class.invalid]="isFieldInvalid('telephone')" />
            </div>
          </div>

          <div class="form-group">
            <label for="adresse">Adresse du Siège / Bureau</label>
            <input id="adresse" type="text" formControlName="adresse" placeholder="Quartier Almamya, Kaloum, Conakry / Labé" [class.invalid]="isFieldInvalid('adresse')" />
          </div>

          <div class="form-group">
            <label for="password">Mot de passe (min 6 caractères)</label>
            <div class="pwd-input-wrap">
              <input id="password" [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="••••••••" [class.invalid]="isFieldInvalid('password')" />
              <button type="button" class="toggle-pwd-btn" (click)="togglePasswordVisibility()" [attr.aria-label]="showPassword() ? 'Masquer' : 'Afficher'">
                <svg *ngIf="!showPassword()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg *ngIf="showPassword()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>

          <button type="submit" [disabled]="entrepriseForm.invalid || isLoading()" class="btn-submit">
            <span *ngIf="!isLoading()">Créer le Compte Recruteur ➔</span>
            <span *ngIf="isLoading()">Création en cours...</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Déjà inscrit ? <a routerLink="/auth/login" class="link-green">Se connecter</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 70px);
      display: flex;
      justify-content: center;
      align-items: center;
      background: radial-gradient(circle at top right, #064e3b, #0f172a);
      padding: 2rem;
    }
    .auth-card {
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      padding: 2.5rem;
      width: 100%;
      max-width: 560px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .badge-icon {
      display: inline-block;
      background: rgba(5, 150, 105, 0.2);
      color: #34d399;
      padding: 0.3rem 0.8rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }
    .auth-header h2 {
      color: #fff;
      font-size: 1.6rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }
    .auth-header p {
      color: #94a3b8;
      font-size: 0.85rem;
      margin: 0;
    }
    .alert-danger {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid #ef4444;
      color: #fca5a5;
      padding: 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.85rem;
      margin-bottom: 1.5rem;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-group {
      margin-bottom: 1.1rem;
    }
    .form-group label {
      display: block;
      color: #cbd5e1;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 0.4rem;
    }
    .form-group input, .form-group select {
      width: 100%;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid #334155;
      border-radius: 0.5rem;
      padding: 0.75rem 1rem;
      color: #fff;
      font-size: 0.9rem;
      box-sizing: border-box;
    }
    .form-group input:focus, .form-group select:focus {
      outline: none;
      border-color: #10b981;
    }
    .form-group input.invalid,    .form-group input.invalid {
      border-color: #ef4444;
    }
    .pwd-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .pwd-input-wrap input {
      padding-right: 2.5rem;
    }
    .toggle-pwd-btn {
      position: absolute;
      right: 0.75rem;
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: color 0.2s;
    }
    .toggle-pwd-btn:hover {
      color: #34d399;
    }
    .btn-submit {
      width: 100%;
      background: linear-gradient(135deg, #059669, #047857);
      color: #fff;
      border: none;
      border-radius: 0.5rem;
      padding: 0.85rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 1rem;
      box-shadow: 0 4px 14px rgba(5, 150, 105, 0.4);
    }
    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
    }
    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      color: #64748b;
      font-size: 0.85rem;
    }
    .link-green { color: #34d399; text-decoration: none; font-weight: 600; }
  `]
})
export class RegisterEntrepriseComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal<boolean>(false);

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  entrepriseForm: FormGroup = this.fb.group({
    nomEntreprise: ['', Validators.required],
    rccmNif: [''],
    secteurActivite: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', Validators.required],
    adresse: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isFieldInvalid(field: string): boolean {
    const control = this.entrepriseForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.entrepriseForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.registerEntreprise(this.entrepriseForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Échec de la création du compte. Vérifiez les informations.');
      }
    });
  }
}
