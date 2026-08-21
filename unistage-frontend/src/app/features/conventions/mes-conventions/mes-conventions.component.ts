import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConventionService } from '../../../core/services/convention.service';
import { ConventionStage, StatutConventionEnum } from '../../../core/models/convention.model';

import { CountUpComponent } from '../../../shared/components/count-up/count-up.component';

@Component({
  selector: 'app-mes-conventions',
  standalone: true,
  imports: [CommonModule, RouterLink, CountUpComponent],
  template: `
    <div class="conventions-page">

      <!-- Header -->
      <div class="page-header">
        <div class="header-inner">
          <div class="header-text">
            <div class="header-badge-tag">📜 Université de Labé — Stages</div>
            <h1>Mes Conventions de Stage</h1>
            <p>Consultez, suivez la validation et téléchargez vos conventions officielles signées</p>
          </div>
          <div class="header-stats-badge" *ngIf="!loading() && conventions().length > 0">
            <span class="badge-num"><app-count-up [target]="conventions().length"></app-count-up></span>
            <span class="badge-label">Convention{{ conventions().length > 1 ? 's' : '' }}</span>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-container">

        <!-- Loading State -->
        <div class="loading-state" *ngIf="loading()">
          <div class="spinner"></div>
          <p>Chargement de vos conventions…</p>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="!loading() && conventions().length === 0">
          <div class="empty-icon">📄</div>
          <h3>Aucune convention de stage active</h3>
          <p>Une convention est automatiquement générée dès qu'une entreprise retient l'une de vos candidatures.</p>
          <a routerLink="/candidatures/mes-candidatures" class="btn-action-primary">
            Voir mes candidatures en cours →
          </a>
        </div>

        <!-- Conventions List -->
        <div class="conventions-list" *ngIf="!loading() && conventions().length > 0">
          <div
            class="convention-card"
            *ngFor="let conv of conventions(); let i = index"
            [class.card-signed]="conv.statutValidation === 'SIGNEE_FINALE'"
          >
            <!-- Card Header -->
            <div class="card-top">
              <div class="top-left">
                <span class="conv-number-pill">Convention N° {{ conv.id }}</span>
                <span class="conv-date">Créée le {{ conv.dateCreation | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="top-right">
                <span class="status-chip" [ngClass]="getStatusClass(conv.statutValidation)">
                  <span class="status-dot"></span>
                  {{ getStatusLabel(conv.statutValidation) }}
                </span>
              </div>
            </div>

            <!-- Card Main Content -->
            <div class="card-main">
              <div class="info-group">
                <div class="company-avatar">
                  {{ (conv.candidature.offre.nomEntreprise || '🏢').charAt(0) }}
                </div>
                <div class="stage-info">
                  <h2 class="stage-title">{{ conv.candidature?.offre?.titre }}</h2>
                  <p class="company-name">🏢 {{ conv.candidature?.offre?.nomEntreprise }} • 📍 {{ conv.candidature?.offre?.lieu }}</p>
                </div>
              </div>

              <!-- Stepper Progress Bar -->
              <div class="stepper-box">
                <div class="step-item" [class.done]="isStepDone(conv.statutValidation, 1)">
                  <div class="step-circle">1</div>
                  <span class="step-txt">Initialisation</span>
                </div>
                <div class="step-connector" [class.done]="isStepDone(conv.statutValidation, 2)"></div>
                <div class="step-item" [class.done]="isStepDone(conv.statutValidation, 2)">
                  <div class="step-circle">2</div>
                  <span class="step-txt">Validation Entreprise</span>
                </div>
                <div class="step-connector" [class.done]="isStepDone(conv.statutValidation, 3)"></div>
                <div class="step-item" [class.done]="isStepDone(conv.statutValidation, 3)">
                  <div class="step-circle">3</div>
                  <span class="step-txt">Validation Tuteur</span>
                </div>
                <div class="step-connector" [class.done]="isStepDone(conv.statutValidation, 4)"></div>
                <div class="step-item" [class.done]="isStepDone(conv.statutValidation, 4)">
                  <div class="step-circle">✓</div>
                  <span class="step-txt">Signature Finale</span>
                </div>
              </div>

              <!-- Details Grid -->
              <div class="details-grid">
                <div class="detail-item">
                  <span class="label">📅 Période du stage</span>
                  <strong class="value">
                    {{ conv.dateDebut | date:'dd MMM yyyy' }} ➔ {{ conv.dateFin | date:'dd MMM yyyy' }}
                  </strong>
                </div>

                <div class="detail-item">
                  <span class="label">💰 Gratification mensuelle</span>
                  <strong class="value text-green">
                    {{ conv.gratification ? (conv.gratification | number:'1.0-0') + ' GNF' : 'Non rémunéré' }}
                  </strong>
                </div>

                <div class="detail-item">
                  <span class="label">👨‍🏫 Tuteur académique</span>
                  <strong class="value" *ngIf="conv.tuteur">
                    {{ conv.tuteur.nom }} {{ conv.tuteur.prenom }} ({{ conv.tuteur.departement }})
                  </strong>
                  <strong class="value text-muted" *ngIf="!conv.tuteur">
                    En attente d'affectation
                  </strong>
                </div>
              </div>

              <!-- Missions preview -->
              <div class="missions-box" *ngIf="conv.missions">
                <span class="missions-label">🎯 Missions confiées :</span>
                <p class="missions-text">{{ conv.missions }}</p>
              </div>
            </div>

            <!-- Card Actions Footer -->
            <div class="card-footer-actions">
              <a [routerLink]="['/conventions', conv.id]" class="btn-view-details">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Voir la Convention en détail
              </a>

              <a
                *ngIf="conv.statutValidation === 'SIGNEE_FINALE'"
                [href]="getPdfUrl(conv.pdfUrl)"
                target="_blank"
                class="btn-download-pdf"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Télécharger le PDF Officiel
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .conventions-page {
      min-height: calc(100vh - 64px);
      background: #f8fafc;
      padding-bottom: 5rem;
    }

    /* Header */
    .page-header {
      background: #fff;
      border-bottom: 1.5px solid #e2e8f0;
      padding: 2.25rem 1.5rem 1.75rem;
    }
    .header-inner {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }
    .header-badge-tag {
      display: inline-block;
      font-size: 0.78rem;
      font-weight: 700;
      color: #2563eb;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 0.25rem 0.65rem;
      border-radius: 99px;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .header-text h1 {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0 0 0.35rem 0;
    }
    .header-text p {
      font-size: 0.9rem;
      color: #64748b;
      margin: 0;
    }
    .header-stats-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #ecfdf5;
      border: 1.5px solid #a7f3d0;
      border-radius: 14px;
      padding: 0.6rem 1.2rem;
      text-align: center;
      min-width: 90px;
    }
    .badge-num {
      font-size: 1.7rem;
      font-weight: 800;
      color: #059669;
      line-height: 1;
    }
    .badge-label {
      font-size: 0.7rem;
      font-weight: 700;
      color: #10b981;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* Container */
    .content-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    /* Loading & Empty */
    .loading-state, .empty-state {
      text-align: center;
      padding: 5rem 2rem;
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 20px;
    }
    .spinner {
      width: 38px;
      height: 38px;
      border: 3px solid #e2e8f0;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 0.65s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-icon {
      font-size: 3.5rem;
      margin-bottom: 1rem;
    }
    .empty-state h3 {
      font-size: 1.25rem;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }
    .empty-state p {
      font-size: 0.9rem;
      color: #64748b;
      max-width: 440px;
      margin: 0 auto 1.5rem;
      line-height: 1.6;
    }
    .btn-action-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #2563eb;
      color: #fff;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.9rem;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(37,99,235,0.3);
      transition: all 0.2s;
    }
    .btn-action-primary:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
    }

    /* Conventions Cards */
    .conventions-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .convention-card {
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 18px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
      overflow: hidden;
      transition: all 0.2s ease;
    }
    .convention-card:hover {
      box-shadow: 0 10px 30px rgba(0,0,0,0.07);
      border-color: #cbd5e1;
    }
    .convention-card.card-signed {
      border-color: #a7f3d0;
      background: linear-gradient(180deg, #f0fdf4 0%, #fff 120px);
    }

    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.75rem;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    .top-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .conv-number-pill {
      font-size: 0.75rem;
      font-weight: 800;
      color: #1e293b;
      background: #fff;
      border: 1.5px solid #cbd5e1;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
    }
    .conv-date {
      font-size: 0.78rem;
      color: #64748b;
      font-weight: 500;
    }

    /* Status Chip */
    .status-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 0.35rem 0.85rem;
      border-radius: 99px;
      border: 1.5px solid;
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }
    .status-brouillon { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }
    .status-brouillon .status-dot { background: #64748b; }
    .status-soumise { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
    .status-soumise .status-dot { background: #2563eb; }
    .status-entreprise { background: #fffbeb; color: #d97706; border-color: #fde68a; }
    .status-entreprise .status-dot { background: #d97706; }
    .status-signee { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
    .status-signee .status-dot { background: #059669; }

    /* Card Main */
    .card-main {
      padding: 1.75rem;
    }
    .info-group {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .company-avatar {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #eff6ff, #dbeafe);
      border: 1.5px solid #bfdbfe;
      color: #2563eb;
      font-size: 1.3rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .stage-title {
      font-size: 1.2rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.2rem 0;
      line-height: 1.3;
    }
    .company-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: #64748b;
      margin: 0;
    }

    /* Stepper */
    .stepper-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 12px;
      padding: 1rem 1.5rem;
      margin-bottom: 1.5rem;
    }
    .step-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .step-circle {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #64748b;
      font-size: 0.75rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .step-txt {
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
    }
    .step-item.done .step-circle {
      background: #059669;
      color: #fff;
    }
    .step-item.done .step-txt {
      color: #059669;
    }
    .step-connector {
      flex: 1;
      height: 2px;
      background: #e2e8f0;
      margin: 0 0.75rem;
      border-radius: 2px;
    }
    .step-connector.done {
      background: #059669;
    }

    /* Details Grid */
    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    .detail-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.85rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .detail-item .label {
      font-size: 0.73rem;
      font-weight: 600;
      color: #64748b;
    }
    .detail-item .value {
      font-size: 0.88rem;
      color: #1e293b;
      font-weight: 700;
    }
    .text-green { color: #059669 !important; }
    .text-muted { color: #94a3b8 !important; }

    /* Missions */
    .missions-box {
      background: #fff;
      border: 1px dashed #cbd5e1;
      border-radius: 10px;
      padding: 0.9rem 1.1rem;
    }
    .missions-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      color: #334155;
      margin-bottom: 0.25rem;
    }
    .missions-text {
      font-size: 0.82rem;
      color: #475569;
      line-height: 1.6;
      margin: 0;
      white-space: pre-line;
    }

    /* Footer Actions */
    .card-footer-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.25rem 1.75rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
    .btn-view-details {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #fff;
      color: #2563eb;
      border: 1.5px solid #bfdbfe;
      padding: 0.65rem 1.2rem;
      border-radius: 9px;
      font-size: 0.85rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-view-details:hover {
      background: #eff6ff;
      border-color: #93c5fd;
    }
    .btn-download-pdf {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: #059669;
      color: #fff;
      border: none;
      padding: 0.65rem 1.3rem;
      border-radius: 9px;
      font-size: 0.85rem;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 2px 8px rgba(5,150,105,0.3);
      transition: all 0.2s;
    }
    .btn-download-pdf:hover {
      background: #047857;
      transform: translateY(-1px);
      color: #fff;
    }

    @media (max-width: 768px) {
      .stepper-box { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
      .step-connector { display: none; }
      .card-footer-actions { flex-direction: column; }
      .btn-view-details, .btn-download-pdf { width: 100%; justify-content: center; }
    }
  `]
})
export class MesConventionsComponent implements OnInit {
  conventions = signal<ConventionStage[]>([]);
  loading = signal<boolean>(true);

  constructor(private conventionService: ConventionService) {}

  ngOnInit(): void {
    this.conventionService.getMesConventions().subscribe({
      next: (data) => {
        this.conventions.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  isStepDone(statut: string, step: number): boolean {
    if (!statut) return false;
    if (step === 1) return true;
    if (step === 2) return statut === 'VALIDEE_ENTREPRISE' || statut === 'VALIDEE_TUTEUR' || statut === 'SIGNEE_FINALE';
    if (step === 3) return statut === 'VALIDEE_TUTEUR' || statut === 'SIGNEE_FINALE';
    if (step === 4) return statut === 'SIGNEE_FINALE';
    return false;
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'BROUILLON': return 'status-brouillon';
      case 'SOUMISE': return 'status-soumise';
      case 'VALIDEE_ENTREPRISE': return 'status-entreprise';
      case 'VALIDEE_TUTEUR':
      case 'SIGNEE_FINALE': return 'status-signee';
      default: return 'status-brouillon';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'BROUILLON': return 'Brouillon';
      case 'SOUMISE': return 'Soumise';
      case 'VALIDEE_ENTREPRISE': return 'Validée par Entreprise';
      case 'VALIDEE_TUTEUR': return 'Validée par Tuteur';
      case 'SIGNEE_FINALE': return '🎉 Signée & Téléchargeable';
      default: return statut;
    }
  }

  getPdfUrl(pdfUrl?: string): string {
    return this.conventionService.getFileUrl(pdfUrl);
  }
}
