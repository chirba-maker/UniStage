import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register-tuteur',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="badge-icon">🎓 Espace Enseignant</div>
          <h2>Inscription Tuteur Académique</h2>
          <p>Créez votre compte pour superviser les stages des étudiants de l'Université de Labé</p>
        </div>

        <div *ngIf="errorMessage()" class="alert-danger">
          ⚠️ {{ errorMessage() }}
        </div>

        <form [formGroup]="tuteurForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label for="prenom">Prénom</label>
              <input id="prenom" type="text" formControlName="prenom" placeholder="Mamadou" [class.invalid]="isFieldInvalid('prenom')" />
            </div>
            <div class="form-group">
              <label for="nom">Nom</label>
              <input id="nom" type="text" formControlName="nom" placeholder="Bah" [class.invalid]="isFieldInvalid('nom')" />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email Institutionnel</label>
            <input id="email" type="email" formControlName="email" placeholder="m.bah@univ-labe.edu.gn" [class.invalid]="isFieldInvalid('email')" />
          </div>

          <div class="form-group">
            <label for="departement">Département Académique</label>
            <select id="departement" formControlName="departement" [class.invalid]="isFieldInvalid('departement')">
              <option value="">Sélectionner un département...</option>
              <option value="Génie Informatique et Télécommunications">Génie Informatique et Télécommunications</option>
              <option value="Sciences Économiques et Gestion">Sciences Économiques et Gestion</option>
              <option value="Génie Civil et BTP">Génie Civil et BTP</option>
              <option value="Administration des Affaires">Administration des Affaires</option>
              <option value="Sciences Juridiques">Sciences Juridiques</option>
              <option value="Mathématiques et Physique">Mathématiques et Physique</option>
              <option value="Lettres et Sciences Humaines">Lettres et Sciences Humaines</option>
            </select>
          </div>

          <div class="form-group">
            <label for="matriculeEnseignant">Matricule Enseignant <span class="optional">(optionnel)</span></label>
            <input id="matriculeEnseignant" type="text" formControlName="matriculeEnseignant" placeholder="ENS-2024-001" />
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

          <button type="submit" class="btn-submit" [disabled]="tuteurForm.invalid || loading()">
            <span class="spinner" *ngIf="loading()"></span>
            <span *ngIf="!loading()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Créer mon compte Tuteur
            </span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Déjà un compte ? <a routerLink="/auth/login">Se connecter</a></p>
          <p>Vous êtes étudiant ? <a routerLink="/auth/register-student">Inscription étudiant</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
      padding: 2rem 1rem;
    }
    .auth-card {
      background: #fff;
      border-radius: 20px;
      padding: 2.5rem 2rem;
      width: 100%;
      max-width: 520px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.3);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .badge-icon {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      color: #fff;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 0.35rem 1rem;
      border-radius: 99px;
      margin-bottom: 1rem;
    }
    .auth-header h2 {
      font-size: 1.6rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }
    .auth-header p {
      font-size: 0.85rem;
      color: #64748b;
      line-height: 1.6;
    }
    .alert-danger {
      background: #fef2f2;
      border: 1.5px solid #fecaca;
      color: #dc2626;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.35rem;
    }
    .optional {
      color: #94a3b8;
      font-weight: 400;
    }
    .form-group input, .form-group select {
      width: 100%;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.7rem 0.9rem;
      font-size: 0.875rem;
      color: #1e293b;
      background: #f8fafc;
      font-family: inherit;
      outline: none;
      transition: all 0.2s;
      box-sizing: border-box;
    }
    .form-group input:focus, .form-group select:focus {
      border-color: #7c3aed;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
    }
    .form-group input.invalid, .form-group select.invalid {
      border-color: #ef4444;
      background: #fff5f5;
    }
    .pwd-input-wrap {
      position: relative;
    }
    .pwd-input-wrap input {
      padding-right: 2.8rem;
    }
    .toggle-pwd-btn {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
    }
    .toggle-pwd-btn:hover { color: #7c3aed; }
    .btn-submit {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      color: #fff;
      border: none;
      border-radius: 12px;
      padding: 0.85rem;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      margin-top: 0.5rem;
      box-shadow: 0 4px 15px rgba(124,58,237,0.35);
      transition: all 0.2s;
    }
    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(124,58,237,0.4);
    }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .spinner {
      width: 18px; height: 18px;
      border: 2.5px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      border-top: 1px solid #f1f5f9;
      padding-top: 1.25rem;
    }
    .auth-footer p {
      font-size: 0.82rem;
      color: #64748b;
      margin-bottom: 0.4rem;
    }
    .auth-footer a {
      color: #7c3aed;
      font-weight: 600;
      text-decoration: none;
    }
    .auth-footer a:hover { text-decoration: underline; }
    @media (max-width: 480px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class RegisterTuteurComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = signal<string>('');
  loading = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  tuteurForm: FormGroup = this.fb.group({
    prenom: ['', [Validators.required]],
    nom: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    departement: ['', [Validators.required]],
    matriculeEnseignant: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isFieldInvalid(name: string): boolean {
    const ctrl = this.tuteurForm.get(name);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.tuteurForm.invalid) {
      this.tuteurForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.registerTuteur(this.tuteurForm.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/tuteur/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Une erreur est survenue lors de l\'inscription.');
      }
    });
  }
}
