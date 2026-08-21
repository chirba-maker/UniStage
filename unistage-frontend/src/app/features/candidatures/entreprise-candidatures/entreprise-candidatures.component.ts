import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CandidatureService } from '../../../core/services/candidature.service';
import { OffreService } from '../../../core/services/offre.service';
import { ConventionService } from '../../../core/services/convention.service';
import { Candidature, StatutCandidatureEnum } from '../../../core/models/candidature.model';
import { OffreStage } from '../../../core/models/offre.model';

import { CountUpComponent } from '../../../shared/components/count-up/count-up.component';

interface StatutConfig {
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
}

@Component({
  selector: 'app-entreprise-candidatures',
  standalone: true,
  imports: [CommonModule, RouterLink, CountUpComponent],
  template: `
    <div class="page-container">

      <!-- Header Section -->
      <div class="page-header">
        <div class="header-inner">
          <div class="header-titles">
            <div class="badge-role">Espace Recruteur</div>
            <h1>Gestion des Recrutements</h1>
            <p>Pilotez vos offres de stage et traitez les candidatures reçues des étudiants.</p>
          </div>
          <div class="header-actions">
            <a routerLink="/offres/creer" class="btn-create">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nouvelle Offre
            </a>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="tabs-container">
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'candidatures'" 
            (click)="activeTab = 'candidatures'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Candidatures Reçues
            <span class="tab-count"><app-count-up [target]="candidatures().length"></app-count-up></span>
          </button>

          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'offres'" 
            (click)="activeTab = 'offres'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            Mes Offres Publiées
            <span class="tab-count"><app-count-up [target]="mesOffres().length"></app-count-up></span>
          </button>
        </div>
      </div>

      <!-- Main Body -->
      <div class="content-body">

        <!-- ════ Tab: Candidatures ════ -->
        <div *ngIf="activeTab === 'candidatures'">
          
          <!-- Loading -->
          <div *ngIf="loadingCand()" class="loading-box">
            <div class="spinner"></div>
            <p>Chargement des candidatures…</p>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loadingCand() && candidatures().length === 0" class="empty-card">
            <div class="empty-icon-wrap">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            </div>
            <h3>Aucune candidature reçue</h3>
            <p>Vous n'avez pas encore reçu de candidatures d'étudiants. Dès qu'un étudiant postule à vos offres, il apparaîtra ici.</p>
            <a routerLink="/offres/creer" class="btn-primary-alt">Publier une nouvelle offre</a>
          </div>

          <!-- Candidatures List -->
          <div class="candidatures-grid" *ngIf="!loadingCand() && candidatures().length > 0">
            <div class="cand-item" *ngFor="let cand of candidatures()">
              
              <!-- Left side: Candidate details -->
              <div class="cand-details">
                
                <div class="cand-top-info">
                  <span class="badge-statut" 
                    [style.color]="getConfig(cand.statut).color"
                    [style.background]="getConfig(cand.statut).bg"
                    [style.border-color]="getConfig(cand.statut).border">
                    <span class="dot" [style.background]="getConfig(cand.statut).color"></span>
                    {{ getConfig(cand.statut).label }}
                  </span>
                  <span class="offre-applied-badge">
                    Offre : <strong>{{ cand.offre.titre }}</strong>
                  </span>
                  <span class="date-applied">
                    Postulé le {{ cand.dateCandidature | date:'dd/MM/yyyy' }}
                  </span>
                </div>

                <div class="candidate-profile">
                  <div class="candidate-avatar">
                    {{ cand.etudiant.nom.charAt(0) }}{{ cand.etudiant.prenom.charAt(0) }}
                  </div>
                  <div>
                    <h3 class="candidate-name">{{ cand.etudiant.prenom }} {{ cand.etudiant.nom }}</h3>
                    <div class="candidate-meta">
                      <span>🎓 {{ cand.etudiant.filiere }} ({{ cand.etudiant.niveau }})</span>
                      <span class="sep">•</span>
                      <span>Matricule : <code>{{ cand.etudiant.matricule }}</code></span>
                    </div>
                  </div>
                </div>

                <!-- Motivation Letter -->
                <div *ngIf="cand.lettreMotivation" class="motivation-box">
                  <div class="motivation-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Lettre de motivation
                  </div>
                  <p class="motivation-text">« {{ cand.lettreMotivation }} »</p>
                </div>

                <!-- CV link -->
                <div class="cv-action">
                  <a *ngIf="cand.cvUrl" [href]="getCvUrl(cand.cvUrl)" class="btn-cv">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                    Consulter le CV du candidat (PDF)
                  </a>
                </div>

              </div>

              <!-- Right side: Actions -->
              <div class="cand-actions">
                <span class="actions-heading">Décision de recrutement</span>
                
                <div class="action-buttons">
                  <button 
                    class="btn-act btn-exam" 
                    *ngIf="cand.statut === statutCandEnum.SOUMISE" 
                    (click)="changeStatut(cand, statutCandEnum.EN_EXAMEN)"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    Passer en examen
                  </button>

                  <button 
                    class="btn-act btn-interview" 
                    *ngIf="cand.statut === statutCandEnum.EN_EXAMEN" 
                    (click)="changeStatut(cand, statutCandEnum.ENTRETIEN)"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Convoquer en entretien
                  </button>

                  <button 
                    class="btn-act btn-accept" 
                    *ngIf="cand.statut !== statutCandEnum.RETENUE" 
                    (click)="changeStatut(cand, statutCandEnum.RETENUE)"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Retenir & Générer Convention
                  </button>

                  <button 
                    class="btn-act btn-refuse" 
                    *ngIf="cand.statut !== statutCandEnum.REFUSEE && cand.statut !== statutCandEnum.RETENUE" 
                    (click)="changeStatut(cand, statutCandEnum.REFUSEE)"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    Refuser
                  </button>

                  <div *ngIf="cand.statut === statutCandEnum.RETENUE" class="retained-banner">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Candidature retenue. Convention créée.
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- ════ Tab: Offres ════ -->
        <div *ngIf="activeTab === 'offres'">
          
          <div *ngIf="mesOffres().length === 0" class="empty-card">
            <h3>Aucune offre publiée</h3>
            <p>Vous n'avez pas encore d'offres publiées sur la plateforme.</p>
            <a routerLink="/offres/creer" class="btn-primary-alt">Publier votre première offre</a>
          </div>

          <div class="offres-grid" *ngIf="mesOffres().length > 0">
            <div class="offre-admin-card" *ngFor="let offre of mesOffres()">
              <div class="offre-card-top">
                <span class="status-chip">{{ offre.statut }}</span>
                <span class="pub-date">Publié le {{ offre.datePublication | date:'dd/MM/yyyy' }}</span>
              </div>
              <h3 class="offre-card-title">{{ offre.titre }}</h3>
              <p class="offre-card-desc">{{ offre.description }}</p>
              <div class="offre-card-footer">
                <span class="f-tag">📍 {{ offre.lieu }}</span>
                <span class="f-tag">⏱️ {{ offre.dureeMois }} Mois</span>
                <span class="f-tag" *ngIf="offre.gratification">💰 {{ offre.gratification | number:'1.0-0' }} GNF</span>
                <a [routerLink]="['/offres', offre.slug]" class="btn-view-link">Voir la page →</a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: calc(100vh - 64px);
      background: #f8fafc;
    }

    /* ── Header ── */
    .page-header {
      background: #fff;
      border-bottom: 1.5px solid #e2e8f0;
      padding: 2.25rem 2rem 0;
    }
    .header-inner {
      max-width: 1200px;
      margin: 0 auto 1.75rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1.5rem;
    }
    .badge-role {
      display: inline-flex;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #059669;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 0.2rem 0.6rem;
      border-radius: 99px;
      margin-bottom: 0.5rem;
    }
    .header-titles h1 {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin-bottom: 0.35rem;
    }
    .header-titles p {
      font-size: 0.9rem;
      color: #64748b;
    }
    .btn-create {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #2563eb;
      color: #fff;
      text-decoration: none;
      padding: 0.65rem 1.3rem;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(37,99,235,0.25);
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .btn-create:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(37,99,235,0.35);
      color: #fff;
    }

    /* Tabs */
    .tabs-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      gap: 0.5rem;
    }
    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      padding: 0.85rem 1.25rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }
    .tab-btn:hover {
      color: #1e293b;
    }
    .tab-btn.active {
      color: #2563eb;
      border-bottom-color: #2563eb;
    }
    .tab-count {
      background: #f1f5f9;
      color: #475569;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 99px;
    }
    .tab-btn.active .tab-count {
      background: #eff6ff;
      color: #2563eb;
    }

    /* ── Content ── */
    .content-body {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2.25rem 2rem 5rem;
    }

    /* Loading / Empty */
    .loading-box {
      text-align: center;
      padding: 5rem 2rem;
      color: #94a3b8;
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

    .empty-card {
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      padding: 4rem 2rem;
      text-align: center;
    }
    .empty-icon-wrap {
      margin-bottom: 1.25rem;
    }
    .empty-card h3 {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }
    .empty-card p {
      font-size: 0.875rem;
      color: #64748b;
      max-width: 440px;
      margin: 0 auto 1.5rem;
      line-height: 1.6;
    }
    .btn-primary-alt {
      display: inline-flex;
      background: #2563eb;
      color: #fff;
      text-decoration: none;
      padding: 0.65rem 1.4rem;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    /* Candidatures Grid */
    .candidatures-grid {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .cand-item {
      display: grid;
      grid-template-columns: 1fr 280px;
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.75rem;
      gap: 2rem;
      transition: all 0.2s ease;
    }
    .cand-item:hover {
      border-color: #cbd5e1;
      box-shadow: 0 8px 24px rgba(0,0,0,0.05);
    }

    /* Top info */
    .cand-top-info {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.6rem;
      margin-bottom: 1.25rem;
    }
    .badge-statut {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 99px;
      border: 1.5px solid;
    }
    .dot {
      width: 6px; height: 6px; border-radius: 50%;
    }
    .offre-applied-badge {
      font-size: 0.78rem;
      color: #334155;
      background: #f1f5f9;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
    }
    .offre-applied-badge strong { color: #0f172a; }
    .date-applied {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-left: auto;
    }

    /* Candidate Profile */
    .candidate-profile {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    .candidate-avatar {
      width: 48px; height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      color: #fff;
      font-size: 1.1rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .candidate-name {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.2rem;
    }
    .candidate-meta {
      font-size: 0.82rem;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .candidate-meta code {
      background: #f1f5f9;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      font-family: monospace;
      color: #334155;
    }
    .sep { color: #cbd5e1; }

    /* Motivation */
    .motivation-box {
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 1.25rem;
    }
    .motivation-label {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.72rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.4rem;
    }
    .motivation-text {
      font-size: 0.85rem;
      color: #334155;
      line-height: 1.6;
      font-style: italic;
    }

    .btn-cv {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.82rem;
      font-weight: 600;
      color: #2563eb;
      background: #eff6ff;
      border: 1.5px solid #bfdbfe;
      padding: 0.45rem 0.9rem;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-cv:hover {
      background: #dbeafe;
      border-color: #93c5fd;
    }

    /* Actions column */
    .cand-actions {
      border-left: 1.5px solid #f1f5f9;
      padding-left: 1.75rem;
      display: flex;
      flex-direction: column;
    }
    .actions-heading {
      font-size: 0.75rem;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }
    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .btn-act {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      padding: 0.65rem 1rem;
      border-radius: 9px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      border: 1.5px solid;
      font-family: inherit;
      transition: all 0.2s;
    }
    .btn-exam {
      background: #f0f9ff;
      border-color: #bae6fd;
      color: #0284c7;
    }
    .btn-exam:hover { background: #e0f2fe; }
    .btn-interview {
      background: #fffbeb;
      border-color: #fde68a;
      color: #d97706;
    }
    .btn-interview:hover { background: #fef3c7; }
    .btn-accept {
      background: #059669;
      border-color: #059669;
      color: #fff;
      box-shadow: 0 2px 8px rgba(5,150,105,0.25);
    }
    .btn-accept:hover { background: #047857; }
    .btn-refuse {
      background: transparent;
      border-color: #fecaca;
      color: #ef4444;
    }
    .btn-refuse:hover { background: #fef2f2; }

    .retained-banner {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: #ecfdf5;
      border: 1.5px solid #a7f3d0;
      color: #065f46;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.65rem;
      border-radius: 9px;
      text-align: center;
      justify-content: center;
    }

    /* Offres Grid */
    .offres-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1.5rem;
    }
    .offre-admin-card {
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      transition: all 0.2s ease;
    }
    .offre-admin-card:hover {
      box-shadow: 0 8px 24px rgba(0,0,0,0.06);
      border-color: #cbd5e1;
    }
    .offre-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.85rem;
    }
    .status-chip {
      font-size: 0.72rem;
      font-weight: 700;
      color: #2563eb;
      background: #eff6ff;
      padding: 0.2rem 0.55rem;
      border-radius: 99px;
    }
    .pub-date {
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .offre-card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.6rem;
    }
    .offre-card-desc {
      font-size: 0.85rem;
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 1.25rem;
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .offre-card-footer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.4rem;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
    }
    .f-tag {
      font-size: 0.75rem;
      color: #475569;
      background: #f8fafc;
      padding: 0.25rem 0.55rem;
      border-radius: 6px;
      border: 1px solid #f1f5f9;
    }
    .btn-view-link {
      margin-left: auto;
      font-size: 0.8rem;
      font-weight: 700;
      color: #2563eb;
      text-decoration: none;
    }
    .btn-view-link:hover { text-decoration: underline; }

    @media (max-width: 900px) {
      .cand-item { grid-template-columns: 1fr; }
      .cand-actions { border-left: none; border-top: 1.5px solid #f1f5f9; padding-left: 0; padding-top: 1.25rem; }
    }
  `]
})
export class EntrepriseCandidaturesComponent implements OnInit {
  candidatures = signal<Candidature[]>([]);
  mesOffres = signal<OffreStage[]>([]);
  loadingCand = signal<boolean>(true);
  activeTab: 'candidatures' | 'offres' = 'candidatures';
  statutCandEnum = StatutCandidatureEnum;

  private readonly configs: Record<StatutCandidatureEnum, StatutConfig> = {
    [StatutCandidatureEnum.SOUMISE]: {
      label: 'Nouvelle candidature',
      icon: '📤',
      color: '#64748b',
      bg: '#f1f5f9',
      border: '#cbd5e1',
    },
    [StatutCandidatureEnum.EN_EXAMEN]: {
      label: 'En cours d\'examen',
      icon: '🔎',
      color: '#0284c7',
      bg: '#e0f2fe',
      border: '#7dd3fc',
    },
    [StatutCandidatureEnum.ENTRETIEN]: {
      label: 'Convoqué en entretien',
      icon: '🤝',
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fde68a',
    },
    [StatutCandidatureEnum.RETENUE]: {
      label: 'Retenu & Convention',
      icon: '🎉',
      color: '#059669',
      bg: '#ecfdf5',
      border: '#a7f3d0',
    },
    [StatutCandidatureEnum.REFUSEE]: {
      label: 'Refusé',
      icon: '✗',
      color: '#dc2626',
      bg: '#fef2f2',
      border: '#fecaca',
    },
  };

  constructor(
    private candidatureService: CandidatureService,
    private offreService: OffreService,
    private conventionService: ConventionService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadingCand.set(true);
    this.candidatureService.getCandidaturesEntreprise().subscribe({
      next: (data) => {
        this.candidatures.set(data);
        this.loadingCand.set(false);
      },
      error: () => this.loadingCand.set(false)
    });

    this.offreService.getMesOffres().subscribe({
      next: (data) => this.mesOffres.set(data)
    });
  }

  changeStatut(cand: Candidature, newStatut: StatutCandidatureEnum): void {
    this.candidatureService.updateStatut(cand.id, newStatut).subscribe({
      next: () => this.loadData()
    });
  }

  getCvUrl(relativePath?: string): string {
    return this.conventionService.getFileUrl(relativePath);
  }

  getConfig(statut: StatutCandidatureEnum): StatutConfig {
    return this.configs[statut] ?? this.configs[StatutCandidatureEnum.SOUMISE];
  }
}
