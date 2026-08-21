import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register-student',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="badge-icon">🎓 Espace Étudiant</div>
          <h2>Inscription Candidat</h2>
          <p>Créez votre compte pour postuler aux offres de stage de l'Université de Labé</p>
        </div>

        <div *ngIf="errorMessage()" class="alert-danger">
          ⚠️ {{ errorMessage() }}
        </div>

        <form [formGroup]="studentForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label for="prenom">Prénom</label>
              <input id="prenom" type="text" formControlName="prenom" placeholder="Mamadou" [class.invalid]="isFieldInvalid('prenom')" />
            </div>

            <div class="form-group">
              <label for="nom">Nom</label>
              <input id="nom" type="text" formControlName="nom" placeholder="Dia" [class.invalid]="isFieldInvalid('nom')" />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email Institutionnel ou Personnel</label>
            <input id="email" type="email" formControlName="email" placeholder="m.dia@univ-labe.edu.gn" [class.invalid]="isFieldInvalid('email')" />
          </div>

          <div class="form-group">
            <label for="matricule">Matricule Étudiant (Université de Labé)</label>
            <input id="matricule" type="text" formControlName="matricule" placeholder="UL-2026-1042" [class.invalid]="isFieldInvalid('matricule')" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="filiere">Filière</label>
              <select id="filiere" formControlName="filiere" [class.invalid]="isFieldInvalid('filiere')">
                <option value="">Sélectionner...</option>
                <option value="Génie Informatique">Génie Informatique</option>
                <option value="Télécommunications">Télécommunications</option>
                <option value="Administration des Affaires">Administration des Affaires</option>
                <option value="Génie Civil">Génie Civil</option>
                <option value="Sciences Économiques">Sciences Économiques</option>
              </select>
            </div>

            <div class="form-group">
              <label for="niveau">Niveau d'Étude</label>
              <select id="niveau" formControlName="niveau" [class.invalid]="isFieldInvalid('niveau')">
                <option value="">Sélectionner...</option>
                <option value="Licence 3">Licence 3 (L3)</option>
                <option value="Master 1">Master 1 (M1)</option>
                <option value="Master 2">Master 2 (M2)</option>
              </select>
            </div>
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

          <button type="submit" [disabled]="studentForm.invalid || isLoading()" class="btn-submit">
            <span *ngIf="!isLoading()">Créer mon Compte Étudiant ➔</span>
            <span *ngIf="isLoading()">Création en cours...</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Déjà un compte ? <a routerLink="/auth/login" class="link-blue">Se connecter</a></p>
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
      background: radial-gradient(circle at top right, #1e293b, #0f172a);
      padding: 2rem;
    }
    .auth-card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      padding: 2.5rem;
      width: 100%;
      max-width: 540px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .badge-icon {
      display: inline-block;
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
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
      border-color: #3b82f6;
    }
    .form-group input.invalid, .form-group select.invalid {
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
      color: #60a5fa;
    }
    .btn-submit {
      width: 100%;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #fff;
      border: none;
      border-radius: 0.5rem;
      padding: 0.85rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 1rem;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
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
    .link-blue { color: #60a5fa; text-decoration: none; font-weight: 600; }
  `]
})
export class RegisterStudentComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal<boolean>(false);

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  studentForm: FormGroup = this.fb.group({
    prenom: ['', Validators.required],
    nom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    matricule: ['', Validators.required],
    filiere: ['', Validators.required],
    niveau: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isFieldInvalid(field: string): boolean {
    const control = this.studentForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.studentForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.registerEtudiant(this.studentForm.value).subscribe({
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
