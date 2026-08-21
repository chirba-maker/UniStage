import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CandidatureService } from '../../../core/services/candidature.service';
import { Candidature, StatutCandidatureEnum } from '../../../core/models/candidature.model';

import { CountUpComponent } from '../../../shared/components/count-up/count-up.component';

interface StatutConfig {
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  step: number;
}

@Component({
  selector: 'app-mes-candidatures',
  standalone: true,
  imports: [CommonModule, RouterLink, CountUpComponent],
  template: `
    <div class="page">

      <!-- ── Page Header ── -->
      <div class="page-header">
        <div class="header-inner">
          <div class="header-text">
            <h1>Mes Candidatures</h1>
            <p>Suivez l'avancement de vos dossiers de candidature en temps réel</p>
          </div>
          <div class="header-badge" *ngIf="!loading() && candidatures().length > 0">
            <span class="count-num"><app-count-up [target]="candidatures().length"></app-count-up></span>
            <span class="count-label">candidature{{ candidatures().length > 1 ? 's' : '' }}</span>
          </div>
        </div>

        <!-- Summary chips -->
        <div class="stat-chips" *ngIf="!loading() && candidatures().length > 0">
          <div class="stat-chip" *ngFor="let s of statutSummary()">
            <span class="chip-dot" [style.background]="s.color"></span>
            <span class="chip-label">{{ s.label }}</span>
            <strong class="chip-count"><app-count-up [target]="s.count"></app-count-up></strong>
          </div>
        </div>
      </div>

      <!-- ── Content ── -->
      <div class="content">

        <!-- Loading -->
        <div class="loading-state" *ngIf="loading()">
          <div class="spinner"></div>
          <p>Chargement de vos candidatures…</p>
        </div>

        <!-- Empty -->
        <div class="empty-state" *ngIf="!loading() && candidatures().length === 0">
          <div class="empty-illustration">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h3>Aucune candidature</h3>
          <p>Vous n'avez encore postulé à aucune offre de stage. Découvrez les opportunités disponibles.</p>
          <a routerLink="/offres" class="btn-primary-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Explorer les offres de stage
          </a>
        </div>

        <!-- List -->
        <div class="cand-list" *ngIf="!loading() && candidatures().length > 0">
          <div
            class="cand-card"
            *ngFor="let cand of candidatures(); let i = index"
            [class.card-retenue]="cand.statut === 'RETENUE'"
            [class.card-refusee]="cand.statut === 'REFUSEE'"
            [style.animation-delay]="(i * 60) + 'ms'"
          >

            <!-- Accent bar -->
            <div class="card-accent" [style.background]="getConfig(cand.statut).color"></div>

            <div class="card-body">

              <!-- Left -->
              <div class="card-left">

                <!-- Company + offre -->
                <div class="offre-meta">
                  <div class="company-initial" [style.background]="'linear-gradient(135deg, ' + getConfig(cand.statut).color + '33, ' + getConfig(cand.statut).color + '22)'">
                    <span [style.color]="getConfig(cand.statut).color">
                      {{ cand.offre.nomEntreprise.charAt(0) }}
                    </span>
                  </div>
                  <div>
                    <h3 class="offre-title">{{ cand.offre.titre }}</h3>
                    <p class="company-name">{{ cand.offre.nomEntreprise }}</p>
                  </div>
                </div>

                <!-- Tags -->
                <div class="offre-tags">
                  <span class="tag">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {{ cand.offre.lieu }}
                  </span>
                  <span class="tag">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {{ cand.offre.dureeMois }} mois
                  </span>
                  <span class="tag tag-date">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Postulé le {{ cand.dateCandidature | date:'dd/MM/yyyy' }}
                  </span>
                </div>

              </div>

              <!-- Right -->
              <div class="card-right">

                <!-- Statut badge -->
                <div class="statut-section">
                  <span class="statut-badge"
                    [style.color]="getConfig(cand.statut).color"
                    [style.background]="getConfig(cand.statut).bg"
                    [style.border-color]="getConfig(cand.statut).border">
                    <span class="statut-dot" [style.background]="getConfig(cand.statut).color"></span>
                    {{ getConfig(cand.statut).icon }} {{ getConfig(cand.statut).label }}
                  </span>
                </div>

                <!-- Progress steps -->
                <div class="progress-steps">
                  <div
                    class="step"
                    *ngFor="let step of steps; let si = index"
                    [class.step-done]="getConfig(cand.statut).step > si"
                    [class.step-active]="getConfig(cand.statut).step === si + 1"
                    [title]="step"
                  >
                    <div class="step-circle">
                      <svg *ngIf="getConfig(cand.statut).step > si" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span class="step-label">{{ step }}</span>
                  </div>
                  <div class="step-line" [style.width]="getProgressWidth(cand.statut)"></div>
                </div>

                <!-- RETENUE action -->
                <div class="retenue-action" *ngIf="cand.statut === 'RETENUE'">
                  <div class="retenue-msg">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Félicitations ! Votre candidature a été retenue.
                  </div>
                  <a routerLink="/conventions/mes-conventions" class="btn-convention">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Consulter ma Convention
                  </a>
                </div>

                <!-- REFUSEE -->
                <div class="refusee-msg" *ngIf="cand.statut === 'REFUSEE'">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  Candidature non retenue.
                  <a routerLink="/offres" class="refusee-link">Voir d'autres offres →</a>
                </div>

                <!-- Waiting -->
                <div class="waiting-msg" *ngIf="cand.statut !== 'RETENUE' && cand.statut !== 'REFUSEE'">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  En attente de réponse
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* ── Page ── */
    .page {
      min-height: calc(100vh - 64px);
      background: #f8fafc;
    }

    /* ── Header ── */
    .page-header {
      background: #fff;
      border-bottom: 1.5px solid #e2e8f0;
      padding: 2rem 1.5rem 1.25rem;
    }
    .header-inner {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }
    .header-text h1 {
      font-size: 1.6rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 0.25rem;
      letter-spacing: -0.02em;
    }
    .header-text p { font-size: 0.875rem; color: #64748b; }
    .header-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #eff6ff;
      border: 1.5px solid #bfdbfe;
      border-radius: 14px;
      padding: 0.6rem 1.1rem;
      min-width: 70px;
      text-align: center;
    }
    .count-num { font-size: 1.6rem; font-weight: 800; color: #2563eb; line-height: 1; }
    .count-label { font-size: 0.7rem; font-weight: 600; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.04em; }

    /* Stat chips */
    .stat-chips {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .stat-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 99px;
      padding: 0.3rem 0.75rem;
    }
    .chip-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .chip-label { font-size: 0.75rem; font-weight: 500; color: #475569; }
    .chip-count { font-size: 0.75rem; font-weight: 800; color: #1e293b; }

    /* ── Content ── */
    .content {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2rem 1.5rem 5rem;
    }

    /* Loading */
    .loading-state {
      text-align: center;
      padding: 5rem 2rem;
      color: #94a3b8;
    }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid #e2e8f0;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 0.65s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Empty */
    .empty-state {
      text-align: center;
      padding: 5rem 2rem;
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 20px;
    }
    .empty-illustration {
      display: flex;
      justify-content: center;
      margin-bottom: 1.25rem;
    }
    .empty-state h3 { font-size: 1.2rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem; }
    .empty-state p { font-size: 0.875rem; color: #64748b; max-width: 400px; margin: 0 auto 1.75rem; line-height: 1.6; }
    .btn-primary-lg {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: #2563eb; color: #fff; text-decoration: none;
      padding: 0.75rem 1.5rem; border-radius: 12px;
      font-size: 0.875rem; font-weight: 700;
      box-shadow: 0 4px 14px rgba(37,99,235,0.3);
      transition: all 0.2s;
    }
    .btn-primary-lg:hover { background: #1d4ed8; transform: translateY(-1px); color: #fff; }

    /* ── Cards ── */
    .cand-list { display: flex; flex-direction: column; gap: 1rem; }

    .cand-card {
      display: flex;
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      overflow: hidden;
      opacity: 0;
      animation: fadeUp 0.35s ease forwards;
      transition: box-shadow 0.2s, border-color 0.2s;
    }
    .cand-card:hover {
      box-shadow: 0 8px 24px rgba(0,0,0,0.07);
      border-color: #cbd5e1;
    }
    .cand-card.card-retenue {
      border-color: #a7f3d0;
      background: linear-gradient(to right, #f0fdf4, #fff);
    }
    .cand-card.card-refusee {
      border-color: #fecaca;
      background: linear-gradient(to right, #fff5f5, #fff);
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Accent bar */
    .card-accent {
      width: 4px;
      flex-shrink: 0;
    }

    /* Card body */
    .card-body {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 1.5rem;
      gap: 2rem;
      flex: 1;
    }

    /* Left */
    .card-left { flex: 1; min-width: 0; }
    .offre-meta {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      margin-bottom: 0.9rem;
    }
    .company-initial {
      width: 44px; height: 44px;
      border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem; font-weight: 800; flex-shrink: 0;
    }
    .offre-title {
      font-size: 1rem; font-weight: 700; color: #0f172a;
      margin-bottom: 0.15rem; line-height: 1.3;
    }
    .company-name { font-size: 0.78rem; font-weight: 600; color: #64748b; }

    .offre-tags {
      display: flex; flex-wrap: wrap; gap: 0.4rem;
    }
    .tag {
      display: inline-flex; align-items: center; gap: 0.3rem;
      font-size: 0.73rem; font-weight: 500;
      background: #f1f5f9; color: #475569;
      padding: 0.25rem 0.6rem; border-radius: 6px;
    }
    .tag-date { color: #94a3b8; }

    /* Right */
    .card-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.9rem;
      min-width: 260px;
    }

    /* Statut badge */
    .statut-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 0.35rem 0.8rem;
      border-radius: 99px;
      border: 1.5px solid;
      letter-spacing: 0.01em;
    }
    .statut-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    /* Progress */
    .progress-steps {
      display: flex;
      align-items: flex-start;
      gap: 0;
      position: relative;
      width: 100%;
    }
    .step-line {
      position: absolute;
      top: 10px;
      left: 0;
      height: 2px;
      background: #2563eb;
      border-radius: 1px;
      transition: width 0.5s ease;
      z-index: 0;
    }
    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      gap: 0.4rem;
      position: relative;
      z-index: 1;
    }
    .step-circle {
      width: 20px; height: 20px;
      border-radius: 50%;
      background: #e2e8f0;
      border: 2px solid #e2e8f0;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.6rem; color: #fff;
      transition: all 0.3s;
    }
    .step-done .step-circle {
      background: #2563eb;
      border-color: #2563eb;
    }
    .step-active .step-circle {
      background: #fff;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.2);
    }
    .step-label {
      font-size: 0.62rem;
      font-weight: 600;
      color: #94a3b8;
      text-align: center;
      white-space: nowrap;
    }
    .step-done .step-label, .step-active .step-label { color: #2563eb; }

    /* RETENUE action */
    .retenue-action { width: 100%; }
    .retenue-msg {
      display: flex; align-items: center; gap: 0.4rem;
      font-size: 0.78rem; font-weight: 600;
      color: #059669; background: #ecfdf5;
      border: 1px solid #a7f3d0; border-radius: 8px;
      padding: 0.45rem 0.75rem; margin-bottom: 0.5rem;
    }
    .btn-convention {
      display: flex; align-items: center; justify-content: center; gap: 0.4rem;
      width: 100%; background: #059669; color: #fff; text-decoration: none;
      padding: 0.6rem 1rem; border-radius: 9px;
      font-size: 0.82rem; font-weight: 700;
      box-shadow: 0 2px 8px rgba(5,150,105,0.25);
      transition: all 0.2s;
    }
    .btn-convention:hover { background: #047857; color: #fff; transform: translateY(-1px); }

    /* REFUSEE */
    .refusee-msg {
      display: flex; align-items: center; gap: 0.4rem;
      font-size: 0.78rem; font-weight: 500; color: #dc2626;
    }
    .refusee-link {
      color: #2563eb; font-weight: 600; text-decoration: none;
      margin-left: 0.25rem;
    }

    /* Waiting */
    .waiting-msg {
      display: flex; align-items: center; gap: 0.35rem;
      font-size: 0.75rem; font-weight: 500; color: #94a3b8;
    }

    @media (max-width: 768px) {
      .card-body { flex-direction: column; gap: 1rem; }
      .card-right { align-items: flex-start; min-width: unset; width: 100%; }
      .progress-steps { justify-content: flex-start; }
    }
  `]
})
export class MesCandidaturesComponent implements OnInit {
  candidatures = signal<Candidature[]>([]);
  loading = signal<boolean>(true);

  readonly steps = ['Soumise', 'En examen', 'Entretien', 'Décision'];

  private readonly configs: Record<StatutCandidatureEnum, StatutConfig> = {
    [StatutCandidatureEnum.SOUMISE]: {
      label: 'Soumise',
      icon: '📤',
      color: '#64748b',
      bg: '#f1f5f9',
      border: '#cbd5e1',
      step: 1,
    },
    [StatutCandidatureEnum.EN_EXAMEN]: {
      label: 'En examen',
      icon: '🔎',
      color: '#0284c7',
      bg: '#e0f2fe',
      border: '#7dd3fc',
      step: 2,
    },
    [StatutCandidatureEnum.ENTRETIEN]: {
      label: 'Entretien',
      icon: '🤝',
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fde68a',
      step: 3,
    },
    [StatutCandidatureEnum.RETENUE]: {
      label: 'Retenue ✓',
      icon: '🎉',
      color: '#059669',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      step: 4,
    },
    [StatutCandidatureEnum.REFUSEE]: {
      label: 'Non retenue',
      icon: '✗',
      color: '#dc2626',
      bg: '#fef2f2',
      border: '#fecaca',
      step: 0,
    },
  };

  statutSummary = computed(() => {
    const counts: Record<string, number> = {};
    for (const c of this.candidatures()) {
      counts[c.statut] = (counts[c.statut] || 0) + 1;
    }
    return Object.entries(counts).map(([statut, count]) => ({
      label: this.configs[statut as StatutCandidatureEnum]?.label ?? statut,
      color: this.configs[statut as StatutCandidatureEnum]?.color ?? '#64748b',
      count,
    }));
  });

  constructor(private candidatureService: CandidatureService) {}

  ngOnInit(): void {
    this.candidatureService.getMesCandidatures().subscribe({
      next: (data) => { this.candidatures.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getConfig(statut: StatutCandidatureEnum): StatutConfig {
    return this.configs[statut] ?? this.configs[StatutCandidatureEnum.SOUMISE];
  }

  getProgressWidth(statut: StatutCandidatureEnum): string {
    const step = this.getConfig(statut).step;
    if (statut === StatutCandidatureEnum.REFUSEE) return '0%';
    const pct = ((step - 1) / 3) * 100;
    return `${Math.min(pct, 100)}%`;
  }
}
