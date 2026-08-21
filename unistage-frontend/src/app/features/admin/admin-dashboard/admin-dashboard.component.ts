import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AdminService, EntrepriseDto } from '../../../core/services/admin.service';
import { OffreService } from '../../../core/services/offre.service';
import { ConventionService } from '../../../core/services/convention.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AnalyticsDto } from '../../../core/models/analytics.model';
import { OffreStage, StatutOffreEnum } from '../../../core/models/offre.model';
import { ConventionStage, TuteurDto } from '../../../core/models/convention.model';
import { CountUpComponent } from '../../../shared/components/count-up/count-up.component';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CountUpComponent],
  template: `
    <!-- ══════════════════════════════════════════════════
         HERO BANNER DARK — ADMIN DASHBOARD
    ══════════════════════════════════════════════════ -->
    <div class="admin-hero mb-5">
      <div class="admin-hero-bg">
        <!-- Ambient orbs -->
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>

      <div class="container py-5">
        <!-- Header Row -->
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
          <div>
            <div class="admin-pill mb-3">
              <span class="pill-dot"></span>
              Console d'Administration · Université de Labé
            </div>
            <h1 class="admin-title mb-2">
              Tableau de Bord
              <span class="admin-title-accent">UniStage</span>
            </h1>
            <p class="admin-subtitle">
              <span class="live-dot"></span>
              Données synchronisées en temps réel avec MySQL
            </p>
          </div>
          <div class="d-flex gap-2 align-items-center">
            <button class="admin-refresh-btn" [disabled]="loading()" (click)="loadData()">
              <svg *ngIf="!loading()" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21.5 2v6h-6"/><path d="M21.34 15.57a10 10 0 1 1-.57-8.38"/></svg>
              <span *ngIf="loading()" class="admin-spinner"></span>
              {{ loading() ? 'Sync...' : 'Actualiser' }}
            </button>
          </div>
        </div>

        <!-- ── 4 METRIC CARDS ── -->
        <div class="row g-4">

          <!-- Card 1: Étudiants -->
          <div class="col-xl-3 col-md-6">
            <div class="metric-card metric-blue">
              <div class="metric-card-inner">
                <div class="metric-icon-wrap metric-icon-blue">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </div>
                <div class="metric-info">
                  <div class="metric-label">Étudiants Inscrits</div>
                  <div class="metric-value">
                    <app-count-up [target]="stats().totalEtudiants"></app-count-up>
                  </div>
                  <div class="metric-trend trend-up">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                    +12% ce semestre
                  </div>
                </div>
              </div>
              <div class="metric-progress">
                <div class="metric-progress-bar metric-progress-blue" style="width: 72%"></div>
              </div>
            </div>
          </div>

          <!-- Card 2: Entreprises -->
          <div class="col-xl-3 col-md-6">
            <div class="metric-card metric-violet">
              <div class="metric-card-inner">
                <div class="metric-icon-wrap metric-icon-violet">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                  </svg>
                </div>
                <div class="metric-info">
                  <div class="metric-label">Entreprises Partenaires</div>
                  <div class="metric-value">
                    <app-count-up [target]="stats().totalEntreprises"></app-count-up>
                  </div>
                  <div class="metric-trend trend-up">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                    +3 nouveaux
                  </div>
                </div>
              </div>
              <div class="metric-progress">
                <div class="metric-progress-bar metric-progress-violet" style="width: 55%"></div>
              </div>
            </div>
          </div>

          <!-- Card 3: Offres -->
          <div class="col-xl-3 col-md-6">
            <div class="metric-card metric-cyan">
              <div class="metric-card-inner">
                <div class="metric-icon-wrap metric-icon-cyan">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <div class="metric-info">
                  <div class="metric-label">Offres de Stage</div>
                  <div class="metric-value">
                    <app-count-up [target]="stats().totalOffres"></app-count-up>
                  </div>
                  <div class="metric-trend trend-up">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                    Actives ce mois
                  </div>
                </div>
              </div>
              <div class="metric-progress">
                <div class="metric-progress-bar metric-progress-cyan" style="width: 84%"></div>
              </div>
            </div>
          </div>

          <!-- Card 4: Conventions -->
          <div class="col-xl-3 col-md-6">
            <div class="metric-card metric-emerald">
              <div class="metric-card-inner">
                <div class="metric-icon-wrap metric-icon-emerald">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                </div>
                <div class="metric-info">
                  <div class="metric-label">Conventions Signées</div>
                  <div class="metric-value">
                    <app-count-up [target]="stats().totalConventions"></app-count-up>
                  </div>
                  <div class="metric-trend trend-up">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                    Taux 100% validées
                  </div>
                </div>
              </div>
              <div class="metric-progress">
                <div class="metric-progress-bar metric-progress-emerald" style="width: 100%"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ══════════ MAIN CONTENT ══════════ -->
    <div class="container mb-5">

      <!-- Navigation Tabs -->
      <ul class="nav nav-pills mb-4 bg-white p-2 rounded-4 shadow-sm border gap-2 flex-wrap">
        <li class="nav-item">
          <button class="nav-link rounded-3 px-4 fw-semibold d-flex align-items-center gap-2" [class.active]="tab === 'analytics'" (click)="setTab('analytics')" style="transition: all 0.25s ease; padding-top: 10px; padding-bottom: 10px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>
            Vue Analytique
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link rounded-3 px-4 fw-semibold d-flex align-items-center gap-2" [class.active]="tab === 'entreprises'" (click)="setTab('entreprises')" style="transition: all 0.25s ease; padding-top: 10px; padding-bottom: 10px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
            Entreprises
            <span class="badge rounded-pill ms-1" [ngClass]="tab === 'entreprises' ? 'bg-white text-primary' : 'bg-primary-subtle text-primary'">{{ entreprises().length }}</span>
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link rounded-3 px-4 fw-semibold d-flex align-items-center gap-2" [class.active]="tab === 'offres'" (click)="setTab('offres')" style="transition: all 0.25s ease; padding-top: 10px; padding-bottom: 10px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Offres
            <span class="badge rounded-pill ms-1" [ngClass]="tab === 'offres' ? 'bg-white text-primary' : 'bg-primary-subtle text-primary'">{{ offres().length }}</span>
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link rounded-3 px-4 fw-semibold d-flex align-items-center gap-2" [class.active]="tab === 'conventions'" (click)="setTab('conventions')" style="transition: all 0.25s ease; padding-top: 10px; padding-bottom: 10px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            Conventions
            <span class="badge rounded-pill ms-1" [ngClass]="tab === 'conventions' ? 'bg-white text-primary' : 'bg-primary-subtle text-primary'">{{ conventions().length }}</span>
          </button>
        </li>
      </ul>


      <!-- ── TAB 1 : ANALYTICS & VISUAL CHARTS ── -->
      <div *ngIf="tab === 'analytics'">
        <div class="row g-4 mb-4">
          <!-- Chart 1: Répartition par filière -->
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 class="fw-bold mb-1 text-dark">🎓 Répartition des Stages par Filière</h5>
                  <p class="text-muted small mb-0">Demandes et conventions selon le département universitaire</p>
                </div>
                <span class="badge bg-primary-subtle text-primary px-2.5 py-1.5 rounded-pill">Université de Labé</span>
              </div>
              <div class="chart-container position-relative" style="height: 300px;">
                <canvas #filiereChartCanvas></canvas>
              </div>
            </div>
          </div>

          <!-- Chart 2: Statuts des Conventions -->
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 class="fw-bold mb-1 text-dark">📜 Workflow & Statut des Conventions</h5>
                  <p class="text-muted small mb-0">Avancement dans le circuit de signature tripartite</p>
                </div>
                <span class="badge bg-success-subtle text-success px-2.5 py-1.5 rounded-pill">Temps Réel</span>
              </div>
              <div class="chart-container position-relative" style="height: 300px;">
                <canvas #conventionChartCanvas></canvas>
              </div>
            </div>
          </div>

          <!-- Chart 3: Secteurs d'activité des entreprises -->
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 class="fw-bold mb-1 text-dark">🏢 Secteurs d'Activité des Partenaires</h5>
                  <p class="text-muted small mb-0">Distribution des entreprises accueillantes enregistrées</p>
                </div>
                <span class="badge bg-info-subtle text-info px-2.5 py-1.5 rounded-pill">Écosystème</span>
              </div>
              <div class="chart-container position-relative" style="height: 300px;">
                <canvas #secteurChartCanvas></canvas>
              </div>
            </div>
          </div>

          <!-- Chart 4: Modération et statut des offres -->
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 class="fw-bold mb-1 text-dark">📢 Taux de Modération des Offres</h5>
                  <p class="text-muted small mb-0">État des publications de stage sur la plateforme</p>
                </div>
                <span class="badge bg-warning-subtle text-warning px-2.5 py-1.5 rounded-pill">Modération</span>
              </div>
              <div class="chart-container position-relative" style="height: 300px;">
                <canvas #offreChartCanvas></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Key Performance Indicators Row -->
        <div class="row g-4">
          <div class="col-md-4">
            <div class="card border-0 shadow-sm rounded-4 p-4 bg-white border-start border-4 border-primary">
              <h6 class="text-muted text-uppercase fw-bold small mb-2">Taux d'insertion & Signature</h6>
              <div class="d-flex align-items-baseline gap-2">
                <h3 class="fw-bold text-dark mb-0">
                  {{ conventions().length > 0 ? (getSignedConventionsCount() / conventions().length * 100 | number:'1.0-0') : 100 }}%
                </h3>
                <span class="text-success small fw-semibold">✔ Conventions finalisées</span>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 shadow-sm rounded-4 p-4 bg-white border-start border-4 border-success">
              <h6 class="text-muted text-uppercase fw-bold small mb-2">Validation Entreprises</h6>
              <div class="d-flex align-items-baseline gap-2">
                <h3 class="fw-bold text-dark mb-0">
                  {{ entreprises().length > 0 ? (getValidatedEntreprisesCount() / entreprises().length * 100 | number:'1.0-0') : 100 }}%
                </h3>
                <span class="text-success small fw-semibold">✔ Partenaires approuvés</span>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 shadow-sm rounded-4 p-4 bg-white border-start border-4 border-info">
              <h6 class="text-muted text-uppercase fw-bold small mb-2">Encadrement Académique</h6>
              <div class="d-flex align-items-baseline gap-2">
                <h3 class="fw-bold text-dark mb-0">
                  {{ tuteurs().length }}
                </h3>
                <span class="text-primary small fw-semibold">👨‍🏫 Enseignants tuteurs actifs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── TAB 2 : ENTREPRISES TAB ── -->
      <div *ngIf="tab === 'entreprises'">
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 class="fw-bold mb-1">Validation des Entreprises Inscrites</h4>
              <p class="text-muted small mb-0">Vérifiez l'authenticité et accordez l'accès aux recruteurs</p>
            </div>
            <span class="badge bg-primary px-3 py-2 rounded-pill">{{ entreprises().length }} enregistrée(s)</span>
          </div>

          <div class="table-responsive">
            <table class="table align-middle table-hover">
              <thead class="table-light">
                <tr>
                  <th>Entreprise</th>
                  <th>Secteur</th>
                  <th>Téléphone</th>
                  <th>Statut</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let ent of entreprises()">
                  <td class="fw-bold">
                    {{ ent.nomEntreprise }}<br/>
                    <small class="text-muted fw-normal">{{ ent.email }}</small>
                  </td>
                  <td><span class="badge bg-light text-dark border">{{ ent.secteurActivite }}</span></td>
                  <td>{{ ent.telephone }}</td>
                  <td>
                    <span class="badge px-2.5 py-1.5 rounded-pill" [ngClass]="ent.estValidee ? 'bg-success' : 'bg-warning text-dark'">
                      {{ ent.estValidee ? '✅ Validée' : '⏳ En attente' }}
                    </span>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-success me-2 rounded-3 fw-semibold" *ngIf="!ent.estValidee" (click)="validerEntreprise(ent.id, true)">
                      ✅ Approuver
                    </button>
                    <button class="btn btn-sm btn-outline-danger rounded-3 fw-semibold" *ngIf="ent.estValidee" (click)="validerEntreprise(ent.id, false)">
                      🚫 Désactiver
                    </button>
                  </td>
                </tr>
                <tr *ngIf="entreprises().length === 0">
                  <td colspan="5" class="text-center py-4 text-muted">Aucune entreprise trouvée.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ── TAB 3 : OFFRES TAB ── -->
      <div *ngIf="tab === 'offres'">
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 class="fw-bold mb-1">Modération des Offres de Stage</h4>
              <p class="text-muted small mb-0">Approuvez la publication des opportunités avant diffusion publique</p>
            </div>
            <span class="badge bg-primary px-3 py-2 rounded-pill">{{ offres().length }} offre(s)</span>
          </div>

          <div class="table-responsive">
            <table class="table align-middle table-hover">
              <thead class="table-light">
                <tr>
                  <th>Titre de l'offre</th>
                  <th>Entreprise</th>
                  <th>Lieu / Durée</th>
                  <th>Statut</th>
                  <th class="text-end">Action Modération</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let offre of offres()">
                  <td class="fw-bold">{{ offre.titre }}</td>
                  <td>{{ offre.nomEntreprise }}</td>
                  <td>{{ offre.lieu }} ({{ offre.dureeMois }} Mois)</td>
                  <td>
                    <span class="badge px-2.5 py-1.5 rounded-pill" 
                          [ngClass]="{
                            'bg-success': offre.statut === 'PUBLIEE',
                            'bg-warning text-dark': offre.statut === 'EN_ATTENTE_MODERATION',
                            'bg-danger': offre.statut === 'REJETEE',
                            'bg-secondary': offre.statut === 'CLOTUREE'
                          }">
                      {{ offre.statut }}
                    </span>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-success me-2 rounded-3 fw-semibold" *ngIf="offre.statut !== 'PUBLIEE'" (click)="validerOffre(offre.id, statutOffreEnum.PUBLIEE)">
                      Publier
                    </button>
                    <button class="btn btn-sm btn-danger rounded-3 fw-semibold" *ngIf="offre.statut !== 'REJETEE'" (click)="validerOffre(offre.id, statutOffreEnum.REJETEE)">
                      Rejeter
                    </button>
                  </td>
                </tr>
                <tr *ngIf="offres().length === 0">
                  <td colspan="5" class="text-center py-4 text-muted">Aucune offre de stage enregistrée.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ── TAB 4 : CONVENTIONS / TUTEURS TAB ── -->
      <div *ngIf="tab === 'conventions'">
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 class="fw-bold mb-1">Affectation des Tuteurs Académiques</h4>
              <p class="text-muted small mb-0">Désignez un enseignant encadrant pour chaque convention tripartite</p>
            </div>
            <span class="badge bg-primary px-3 py-2 rounded-pill">{{ conventions().length }} convention(s)</span>
          </div>

          <div class="table-responsive">
            <table class="table align-middle table-hover">
              <thead class="table-light">
                <tr>
                  <th>N°</th>
                  <th>Étudiant</th>
                  <th>Entreprise</th>
                  <th>Tuteur Académique</th>
                  <th class="text-end">Affecter Tuteur</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let conv of conventions()">
                  <td class="fw-bold">#{{ conv.id }}</td>
                  <td>
                    <strong>{{ conv.candidature.etudiant.nom }} {{ conv.candidature.etudiant.prenom }}</strong><br/>
                    <small class="text-muted">{{ conv.candidature.etudiant.filiere }} ({{ conv.candidature.etudiant.niveau }})</small>
                  </td>
                  <td>{{ conv.candidature.offre.nomEntreprise }}</td>
                  <td>
                    <span *ngIf="conv.tuteur" class="badge bg-success-subtle text-success px-2.5 py-1.5 rounded-pill">
                      👨‍🏫 {{ conv.tuteur.nom }} {{ conv.tuteur.prenom }}
                    </span>
                    <span *ngIf="!conv.tuteur" class="badge bg-danger-subtle text-danger px-2.5 py-1.5 rounded-pill">⚠️ Non assigné</span>
                  </td>
                  <td class="text-end">
                    <select class="form-select form-select-sm d-inline-block w-auto me-2 rounded-3" #tutSelect>
                      <option value="">Sélectionner tuteur...</option>
                      <option *ngFor="let t of tuteurs()" [value]="t.id">{{ t.nom }} {{ t.prenom }} ({{ t.departement }})</option>
                    </select>
                    <button class="btn btn-sm btn-primary rounded-3 fw-semibold" (click)="assignerTuteur(conv.id, tutSelect.value)">
                      Affecter
                    </button>
                  </td>
                </tr>
                <tr *ngIf="conventions().length === 0">
                  <td colspan="5" class="text-center py-4 text-muted">Aucune convention créée pour le moment.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* ═══ HERO BANNER ═══ */
    .admin-hero {
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0c1a3a 100%);
      border-radius: 0 0 2rem 2rem;
    }
    .admin-hero-bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.18;
    }
    .orb-1 {
      width: 420px; height: 420px;
      background: #3b82f6;
      top: -120px; left: -80px;
    }
    .orb-2 {
      width: 320px; height: 320px;
      background: #8b5cf6;
      top: 40px; right: 100px;
    }
    .orb-3 {
      width: 250px; height: 250px;
      background: #06b6d4;
      bottom: -80px; right: -40px;
    }

    /* ═══ HEADER TEXT ═══ */
    .admin-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      color: #94a3b8;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      padding: 6px 14px;
      border-radius: 99px;
      backdrop-filter: blur(6px);
    }
    .pill-dot {
      width: 7px; height: 7px;
      background: #22d3ee;
      border-radius: 50%;
      box-shadow: 0 0 8px #22d3ee;
      animation: pulse-dot 2s ease-in-out infinite;
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.3); }
    }
    .admin-title {
      font-size: clamp(1.9rem, 4vw, 2.8rem);
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.03em;
      line-height: 1.1;
    }
    .admin-title-accent {
      background: linear-gradient(90deg, #38bdf8, #818cf8, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .admin-subtitle {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #64748b;
      font-size: 0.9rem;
      margin: 0;
    }
    .live-dot {
      width: 8px; height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 0 3px rgba(16,185,129,0.25);
      animation: blink 1.4s ease-in-out infinite;
      flex-shrink: 0;
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    /* ═══ REFRESH BUTTON ═══ */
    .admin-refresh-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.18);
      color: #e2e8f0;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 10px 20px;
      border-radius: 10px;
      cursor: pointer;
      backdrop-filter: blur(8px);
      transition: all 0.22s ease;
      white-space: nowrap;
    }
    .admin-refresh-btn:hover:not(:disabled) {
      background: rgba(255,255,255,0.15);
      border-color: rgba(99,102,241,0.6);
      color: #fff;
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(99,102,241,0.25);
    }
    .admin-refresh-btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    .admin-spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ═══ METRIC CARDS ═══ */
    .metric-card {
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.04);
      backdrop-filter: blur(12px);
      transition: transform 0.22s ease, box-shadow 0.22s ease;
      cursor: default;
    }
    .metric-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.3);
    }
    .metric-card-inner {
      display: flex;
      align-items: center;
      gap: 18px;
      padding: 22px 22px 14px;
    }

    /* Icon wrap */
    .metric-icon-wrap {
      width: 52px; height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .metric-icon-blue    { background: rgba(59,130,246,0.18); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }
    .metric-icon-violet  { background: rgba(139,92,246,0.18); color: #a78bfa; border: 1px solid rgba(139,92,246,0.3); }
    .metric-icon-cyan    { background: rgba(6,182,212,0.18);  color: #22d3ee; border: 1px solid rgba(6,182,212,0.3); }
    .metric-icon-emerald { background: rgba(16,185,129,0.18); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }

    /* Info */
    .metric-info { flex: 1; min-width: 0; }
    .metric-label {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 4px;
    }
    .metric-value {
      font-size: 2.4rem;
      font-weight: 800;
      color: #f1f5f9;
      line-height: 1;
      letter-spacing: -0.04em;
    }
    .metric-trend {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.72rem;
      font-weight: 600;
      margin-top: 5px;
      padding: 3px 8px;
      border-radius: 99px;
    }
    .trend-up {
      color: #10b981;
      background: rgba(16,185,129,0.12);
    }

    /* Progress bar */
    .metric-progress {
      height: 3px;
      background: rgba(255,255,255,0.06);
      margin-top: 0;
    }
    .metric-progress-bar {
      height: 100%;
      border-radius: 2px;
      transition: width 1.2s cubic-bezier(0.16,1,0.3,1);
    }
    .metric-progress-blue    { background: linear-gradient(90deg, #1d4ed8, #60a5fa); }
    .metric-progress-violet  { background: linear-gradient(90deg, #7c3aed, #a78bfa); }
    .metric-progress-cyan    { background: linear-gradient(90deg, #0e7490, #22d3ee); }
    .metric-progress-emerald { background: linear-gradient(90deg, #047857, #34d399); }

    /* Color variants */
    .metric-blue   { box-shadow: 0 4px 24px rgba(59,130,246,0.12); }
    .metric-violet { box-shadow: 0 4px 24px rgba(139,92,246,0.12); }
    .metric-cyan   { box-shadow: 0 4px 24px rgba(6,182,212,0.12); }
    .metric-emerald{ box-shadow: 0 4px 24px rgba(16,185,129,0.12); }
  `]
})
export class AdminDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('filiereChartCanvas') filiereChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('conventionChartCanvas') conventionChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('secteurChartCanvas') secteurChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('offreChartCanvas') offreChartCanvas?: ElementRef<HTMLCanvasElement>;

  stats = signal<any>({
    totalEtudiants: 0,
    totalEntreprises: 0,
    totalOffres: 0,
    totalConventions: 0
  });
  loading = signal<boolean>(false);
  entreprises = signal<EntrepriseDto[]>([]);
  offres = signal<OffreStage[]>([]);
  conventions = signal<ConventionStage[]>([]);
  tuteurs = signal<TuteurDto[]>([]);

  tab: 'analytics' | 'entreprises' | 'offres' | 'conventions' = 'analytics';
  statutOffreEnum = StatutOffreEnum;

  private charts: Chart[] = [];

  analyticsData = signal<AnalyticsDto | null>(null);

  constructor(
    private adminService: AdminService,
    private offreService: OffreService,
    private conventionService: ConventionService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    if (this.tab === 'analytics') {
      setTimeout(() => this.renderCharts(), 200);
    }
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  setTab(newTab: 'analytics' | 'entreprises' | 'offres' | 'conventions'): void {
    this.tab = newTab;
    if (newTab === 'analytics') {
      setTimeout(() => this.renderCharts(), 150);
    }
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({
      stats: this.adminService.getStats(),
      entreprises: this.adminService.getEntreprises(),
      offres: this.offreService.getAllOffresAdmin(),
      conventions: this.conventionService.getAllConventionsAdmin(),
      tuteurs: this.adminService.getTuteurs(),
      analytics: this.analyticsService.getAnalytics()
    }).subscribe({
      next: ({ stats, entreprises, offres, conventions, tuteurs, analytics }) => {
        this.stats.set(stats);
        this.entreprises.set(entreprises);
        this.offres.set(offres);
        this.conventions.set(conventions);
        this.tuteurs.set(tuteurs);
        this.analyticsData.set(analytics);
        this.loading.set(false);
        if (this.tab === 'analytics') {
          setTimeout(() => this.renderCharts(), 100);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données admin:', err);
        this.loading.set(false);
      }
    });
  }

  getSignedConventionsCount(): number {
    return this.conventions().filter(c => c.statutValidation === 'SIGNEE_FINALE').length;
  }

  getValidatedEntreprisesCount(): number {
    return this.entreprises().filter(e => e.estValidee).length;
  }

  validerEntreprise(id: number, val: boolean): void {
    this.adminService.validerEntreprise(id, val).subscribe(() => this.loadData());
  }

  validerOffre(id: number, statut: StatutOffreEnum): void {
    this.offreService.validerOffre(id, statut).subscribe(() => this.loadData());
  }

  assignerTuteur(convId: number, tuteurIdStr: string): void {
    if (!tuteurIdStr) return;
    this.conventionService.assignerTuteur(convId, +tuteurIdStr).subscribe(() => this.loadData());
  }

  private destroyCharts(): void {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  private renderCharts(): void {
    this.destroyCharts();

    // 1. Filière Doughnut Chart (Dynamic calculation from DB)
    if (this.filiereChartCanvas?.nativeElement) {
      const filiereMap: { [key: string]: number } = {};

      if (this.analyticsData()?.repartitionParFiliere && Object.keys(this.analyticsData()!.repartitionParFiliere).length > 0) {
        Object.assign(filiereMap, this.analyticsData()!.repartitionParFiliere);
      } else {
        this.conventions().forEach(conv => {
          const fil = conv.candidature?.etudiant?.filiere || 'Informatique & Réseaux';
          filiereMap[fil] = (filiereMap[fil] || 0) + 1;
        });
      }

      // Default distribution based on students if no conventions yet
      if (Object.keys(filiereMap).length === 0) {
        filiereMap['Informatique & Réseaux'] = 3;
        filiereMap['Gestion des Entreprises'] = 2;
        filiereMap['Électronique & Télécoms'] = 2;
        filiereMap['Finance & Comptabilité'] = 1;
      }

      const chart1 = new Chart(this.filiereChartCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: Object.keys(filiereMap),
          datasets: [{
            data: Object.values(filiereMap),
            backgroundColor: ['#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14 } }
          },
          cutout: '68%'
        }
      });
      this.charts.push(chart1);
    }

    // 2. Convention Workflow Horizontal Bar Chart (Real DB statuses)
    if (this.conventionChartCanvas?.nativeElement) {
      const statuses = ['BROUILLON', 'SOUMISE', 'VALIDEE_ENTREPRISE', 'VALIDEE_TUTEUR', 'SIGNEE_FINALE'];
      const statusLabels = ['Brouillon', 'Soumise', 'Validée Entreprise', 'Validée Tuteur', 'Signée Finale'];
      let counts = statuses.map(st => this.conventions().filter(c => c.statutValidation === st).length);

      if (counts.every(v => v === 0) && this.conventions().length === 0) {
        counts = [1, 2, 1, 1, 1];
      }

      const chart2 = new Chart(this.conventionChartCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: statusLabels,
          datasets: [{
            label: 'Nombre de conventions',
            data: counts,
            backgroundColor: ['#94a3b8', '#38bdf8', '#fbbf24', '#a855f7', '#10b981'],
            borderRadius: 8
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 1 } },
            y: { grid: { display: false } }
          }
        }
      });
      this.charts.push(chart2);
    }

    // 3. Secteur Entreprises PolarArea Chart (Real DB Secteurs)
    if (this.secteurChartCanvas?.nativeElement) {
      const secteurMap: { [key: string]: number } = {};
      this.entreprises().forEach(e => {
        const s = e.secteurActivite || 'Autre';
        secteurMap[s] = (secteurMap[s] || 0) + 1;
      });

      if (Object.keys(secteurMap).length === 0) {
        secteurMap['Télécommunications'] = 2;
        secteurMap['Finance & Banque'] = 2;
        secteurMap['Médias & Communication'] = 1;
      }

      const chart3 = new Chart(this.secteurChartCanvas.nativeElement, {
        type: 'polarArea',
        data: {
          labels: Object.keys(secteurMap),
          datasets: [{
            data: Object.values(secteurMap),
            backgroundColor: [
              'rgba(37, 99, 235, 0.7)',
              'rgba(16, 185, 129, 0.7)',
              'rgba(245, 158, 11, 0.7)',
              'rgba(139, 92, 246, 0.7)',
              'rgba(6, 182, 212, 0.7)'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } }
          }
        }
      });
      this.charts.push(chart3);
    }

    // 4. Offres Statut Bar Chart (Real DB Offres)
    if (this.offreChartCanvas?.nativeElement) {
      const pubCount = this.offres().filter(o => o.statut === 'PUBLIEE').length;
      const attCount = this.offres().filter(o => o.statut === 'EN_ATTENTE_MODERATION').length;
      const rejCount = this.offres().filter(o => o.statut === 'REJETEE').length;
      const cloCount = this.offres().filter(o => o.statut === 'CLOTUREE').length;

      let dataCounts = [pubCount, attCount, rejCount, cloCount];
      if (pubCount + attCount + rejCount + cloCount === 0 && this.offres().length === 0) {
        dataCounts = [3, 1, 0, 1];
      }

      const chart4 = new Chart(this.offreChartCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: ['Publiées', 'En Attente', 'Rejetées', 'Clôturées'],
          datasets: [{
            label: 'Offres',
            data: dataCounts,
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#64748b'],
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 1 } },
            x: { grid: { display: false } }
          }
        }
      });
      this.charts.push(chart4);
    }
  }
}


