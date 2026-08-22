import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ConventionService } from '../../../core/services/convention.service';
import { ConventionStage } from '../../../core/models/convention.model';

@Component({
  selector: 'app-tuteur-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container py-4">

      <!-- Hero Banner Premium -->
      <div class="hero-banner-premium fade-up">
        <div class="hero-content">
          <div class="hero-badge-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            Université de Labé • Espace Pédagogique
          </div>
          <h1 class="hero-title">Espace Tuteur Académique</h1>
          <p class="hero-subtitle">
            Suivi pédagogique, examen et validation officielle des conventions de stage de vos étudiants.
          </p>

          <!-- Quick Stats Row -->
          <div class="d-flex flex-wrap gap-3 mt-4" *ngIf="!loading()">
            <div class="stat-pill">
              <span class="stat-pill-val">{{ conventions().length }}</span>
              <span class="stat-pill-lbl">Conventions assignées</span>
            </div>
            <div class="stat-pill">
              <span class="stat-pill-val text-warning">{{ countPending() }}</span>
              <span class="stat-pill-lbl">À examiner & signer</span>
            </div>
            <div class="stat-pill">
              <span class="stat-pill-val text-success">{{ countSigned() }}</span>
              <span class="stat-pill-lbl">Conventions finalisées</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls & Filter Toolbar -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 fade-up fade-up-delay-1" *ngIf="!loading() && conventions().length > 0">
        <!-- Filter Tabs -->
        <div class="filter-tabs">
          <button class="tab-btn" [class.active]="filterStatus() === 'ALL'" (click)="filterStatus.set('ALL')">
            Toutes <span class="tab-count">{{ conventions().length }}</span>
          </button>
          <button class="tab-btn" [class.active]="filterStatus() === 'PENDING'" (click)="filterStatus.set('PENDING')">
            À signer <span class="tab-count count-warning">{{ countPending() }}</span>
          </button>
          <button class="tab-btn" [class.active]="filterStatus() === 'SIGNED'" (click)="filterStatus.set('SIGNED')">
            Signées <span class="tab-count count-success">{{ countSigned() }}</span>
          </button>
        </div>

        <!-- Search Box -->
        <div class="search-box">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            type="text" 
            class="search-input" 
            placeholder="Rechercher étudiant, entreprise..." 
            [ngModel]="searchQuery()" 
            (ngModelChange)="searchQuery.set($event)"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="text-center py-5">
        <div class="spinner-uni mx-auto mb-3"></div>
        <p class="text-muted fw-semibold">Chargement des conventions attribuées...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && filteredConventions().length === 0" class="card-uni-premium p-5 text-center fade-up">
        <div class="empty-icon-box mb-3">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <h4 class="fw-bold text-dark mb-2">Aucune convention trouvée</h4>
        <p class="text-secondary max-w-400 mx-auto">
          {{ conventions().length === 0 ? 'Aucune convention de stage ne vous est attribuée pour le moment.' : 'Aucun résultat ne correspond à vos critères de recherche.' }}
        </p>
      </div>

      <!-- Conventions List -->
      <div class="row g-4" *ngIf="!loading() && filteredConventions().length > 0">
        <div class="col-12" *ngFor="let conv of filteredConventions(); let i = index">
          <div class="card-uni-premium card-hover-elevate fade-up" [style.animation-delay]="(i * 0.05) + 's'">
            <div class="card-inner-padding">
              
              <!-- Card Top Header Bar -->
              <div class="card-header-bar">
                <div class="d-flex align-items-center gap-2">
                  <span class="conv-id-badge">Convention N° {{ conv.id }}</span>
                  <span class="conv-date-text">
                    Créée le {{ conv.dateCreation | date:'dd/MM/yyyy' }}
                  </span>
                </div>

                <!-- Status Pulse Badge -->
                <span class="badge-status-pill" [ngClass]="getStatutBadgeClass(conv.statutValidation)">
                  <span class="pulse-dot"></span>
                  {{ getStatutLabel(conv.statutValidation) }}
                </span>
              </div>

              <hr class="card-divider" />

              <!-- Card Body Content -->
              <div class="row align-items-center g-4">
                <!-- Left: Student Info Block -->
                <div class="col-lg-8">
                  <div class="d-flex align-items-start gap-3 mb-3">
                    <div class="student-avatar">
                      {{ (conv.candidature.etudiant.prenom.charAt(0) + conv.candidature.etudiant.nom.charAt(0)).toUpperCase() }}
                    </div>
                    <div>
                      <h3 class="student-name">
                        {{ conv.candidature.etudiant.nom }} {{ conv.candidature.etudiant.prenom }}
                      </h3>
                      <p class="student-meta">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="me-1">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                        </svg>
                        {{ conv.candidature.etudiant.filiere }} — <span class="badge-niveau">{{ conv.candidature.etudiant.niveau }}</span>
                      </p>
                    </div>
                  </div>

                  <!-- Details Grid (Company, Role, Dates) -->
                  <div class="details-grid-container">
                    <div class="detail-cell">
                      <span class="detail-cell-label">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="6" x2="9" y2="6"/><line x1="15" y1="6" x2="15" y2="6"/><line x1="9" y1="10" x2="9" y2="10"/><line x1="15" y1="10" x2="15" y2="10"/>
                        </svg>
                        Entreprise
                      </span>
                      <span class="detail-cell-val text-dark fw-bold">
                        {{ conv.candidature.offre.nomEntreprise }}
                      </span>
                    </div>

                    <div class="detail-cell">
                      <span class="detail-cell-label">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                        </svg>
                        Intitulé du Poste
                      </span>
                      <span class="detail-cell-val text-dark fw-semibold">
                        {{ conv.candidature.offre.titre }}
                      </span>
                    </div>

                    <div class="detail-cell">
                      <span class="detail-cell-label">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Période du stage
                      </span>
                      <span class="detail-cell-val text-secondary">
                        du {{ conv.dateDebut | date:'dd/MM/yyyy' }} au {{ conv.dateFin | date:'dd/MM/yyyy' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Right: Action Button -->
                <div class="col-lg-4 text-lg-end">
                  <div class="action-card-box">
                    <a [routerLink]="['/conventions', conv.id]" class="btn-uni btn-primary btn-examine w-100">
                      <span>Examiner & Signer</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* Filter Toolbar */
    .filter-tabs {
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 0.25rem;
      gap: 0.25rem;
      box-shadow: 0 2px 6px rgba(0,0,0,0.02);
    }
    .tab-btn {
      background: transparent;
      border: none;
      font-size: 0.85rem;
      font-weight: 600;
      color: #64748b;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .tab-btn:hover {
      color: #1e293b;
      background: #f8fafc;
    }
    .tab-btn.active {
      background: #2563eb;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(37,99,235,0.25);
    }
    .tab-count {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 99px;
      background: #f1f5f9;
      color: #475569;
    }
    .tab-btn.active .tab-count {
      background: rgba(255, 255, 255, 0.25);
      color: #ffffff;
    }
    .count-warning { background: #fef3c7; color: #b45309; }
    .count-success { background: #d1fae5; color: #047857; }

    /* Search Box */
    .search-box {
      position: relative;
      min-width: 280px;
    }
    .search-icon {
      position: absolute;
      left: 0.9rem;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }
    .search-input {
      width: 100%;
      padding: 0.55rem 1rem 0.55rem 2.5rem;
      font-size: 0.875rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      background: #ffffff;
      color: #1e293b;
      outline: none;
      transition: all 0.2s ease;
    }
    .search-input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    /* Card Inner Layout */
    .card-inner-padding {
      padding: 1.75rem;
    }
    .card-header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .conv-id-badge {
      font-size: 0.75rem;
      font-weight: 800;
      color: #1e293b;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      letter-spacing: 0.02em;
    }
    .conv-date-text {
      font-size: 0.78rem;
      color: #64748b;
      font-weight: 500;
    }
    .card-divider {
      margin: 1rem 0 1.25rem 0;
      border-color: #f1f5f9;
      opacity: 1;
    }

    /* Student Avatar & Title */
    .student-avatar {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #2563eb 0%, #6366f1 100%);
      color: #ffffff;
      font-family: var(--font-display);
      font-size: 1rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
      flex-shrink: 0;
    }
    .student-name {
      font-size: 1.2rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.15rem 0;
      line-height: 1.2;
    }
    .student-meta {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0;
      display: flex;
      align-items: center;
    }
    .badge-niveau {
      font-size: 0.72rem;
      font-weight: 700;
      background: #eff6ff;
      color: #2563eb;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      margin-left: 0.25rem;
    }

    /* Details Grid */
    .details-grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 12px;
      padding: 0.85rem 1.1rem;
    }
    .detail-cell {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .detail-cell-label {
      font-size: 0.73rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .detail-cell-val {
      font-size: 0.88rem;
    }

    /* Action Box */
    .action-card-box {
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 14px;
      padding: 1.25rem 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-examine {
      padding: 0.75rem 1.25rem;
      font-size: 0.9rem;
      border-radius: 10px;
    }

    .empty-icon-box {
      width: 72px;
      height: 72px;
      border-radius: 20px;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }
    .max-w-400 { max-width: 400px; }
  `]
})
export class TuteurDashboardComponent implements OnInit {
  conventions = signal<ConventionStage[]>([]);
  loading = signal<boolean>(true);
  searchQuery = signal<string>('');
  filterStatus = signal<string>('ALL');

  countPending = computed(() => {
    return this.conventions().filter(c => c.statutValidation === 'VALIDEE_ENTREPRISE' || c.statutValidation === 'SOUMISE').length;
  });

  countSigned = computed(() => {
    return this.conventions().filter(c => c.statutValidation === 'SIGNEE_FINALE').length;
  });

  filteredConventions = computed(() => {
    let list = this.conventions();
    const query = this.searchQuery().toLowerCase().trim();
    const statusFilter = this.filterStatus();

    if (statusFilter === 'PENDING') {
      list = list.filter(c => c.statutValidation === 'VALIDEE_ENTREPRISE' || c.statutValidation === 'SOUMISE');
    } else if (statusFilter === 'SIGNED') {
      list = list.filter(c => c.statutValidation === 'SIGNEE_FINALE');
    }

    if (query) {
      list = list.filter(c => {
        const etudiantNom = `${c.candidature?.etudiant?.nom || ''} ${c.candidature?.etudiant?.prenom || ''}`.toLowerCase();
        const entreprise = (c.candidature?.offre?.nomEntreprise || '').toLowerCase();
        const poste = (c.candidature?.offre?.titre || '').toLowerCase();
        return etudiantNom.includes(query) || entreprise.includes(query) || poste.includes(query);
      });
    }

    return list;
  });

  constructor(private conventionService: ConventionService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.conventionService.getConventionsTuteur().subscribe({
      next: (data) => {
        this.conventions.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'BROUILLON': return 'Brouillon';
      case 'SOUMISE': return 'En attente Tuteur';
      case 'VALIDEE_ENTREPRISE': return 'Validée par Entreprise';
      case 'VALIDEE_TUTEUR': return 'Validée par Tuteur';
      case 'SIGNEE_FINALE': return 'Signée & Finalisée';
      default: return statut;
    }
  }

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'VALIDEE_ENTREPRISE': return 'badge-status-warning';
      case 'SIGNEE_FINALE': return 'badge-status-success';
      case 'SOUMISE': return 'badge-status-info';
      default: return 'badge-status-secondary';
    }
  }
}

