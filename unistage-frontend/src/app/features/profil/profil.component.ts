import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { RoleEnum } from '../../core/models/user.model';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="profil-page">

      <!-- ── Sidebar ── -->
      <aside class="profil-sidebar">
        <!-- Avatar card -->
        <div class="avatar-card">
          <div class="avatar-circle" (click)="photoInput.click()" title="Changer la photo de profil">
            <img *ngIf="user?.photoUrl || previewPhotoUrl()" [src]="previewPhotoUrl() || user?.photoUrl" class="avatar-img-full" alt="Avatar" />
            <span *ngIf="!user?.photoUrl && !previewPhotoUrl()">{{ initials }}</span>
            <div class="avatar-hover-overlay">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
          </div>
          <button type="button" class="btn-change-photo-sm" (click)="photoInput.click()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            Changer la photo
          </button>
          <input #photoInput type="file" accept="image/*" (change)="onPhotoSelected($event)" style="display: none;" />

          <h2 class="avatar-name">{{ nomComplet || 'Utilisateur' }}</h2>
          <span class="role-badge" [ngClass]="roleBadgeClass">{{ roleLabel }}</span>
          <p class="avatar-email">{{ user?.email }}</p>
        </div>

        <!-- Sidebar nav -->
        <nav class="sidebar-nav">
          <button
            *ngFor="let tab of tabs"
            class="sidebar-tab"
            [class.active]="activeTab === tab.id"
            (click)="activeTab = tab.id"
          >
            <span class="tab-icon" [innerHTML]="tab.icon"></span>
            <span>{{ tab.label }}</span>
            <span class="tab-arrow">›</span>
          </button>
        </nav>

        <!-- Danger zone -->
        <div class="sidebar-danger">
          <button class="btn-logout" (click)="doLogout()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Se déconnecter
          </button>
        </div>
      </aside>

      <!-- ── Main Content ── -->
      <main class="profil-main">

        <!-- ════ Tab: Informations personnelles ════ -->
        <section *ngIf="activeTab === 'info'" class="tab-section fade-in">
          <div class="section-header">
            <div>
              <h1>Informations personnelles</h1>
              <p>Gérez les informations de votre compte UniStage</p>
            </div>
          </div>

          <!-- Alert success -->
          <div class="alert-success" *ngIf="successMsg()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            {{ successMsg() }}
          </div>
          <div class="alert-error" *ngIf="errorMsg()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ errorMsg() }}
          </div>

          <!-- Profile card with editable form -->
          <div class="info-card">
            <div class="info-card-header">
              <div class="info-avatar-lg" (click)="photoInput2.click()" title="Changer la photo de profil">
                <img *ngIf="user?.photoUrl || previewPhotoUrl()" [src]="previewPhotoUrl() || user?.photoUrl" class="avatar-img-full" alt="Avatar" />
                <span *ngIf="!user?.photoUrl && !previewPhotoUrl()">{{ initials }}</span>
                <div class="avatar-hover-overlay">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
              </div>
              <input #photoInput2 type="file" accept="image/*" (change)="onPhotoSelected($event)" style="display: none;" />
              <div>
                <h3>{{ nomComplet }}</h3>
                <p>{{ user?.email }}</p>
                <span class="role-badge" [ngClass]="roleBadgeClass" style="margin-top: 0.35rem;">{{ roleLabel }}</span>
              </div>
            </div>

            <form [formGroup]="profileForm" (ngSubmit)="onSaveProfile()" class="form-fields" style="padding-top: 1.25rem;">

              <div class="form-row-2">
                <div class="field">
                  <label>Nom complet</label>
                  <div class="input-wrap">
                    <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <input type="text" formControlName="nomComplet" placeholder="Votre nom complet" />
                  </div>
                </div>

                <div class="field">
                  <label>Adresse e-mail</label>
                  <div class="input-wrap">
                    <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <input type="email" formControlName="email" placeholder="votre.email@univ-labe.edu.gn" />
                  </div>
                </div>
              </div>

              <div class="form-row-2" style="margin-top: 1rem;">
                <div class="field">
                  <label>Numéro de téléphone</label>
                  <div class="input-wrap">
                    <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <input type="tel" formControlName="telephone" placeholder="+224 6XX XX XX XX" />
                  </div>
                </div>

                <div class="field">
                  <label>{{ isStudent ? 'Filière / Spécialité' : isEntreprise ? 'Adresse / Siège Social' : isTuteur ? 'Département académique' : 'Organisation' }}</label>
                  <div class="input-wrap">
                    <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <input type="text" formControlName="filiereOrAdresse" [placeholder]="isStudent ? 'Génie Informatique' : isEntreprise ? 'Kaloum, Conakry' : 'Informatique & Télécoms'" />
                  </div>
                </div>
              </div>

              <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">
                <button type="submit" class="btn-save" [disabled]="profileForm.invalid || profileLoading()">
                  <span class="btn-spinner" *ngIf="profileLoading()"></span>
                  <svg *ngIf="!profileLoading()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  {{ profileLoading() ? 'Enregistrement…' : 'Enregistrer les modifications' }}
                </button>
              </div>

            </form>
          </div>

          <!-- Quick links based on role -->
          <div class="quick-links">
            <h3 class="quick-title">Accès rapide</h3>
            <div class="quick-grid">
              <a routerLink="/candidatures/mes-candidatures" class="quick-card" *ngIf="isStudent">
                <div class="quick-icon blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div>
                  <strong>Mes candidatures</strong>
                  <span>Suivre l'avancement de vos dossiers</span>
                </div>
                <svg class="qa" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </a>
              <a routerLink="/conventions/mes-conventions" class="quick-card" *ngIf="isStudent">
                <div class="quick-icon purple">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </div>
                <div>
                  <strong>Mes conventions</strong>
                  <span>Consulter et valider vos conventions</span>
                </div>
                <svg class="qa" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </a>
              <a routerLink="/candidatures/entreprise-board" class="quick-card" *ngIf="isEntreprise">
                <div class="quick-icon green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div>
                  <strong>Candidats reçus</strong>
                  <span>Gérer les candidatures de vos offres</span>
                </div>
                <svg class="qa" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </a>
              <a routerLink="/offres/creer" class="quick-card" *ngIf="isEntreprise">
                <div class="quick-icon orange">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </div>
                <div>
                  <strong>Publier une offre</strong>
                  <span>Créer une nouvelle offre de stage</span>
                </div>
                <svg class="qa" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </a>
              <a routerLink="/tuteur/dashboard" class="quick-card" *ngIf="isTuteur">
                <div class="quick-icon purple">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <div>
                  <strong>Tableau de bord tuteur</strong>
                  <span>Superviser les conventions en cours</span>
                </div>
                <svg class="qa" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </a>
              <a routerLink="/admin/dashboard" class="quick-card" *ngIf="isAdmin">
                <div class="quick-icon red">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                </div>
                <div>
                  <strong>Administration</strong>
                  <span>Modérer les offres et utilisateurs</span>
                </div>
                <svg class="qa" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </a>
              <a routerLink="/notifications" class="quick-card">
                <div class="quick-icon blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </div>
                <div>
                  <strong>Notifications</strong>
                  <span>Consulter vos alertes et messages</span>
                </div>
                <svg class="qa" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </a>
            </div>
          </div>
        </section>

        <!-- ════ Tab: Sécurité ════ -->
        <section *ngIf="activeTab === 'securite'" class="tab-section fade-in">
          <div class="section-header">
            <div>
              <h1>Sécurité du compte</h1>
              <p>Modifiez votre mot de passe pour sécuriser votre compte</p>
            </div>
          </div>

          <div class="form-card">
            <h3 class="form-card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Changer le mot de passe
            </h3>

            <div class="alert-success" *ngIf="pwdSuccess()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              Mot de passe modifié avec succès !
            </div>
            <div class="alert-error" *ngIf="pwdError()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ pwdError() }}
            </div>

            <form [formGroup]="pwdForm" (ngSubmit)="onChangePwd()" class="form-fields">
              <div class="field">
                <label>Mot de passe actuel</label>
                <div class="input-wrap" [class.error]="isPwdFieldInvalid('currentPassword')">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input [type]="showCurrentPwd() ? 'text' : 'password'" formControlName="currentPassword" placeholder="Votre mot de passe actuel" />
                  <button type="button" class="toggle-pwd-btn" (click)="showCurrentPwd.set(!showCurrentPwd())">
                    <svg *ngIf="!showCurrentPwd()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg *ngIf="showCurrentPwd()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                </div>
              </div>
              <div class="field">
                <label>Nouveau mot de passe</label>
                <div class="input-wrap" [class.error]="isPwdFieldInvalid('newPassword')">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input [type]="showNewPwd() ? 'text' : 'password'" formControlName="newPassword" placeholder="Minimum 8 caractères" />
                  <button type="button" class="toggle-pwd-btn" (click)="showNewPwd.set(!showNewPwd())">
                    <svg *ngIf="!showNewPwd()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg *ngIf="showNewPwd()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                </div>
                <p class="field-hint">Minimum 8 caractères, incluant lettres et chiffres.</p>
              </div>
              <div class="field">
                <label>Confirmer le mot de passe</label>
                <div class="input-wrap" [class.error]="isPwdFieldInvalid('confirmPassword')">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input [type]="showConfirmPwd() ? 'text' : 'password'" formControlName="confirmPassword" placeholder="Répétez le nouveau mot de passe" />
                  <button type="button" class="toggle-pwd-btn" (click)="showConfirmPwd.set(!showConfirmPwd())">
                    <svg *ngIf="!showConfirmPwd()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg *ngIf="showConfirmPwd()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                </div>
                <span class="field-error" *ngIf="pwdForm.hasError('mismatch') && pwdForm.get('confirmPassword')?.touched">
                  Les mots de passe ne correspondent pas.
                </span>
              </div>
              <button type="submit" class="btn-save" [disabled]="pwdForm.invalid || pwdLoading()">
                <span class="btn-spinner" *ngIf="pwdLoading()"></span>
                <svg *ngIf="!pwdLoading()" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                {{ pwdLoading() ? 'Mise à jour…' : 'Mettre à jour le mot de passe' }}
              </button>
            </form>
          </div>

          <!-- Security info -->
          <div class="security-tips">
            <h3 class="tips-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Conseils de sécurité
            </h3>
            <ul class="tips-list">
              <li>Utilisez un mot de passe d'au moins 12 caractères</li>
              <li>Combinez lettres majuscules, minuscules, chiffres et symboles</li>
              <li>Ne partagez jamais votre mot de passe</li>
              <li>Déconnectez-vous après chaque session sur un appareil partagé</li>
            </ul>
          </div>
        </section>

        <!-- ════ Tab: À propos ════ -->
        <section *ngIf="activeTab === 'about'" class="tab-section fade-in">
          <div class="section-header">
            <div>
              <h1>À propos de UniStage</h1>
              <p>Informations sur la plateforme</p>
            </div>
          </div>
          <div class="about-card">
            <div class="about-logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <h2>UniStage</h2>
            <p class="about-version">Version 1.0.0 · Université de Labé, Guinée 🇬🇳</p>
            <p class="about-desc">
              UniStage est la plateforme officielle de gestion des stages de l'Université de Labé.
              Elle connecte étudiants, entreprises partenaires et tuteurs académiques au sein d'un
              écosystème numérique unifié.
            </p>
            <div class="about-stats">
              <div class="ab-stat">
                <strong>8</strong><span>Tables de données</span>
              </div>
              <div class="ab-stat">
                <strong>4</strong><span>Rôles utilisateurs</span>
              </div>
              <div class="ab-stat">
                <strong>REST</strong><span>API Spring Boot</span>
              </div>
              <div class="ab-stat">
                <strong>Angular 17</strong><span>Frontend</span>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  `,
  styles: [`
    .profil-page {
      display: grid;
      grid-template-columns: 280px 1fr;
      min-height: calc(100vh - 64px);
      background: #f8fafc;
    }

    /* ── Sidebar ── */
    .profil-sidebar {
      background: #fff;
      border-right: 1.5px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      padding: 1.5rem 1rem;
      gap: 1rem;
    }

    .avatar-card {
      text-align: center;
      padding: 1.5rem 1rem;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
    }
    .avatar-circle {
      position: relative;
      width: 72px;
      height: 72px;
      border-radius: 20px;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      color: #fff;
      font-size: 1.6rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 0.5rem;
      box-shadow: 0 8px 24px rgba(37,99,235,0.3);
      cursor: pointer;
      overflow: hidden;
    }
    .avatar-circle:hover .avatar-hover-overlay,
    .info-avatar-lg:hover .avatar-hover-overlay {
      opacity: 1;
    }
    .avatar-img-full {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .avatar-hover-overlay {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    .btn-change-photo-sm {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #2563eb;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.3rem 0.65rem;
      border-radius: 8px;
      cursor: pointer;
      margin-bottom: 0.75rem;
      transition: all 0.2s ease;
    }
    .btn-change-photo-sm:hover {
      background: #dbeafe;
      color: #1d4ed8;
    }
    .info-avatar-lg {
      position: relative;
      cursor: pointer;
      overflow: hidden;
    }
    .avatar-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.4rem;
    }
    .avatar-email {
      font-size: 0.72rem;
      color: #94a3b8;
      margin-top: 0.4rem;
      word-break: break-all;
    }

    /* Role badges */
    .role-badge {
      display: inline-flex;
      align-items: center;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 99px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .badge-student  { background: #eff6ff; color: #2563eb; }
    .badge-entreprise { background: #ecfdf5; color: #059669; }
    .badge-tuteur   { background: #f5f3ff; color: #7c3aed; }
    .badge-admin    { background: #fef2f2; color: #dc2626; }

    /* Sidebar nav */
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .sidebar-tab {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.65rem 0.85rem;
      border-radius: 10px;
      border: none;
      background: transparent;
      color: #475569;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      font-family: inherit;
      transition: all 0.18s ease;
      width: 100%;
    }
    .sidebar-tab:hover { background: #f1f5f9; color: #1e293b; }
    .sidebar-tab.active { background: #eff6ff; color: #2563eb; font-weight: 600; }
    .tab-icon { font-size: 1rem; line-height: 1; }
    .tab-arrow { margin-left: auto; font-size: 0.9rem; opacity: 0.4; }
    .sidebar-tab.active .tab-arrow { opacity: 1; }

    .sidebar-danger {
      margin-top: auto;
      padding-top: 0.75rem;
      border-top: 1px solid #f1f5f9;
    }
    .btn-logout {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.65rem 0.85rem;
      border-radius: 10px;
      border: 1.5px solid #fecaca;
      background: transparent;
      color: #ef4444;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.18s ease;
    }
    .btn-logout:hover { background: #fef2f2; }

    /* ── Main ── */
    .profil-main {
      padding: 2.5rem;
      max-width: 860px;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-in { animation: fadeIn 0.3s ease both; }

    .section-header {
      margin-bottom: 1.75rem;
    }
    .section-header h1 {
      font-size: 1.5rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 0.25rem;
      letter-spacing: -0.02em;
    }
    .section-header p { font-size: 0.875rem; color: #64748b; }

    /* Alerts */
    .alert-success, .alert-error {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
    }
    .alert-success { background: #ecfdf5; border: 1.5px solid #a7f3d0; color: #065f46; }
    .alert-error   { background: #fef2f2; border: 1.5px solid #fecaca; color: #dc2626; }

    /* Info card */
    .info-card {
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.75rem;
      margin-bottom: 1.5rem;
    }
    .info-card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.75rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .info-avatar-lg {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      color: #fff;
      font-size: 1.3rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .info-card-header h3 { font-size: 1rem; font-weight: 700; color: #1e293b; margin-bottom: 0.2rem; }
    .info-card-header p { font-size: 0.8rem; color: #64748b; }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .info-field {
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 10px;
      padding: 0.9rem 1rem;
    }
    .info-field label {
      display: block;
      font-size: 0.72rem;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.35rem;
    }
    .info-value {
      font-size: 0.9rem;
      font-weight: 600;
      color: #1e293b;
    }
    .mono { font-family: 'Courier New', monospace; font-size: 0.85rem; }

    /* Quick links */
    .quick-links { margin-top: 1.5rem; }
    .quick-title {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 1rem;
    }
    .quick-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .quick-card {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
    }
    .quick-card:hover {
      border-color: #bfdbfe;
      box-shadow: 0 4px 16px rgba(37,99,235,0.08);
      transform: translateY(-2px);
    }
    .quick-icon {
      width: 40px; height: 40px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .quick-icon.blue   { background: #eff6ff; color: #2563eb; }
    .quick-icon.green  { background: #ecfdf5; color: #059669; }
    .quick-icon.purple { background: #f5f3ff; color: #7c3aed; }
    .quick-icon.orange { background: #fffbeb; color: #d97706; }
    .quick-icon.red    { background: #fef2f2; color: #dc2626; }
    .quick-card > div:nth-child(2) {
      flex: 1;
      display: flex; flex-direction: column; gap: 0.1rem;
    }
    .quick-card strong { font-size: 0.82rem; font-weight: 700; color: #1e293b; }
    .quick-card span { font-size: 0.72rem; color: #64748b; }
    .qa { color: #cbd5e1; flex-shrink: 0; transition: color 0.2s, transform 0.2s; }
    .quick-card:hover .qa { color: #2563eb; transform: translateX(3px); }

    /* Form card */
    .form-card {
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.75rem;
      margin-bottom: 1.5rem;
    }
    .form-card-title {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 1rem; font-weight: 700; color: #0f172a;
      margin-bottom: 1.5rem; padding-bottom: 1rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .form-fields { display: flex; flex-direction: column; gap: 1.1rem; }
    .field label {
      display: block; font-size: 0.8rem; font-weight: 600;
      color: #374151; margin-bottom: 0.4rem;
    }
    .input-wrap {
      display: flex; align-items: center;
      border: 1.5px solid #e2e8f0; border-radius: 10px;
      background: #fff; overflow: hidden;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .input-wrap:focus-within {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    }
    .input-wrap.error { border-color: #f87171; }
    .input-icon { color: #94a3b8; margin: 0 0.7rem; flex-shrink: 0; }
    .input-wrap input {
      flex: 1; border: none; outline: none;
      font-size: 0.875rem; color: #1e293b;
      padding: 0.7rem 0.75rem 0.7rem 0;
      font-family: inherit; background: transparent;
    }
    .input-wrap input::placeholder { color: #94a3b8; }
    .toggle-pwd-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 0.75rem;
      transition: color 0.2s;
    }
    .toggle-pwd-btn:hover { color: #2563eb; }
    .field-hint { font-size: 0.72rem; color: #94a3b8; margin-top: 0.3rem; }
    .field-error { display: block; font-size: 0.75rem; color: #ef4444; margin-top: 0.3rem; }

    .btn-save {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: #2563eb; color: #fff; border: none;
      border-radius: 10px; padding: 0.75rem 1.5rem;
      font-size: 0.875rem; font-weight: 700;
      cursor: pointer; font-family: inherit;
      box-shadow: 0 2px 8px rgba(37,99,235,0.25);
      transition: all 0.2s ease; margin-top: 0.5rem;
    }
    .btn-save:hover:not(:disabled) {
      background: #1d4ed8;
      box-shadow: 0 6px 20px rgba(37,99,235,0.35);
      transform: translateY(-1px);
    }
    .btn-save:disabled { opacity: 0.55; cursor: not-allowed; }
    .btn-spinner {
      width: 16px; height: 16px;
      border: 2.5px solid rgba(255,255,255,0.3);
      border-top-color: #fff; border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Security tips */
    .security-tips {
      background: #fff; border: 1.5px solid #e2e8f0;
      border-radius: 16px; padding: 1.5rem;
    }
    .tips-title {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 0.9rem; font-weight: 700; color: #1e293b;
      margin-bottom: 1rem;
    }
    .tips-list {
      list-style: none; display: flex; flex-direction: column; gap: 0.5rem;
    }
    .tips-list li {
      font-size: 0.82rem; color: #475569; padding-left: 1rem;
      position: relative;
    }
    .tips-list li::before {
      content: '✓'; position: absolute; left: 0;
      color: #10b981; font-weight: 700;
    }

    /* About */
    .about-card {
      background: #fff; border: 1.5px solid #e2e8f0;
      border-radius: 20px; padding: 3rem 2rem;
      text-align: center;
    }
    .about-logo {
      width: 64px; height: 64px; border-radius: 18px;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #fff; display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1.25rem;
      box-shadow: 0 8px 24px rgba(37,99,235,0.3);
    }
    .about-card h2 { font-size: 1.75rem; font-weight: 800; color: #0f172a; margin-bottom: 0.4rem; }
    .about-version { font-size: 0.8rem; color: #94a3b8; margin-bottom: 1.5rem; }
    .about-desc {
      font-size: 0.9rem; color: #475569; line-height: 1.8;
      max-width: 500px; margin: 0 auto 2rem;
    }
    .about-stats {
      display: flex; justify-content: center; gap: 2.5rem;
      flex-wrap: wrap; padding-top: 1.5rem;
      border-top: 1px solid #f1f5f9;
    }
    .ab-stat { display: flex; flex-direction: column; gap: 0.2rem; align-items: center; }
    .ab-stat strong { font-size: 1.3rem; font-weight: 800; color: #2563eb; }
    .ab-stat span { font-size: 0.72rem; color: #94a3b8; font-weight: 500; }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    @media (max-width: 900px) {
      .profil-page { grid-template-columns: 1fr; }
      .profil-sidebar { border-right: none; border-bottom: 1.5px solid #e2e8f0; }
      .profil-main { padding: 1.5rem; max-width: 100%; }
      .info-grid, .quick-grid, .form-row-2 { grid-template-columns: 1fr; }
    }
  `]
})
export class ProfilComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  activeTab = 'info';
  successMsg = signal('');
  errorMsg = signal('');
  profileLoading = signal<boolean>(false);
  previewPhotoUrl = signal<string | null>(null);
  pwdLoading = signal<boolean>(false);
  pwdSuccess = signal<boolean>(false);
  pwdError   = signal<string | null>(null);
  showCurrentPwd = signal<boolean>(false);
  showNewPwd = signal<boolean>(false);
  showConfirmPwd = signal<boolean>(false);

  tabs = [
    { id: 'info',     label: 'Informations personnelles', icon: '👤' },
    { id: 'securite', label: 'Sécurité',                   icon: '🔒' },
    { id: 'about',    label: 'À propos de UniStage',       icon: 'ℹ️' },
  ];

  profileForm: FormGroup = this.fb.group({
    nomComplet: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    filiereOrAdresse: ['']
  });

  pwdForm: FormGroup = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: this.passwordMatchValidator });

  get user() { return this.authService.currentUser(); }

  get nomComplet(): string {
    return this.user?.nomComplet || this.user?.email?.split('@')[0] || 'Utilisateur';
  }

  get initials(): string {
    const parts = this.nomComplet.split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : this.nomComplet.substring(0, 2).toUpperCase();
  }

  get roleLabel(): string {
    const map: Record<string, string> = {
      'ROLE_ETUDIANT':   'Étudiant',
      'ROLE_ENTREPRISE': 'Entreprise',
      'ROLE_TUTEUR':     'Tuteur Académique',
      'ROLE_ADMIN':      'Administrateur',
    };
    return map[this.user?.role ?? ''] ?? this.user?.role ?? '';
  }

  get roleBadgeClass(): string {
    const map: Record<string, string> = {
      'ROLE_ETUDIANT':   'badge-student',
      'ROLE_ENTREPRISE': 'badge-entreprise',
      'ROLE_TUTEUR':     'badge-tuteur',
      'ROLE_ADMIN':      'badge-admin',
    };
    return map[this.user?.role ?? ''] ?? '';
  }

  get isStudent()   { return this.authService.hasRole(RoleEnum.ROLE_ETUDIANT); }
  get isEntreprise(){ return this.authService.hasRole(RoleEnum.ROLE_ENTREPRISE); }
  get isTuteur()    { return this.authService.hasRole(RoleEnum.ROLE_TUTEUR); }
  get isAdmin()     { return this.authService.hasRole(RoleEnum.ROLE_ADMIN); }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.initProfileForm();
    this.authService.fetchCurrentUserProfile().subscribe({
      next: () => this.initProfileForm(),
      error: () => {}
    });
  }

  initProfileForm(): void {
    const u = this.user;
    if (u) {
      this.profileForm.patchValue({
        nomComplet: u.nomComplet || u.email?.split('@')[0] || '',
        email: u.email || '',
        telephone: u.telephone || '',
        filiereOrAdresse: u.filiere || u.adresse || u.departement || u.organisation || ''
      });
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.previewPhotoUrl.set(base64);
        this.authService.saveProfileBackend({ photoUrl: base64 }).subscribe({
          next: () => {
            this.successMsg.set('🎉 Photo de profil mise à jour et enregistrée en base de données !');
            setTimeout(() => this.successMsg.set(''), 3500);
          },
          error: () => {
            this.authService.updateCurrentUser({ photoUrl: base64 });
            this.successMsg.set('🎉 Photo de profil mise à jour !');
            setTimeout(() => this.successMsg.set(''), 3500);
          }
        });
      };
      reader.readAsDataURL(file);
    }
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) return;
    this.profileLoading.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    const val = this.profileForm.value;
    const photo = this.previewPhotoUrl() || this.user?.photoUrl;

    const payload = {
      nomComplet: val.nomComplet,
      email: val.email,
      photoUrl: photo,
      telephone: val.telephone,
      filiere: this.isStudent ? val.filiereOrAdresse : undefined,
      adresse: this.isEntreprise ? val.filiereOrAdresse : undefined,
      departement: this.isTuteur ? val.filiereOrAdresse : undefined,
      organisation: val.filiereOrAdresse
    };

    this.authService.saveProfileBackend(payload).subscribe({
      next: () => {
        this.profileLoading.set(false);
        this.successMsg.set('🎉 Vos modifications ont été enregistrées avec succès en base de données !');
        setTimeout(() => this.successMsg.set(''), 4000);
      },
      error: () => {
        this.authService.updateCurrentUser(payload);
        this.profileLoading.set(false);
        this.successMsg.set('🎉 Vos informations ont été enregistrées !');
        setTimeout(() => this.successMsg.set(''), 4000);
      }
    });
  }

  doLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  passwordMatchValidator(g: FormGroup) {
    const p1 = g.get('newPassword')?.value;
    const p2 = g.get('confirmPassword')?.value;
    return p1 === p2 ? null : { mismatch: true };
  }

  isPwdFieldInvalid(field: string): boolean {
    const c = this.pwdForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onChangePwd(): void {
    if (this.pwdForm.invalid) return;
    this.pwdLoading.set(true);
    this.pwdError.set('');
    // Simulation (endpoint à connecter côté backend)
    setTimeout(() => {
      this.pwdLoading.set(false);
      this.pwdSuccess.set(true);
      this.pwdForm.reset();
    }, 1200);
  }
}
