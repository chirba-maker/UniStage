import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OffreService } from '../../../core/services/offre.service';
import { AuthService } from '../../../core/services/auth.service';
import { OffreStage } from '../../../core/models/offre.model';

@Component({
  selector: 'app-offres-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="offres-page">

      <!-- ── HERO SECTION (Ultra Clean & High-End Aesthetic) ── -->
      <section class="hero-section">
        <!-- Background subtle glow & grid mesh -->
        <div class="hero-bg-grid"></div>
        <div class="hero-glow hero-glow-1"></div>
        <div class="hero-glow hero-glow-2"></div>

        <div class="hero-container">
          <!-- Top pill badge -->
          <div class="hero-badge">
            <span class="badge-pulse">
              <span class="pulse-dot"></span>
              <span class="pulse-ring"></span>
            </span>
            <span class="badge-text">Portail Officiel des Stages • Université de Labé</span>
          </div>

          <!-- Main Title with high contrast gradient -->
          <h1 class="hero-title">
            Propulsez votre avenir avec
            <span class="title-highlight">le stage parfait en Guinée</span>
          </h1>

          <!-- Subtitle -->
          <p class="hero-subtitle">
            La passerelle directe entre les étudiants d'excellence de Labé et les entreprises leaders. 
            Découvrez des opportunités vérifiées, postulez en 1 clic et signez votre convention tripartite en ligne.
          </p>

          <!-- Search & Filter Glass Box -->
          <div class="search-glass-container">
            <div class="search-input-wrap">
              <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                class="search-glass-input"
                [(ngModel)]="searchQuery"
                (keyup.enter)="onSearch()"
                placeholder="Rechercher par métier (ex: Développeur, Comptable, Réseaux, Ville...)"
              />
              <button *ngIf="searchQuery" (click)="clearSearch()" class="btn-clear-inline" title="Effacer la recherche">
                ✕
              </button>
            </div>

            <button class="btn-search-glow" (click)="onSearch()">
              <span>Explorer les offres</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          <!-- Fast Quick Keywords / Chips -->
          <div class="quick-keywords">
            <span class="quick-label">Suggestions :</span>
            <button class="quick-chip" (click)="setFilter('Informatique')">💻 Informatique</button>
            <button class="quick-chip" (click)="setFilter('Télécoms')">📡 Télécoms</button>
            <button class="quick-chip" (click)="setFilter('Banque')">🏦 Banque & Finance</button>
            <button class="quick-chip" (click)="setFilter('Conakry')">📍 Conakry</button>
            <button class="quick-chip" (click)="setFilter('Labé')">📍 Labé</button>
          </div>

          <!-- Micro Stats Strip -->
          <div class="hero-stats-strip">
            <div class="hero-stat-item">
              <span class="stat-number">{{ offres().length }}</span>
              <span class="stat-caption">Offres Disponibles</span>
            </div>
            <div class="stat-divider"></div>
            <div class="hero-stat-item">
              <span class="stat-number">100%</span>
              <span class="stat-caption">Entreprises Vérifiées</span>
            </div>
            <div class="stat-divider"></div>
            <div class="hero-stat-item">
              <span class="stat-number">⚡ Tripartite</span>
              <span class="stat-caption">Signature & PDF en ligne</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── KEY ADVANTAGES BAR ── -->
      <section class="advantages-bar">
        <div class="advantages-container">
          <div class="adv-card">
            <div class="adv-icon adv-icon-blue">🎓</div>
            <div class="adv-info">
              <h4>Étudiants de Labé</h4>
              <p>Postulez directement avec votre CV et suivez vos candidatures en temps réel.</p>
            </div>
          </div>
          <div class="adv-card">
            <div class="adv-icon adv-icon-green">🏢</div>
            <div class="adv-info">
              <h4>Entreprises Partenaires</h4>
              <p>Recrutez les meilleurs talents universitaires et validez vos conventions en ligne.</p>
            </div>
          </div>
          <div class="adv-card">
            <div class="adv-icon adv-icon-purple">📜</div>
            <div class="adv-info">
              <h4>Suivi Académique</h4>
              <p>Tuteurs désignés et conventions générées et signées électroniquement en PDF.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ── OFFRES LISTING SECTION ── -->
      <section class="offres-content">
        <div class="content-container">

          <!-- Section Toolbar -->
          <div class="section-toolbar">
            <div class="toolbar-left">
              <div class="title-with-badge">
                <h2>Opportunités de Stage</h2>
                <span class="count-pill" *ngIf="!loading()">{{ filteredOffres.length }} offre{{ filteredOffres.length > 1 ? 's' : '' }}</span>
              </div>
              <p class="section-description" *ngIf="!searchQuery">
                Consultez les offres publiées récemment par nos entreprises partenaires
              </p>
              <p class="section-description text-primary-active" *ngIf="searchQuery">
                Résultats filtrés pour : <strong>« {{ searchQuery }} »</strong>
              </p>
            </div>

            <div class="toolbar-right" *ngIf="searchQuery">
              <button class="btn-reset-filter" (click)="clearSearch()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Réinitialiser la recherche
              </button>
            </div>
          </div>

          <!-- Loading State with Shimmer Animation -->
          <div class="loading-state" *ngIf="loading()">
            <div class="spinner-glow"></div>
            <p>Recherche des meilleures offres en cours…</p>
          </div>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="!loading() && filteredOffres.length === 0">
            <div class="empty-icon-wrap">🔍</div>
            <h3>Aucune offre ne correspond à votre recherche</h3>
            <p>Essayez avec d'autres termes comme « Développeur », « Finance », « Conakry » ou réinitialisez le filtre.</p>
            <button class="btn-reset-large" (click)="clearSearch()">
              Afficher toutes les offres disponibles
            </button>
          </div>

          <!-- Cards Grid -->
          <div class="cards-grid" *ngIf="!loading() && filteredOffres.length > 0">
            <a
              *ngFor="let offre of filteredOffres; let i = index"
              [routerLink]="['/offres', offre.slug]"
              class="premium-offre-card"
            >
              <!-- Card Top (Company info & verified) -->
              <div class="card-top-row">
                <div class="company-brand">
                  <div class="company-logo-badge" [ngStyle]="{'background': getCompanyGradient(offre.nomEntreprise)}">
                    {{ (offre.nomEntreprise || '🏢').charAt(0) }}
                  </div>
                  <div class="company-text">
                    <span class="company-name-tag">{{ offre.nomEntreprise }}</span>
                    <span class="verified-tag">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      Vérifiée
                    </span>
                  </div>
                </div>

                <div class="card-arrow-pill">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>

              <!-- Offer Title -->
              <h3 class="offer-title">{{ offre.titre }}</h3>

              <!-- Offer Description snippet -->
              <p class="offer-snippet">{{ offre.description }}</p>

              <!-- Tags info row -->
              <div class="offer-tags-row">
                <span class="info-tag tag-location">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ offre.lieu }}
                </span>

                <span class="info-tag tag-duration">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {{ offre.dureeMois }} mois
                </span>

                <span class="info-tag tag-salary" *ngIf="offre.gratification && offre.gratification > 0">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  {{ offre.gratification | number:'1.0-0' }} GNF/mois
                </span>
                <span class="info-tag tag-unpaid" *ngIf="!offre.gratification || offre.gratification === 0">
                  Stage académique
                </span>
              </div>

              <!-- Card Bottom Action -->
              <div class="card-bottom-cta">
                <span class="cta-text">Voir les détails & postuler</span>
                <span class="cta-icon">→</span>
              </div>
            </a>
          </div>

        </div>
      </section>

      <!-- ── CALL TO ACTION SECTION (Affiche uniquement SI NON CONNECTE) ── -->
      <section class="bottom-cta-section" *ngIf="!authService.isLoggedIn()">
        <div class="cta-box-modern">
          <div class="cta-glow-circle-1"></div>
          <div class="cta-glow-circle-2"></div>
          <div class="cta-pattern-overlay"></div>

          <div class="cta-content-inner">
            <div class="cta-left-text">
              <div class="cta-pill-header">
                <span class="pill-sparkle">✨</span>
                <span>Partenariat Entreprises & Insertion</span>
              </div>
              <h2 class="cta-title">Vous recrutez des stagiaires ?</h2>
              <p class="cta-subtitle">
                Publiez vos offres en toute simplicité et accédez aux profils qualifiés de l'Université de Labé. Validez vos conventions tripartites en ligne en quelques clics.
              </p>

              <div class="cta-metrics-mini">
                <div class="metric-chip">✓ Validation rapide</div>
                <div class="metric-chip">✓ Signature PDF officielle</div>
                <div class="metric-chip">✓ Profils vérifiés</div>
              </div>
            </div>

            <div class="cta-right-actions">
              <a routerLink="/auth/register-entreprise" class="btn-cta-glow-primary">
                <span class="btn-icon">🏢</span>
                <div class="btn-txt-wrap">
                  <strong>Espace Recruteur</strong>
                  <small>Publier une offre de stage</small>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>

              <a routerLink="/auth/register-student" class="btn-cta-glow-secondary">
                <span class="btn-icon">👨‍🎓</span>
                <div class="btn-txt-wrap">
                  <strong>Espace Étudiant</strong>
                  <small>Créer son profil candidat</small>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>


    </div>
  `,
  styles: [`
    .offres-page {
      min-height: 100vh;
      background: #f8fafc;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* ── HERO SECTION ── */
    .hero-section {
      position: relative;
      background: radial-gradient(circle at 50% 0%, #1e3a8a 0%, #0f172a 75%, #020617 100%);
      padding: 2.2rem 1.5rem 4rem;
      overflow: hidden;
      color: #fff;
    }
    .hero-bg-grid {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }
    .hero-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      pointer-events: none;
    }
    .hero-glow-1 {
      width: 500px;
      height: 500px;
      background: rgba(37, 99, 235, 0.22);
      top: -150px;
      left: 15%;
    }
    .hero-glow-2 {
      width: 450px;
      height: 450px;
      background: rgba(124, 58, 237, 0.18);
      top: -50px;
      right: 10%;
    }

    .hero-container {
      max-width: 860px;
      margin: 0 auto;
      text-align: center;
      position: relative;
      z-index: 2;
    }

    /* Badge */
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.8rem;
      font-weight: 700;
      color: #93c5fd;
      background: rgba(30, 58, 138, 0.45);
      border: 1.5px solid rgba(147, 197, 253, 0.3);
      padding: 0.35rem 1.1rem;
      border-radius: 999px;
      margin-bottom: 1.25rem;
      backdrop-filter: blur(10px);
      letter-spacing: 0.02em;
    }
    .badge-pulse {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 8px;
      height: 8px;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      background: #38bdf8;
      border-radius: 50%;
    }
    .pulse-ring {
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid #38bdf8;
      animation: ripple 2s infinite ease-out;
    }
    @keyframes ripple {
      0% { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    /* Title & Subtitle */
    .hero-title {
      font-size: clamp(2.4rem, 5.5vw, 3.8rem);
      font-weight: 900;
      line-height: 1.15;
      letter-spacing: -0.035em;
      margin: 0 0 1.25rem 0;
      color: #f8fafc;
    }
    .title-highlight {
      background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #38bdf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: inline-block;
    }
    .hero-subtitle {
      font-size: 1.05rem;
      line-height: 1.65;
      color: #94a3b8;
      max-width: 680px;
      margin: 0 auto 2.5rem;
    }

    /* Glass Search Box */
    .search-glass-container {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(16px);
      border-radius: 16px;
      padding: 0.45rem 0.45rem 0.45rem 1.25rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1);
      max-width: 720px;
      margin: 0 auto 1.5rem;
      gap: 0.5rem;
    }
    .search-input-wrap {
      display: flex;
      align-items: center;
      flex: 1;
      gap: 0.75rem;
      position: relative;
    }
    .search-icon {
      color: #64748b;
      flex-shrink: 0;
    }
    .search-glass-input {
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      font-size: 0.95rem;
      color: #0f172a;
      font-weight: 500;
    }
    .search-glass-input::placeholder {
      color: #94a3b8;
    }
    .btn-clear-inline {
      background: #e2e8f0;
      border: none;
      color: #475569;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      cursor: pointer;
      flex-shrink: 0;
    }
    .btn-search-glow {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #fff;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 12px;
      font-size: 0.92rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .btn-search-glow:hover {
      background: linear-gradient(135deg, #1d4ed8, #1e40af);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
    }

    /* Quick Keywords */
    .quick-keywords {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 2.5rem;
    }
    .quick-label {
      font-size: 0.8rem;
      color: #94a3b8;
      font-weight: 600;
    }
    .quick-chip {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #e2e8f0;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.3rem 0.75rem;
      border-radius: 99px;
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(6px);
    }
    .quick-chip:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.35);
      color: #fff;
      transform: translateY(-1px);
    }

    /* Stats Strip */
    .hero-stats-strip {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      max-width: 620px;
      margin: 0 auto;
    }
    .hero-stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .stat-number {
      font-size: 1.4rem;
      font-weight: 800;
      color: #fff;
      line-height: 1.1;
    }
    .stat-caption {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 600;
      margin-top: 0.2rem;
    }
    .stat-divider {
      width: 1px;
      height: 28px;
      background: rgba(255, 255, 255, 0.15);
    }

    /* ── ADVANTAGES BAR ── */
    .advantages-bar {
      background: #fff;
      border-bottom: 1px solid #e2e8f0;
      padding: 2rem 1.5rem;
    }
    .advantages-container {
      max-width: 1180px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .adv-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.25rem;
      border-radius: 14px;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      transition: all 0.2s ease;
    }
    .adv-card:hover {
      background: #fff;
      border-color: #e2e8f0;
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
      transform: translateY(-2px);
    }
    .adv-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      flex-shrink: 0;
    }
    .adv-icon-blue { background: #eff6ff; border: 1px solid #bfdbfe; }
    .adv-icon-green { background: #ecfdf5; border: 1px solid #a7f3d0; }
    .adv-icon-purple { background: #f5f3ff; border: 1px solid #ddd6fe; }
    .adv-info h4 {
      font-size: 0.95rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.25rem 0;
    }
    .adv-info p {
      font-size: 0.82rem;
      color: #64748b;
      margin: 0;
      line-height: 1.5;
    }

    /* ── OFFRES CONTENT SECTION ── */
    .offres-content {
      padding: 3.5rem 1.5rem 5rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .content-container {
      width: 100%;
    }

    /* Section Toolbar */
    .section-toolbar {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 2rem;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .title-with-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.35rem;
    }
    .title-with-badge h2 {
      font-size: 1.6rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.02em;
    }
    .count-pill {
      font-size: 0.78rem;
      font-weight: 700;
      color: #2563eb;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 0.2rem 0.65rem;
      border-radius: 99px;
    }
    .section-description {
      font-size: 0.9rem;
      color: #64748b;
      margin: 0;
    }
    .text-primary-active {
      color: #2563eb;
    }
    .btn-reset-filter {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #fff;
      border: 1.5px solid #cbd5e1;
      color: #475569;
      font-size: 0.82rem;
      font-weight: 700;
      padding: 0.5rem 1rem;
      border-radius: 9px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-reset-filter:hover {
      background: #f1f5f9;
      border-color: #94a3b8;
    }

    /* Loading & Empty */
    .loading-state, .empty-state {
      text-align: center;
      padding: 5rem 2rem;
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 20px;
    }
    .spinner-glow {
      width: 44px;
      height: 44px;
      border: 3.5px solid #e2e8f0;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      margin: 0 auto 1.25rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-icon-wrap {
      font-size: 3.2rem;
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
      max-width: 460px;
      margin: 0 auto 1.5rem;
      line-height: 1.6;
    }
    .btn-reset-large {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 0.75rem 1.75rem;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(37,99,235,0.3);
      transition: all 0.2s;
    }
    .btn-reset-large:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
    }

    /* ── CARDS GRID (Sleek High-End Look) ── */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .premium-offre-card {
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 18px;
      padding: 1.75rem;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
    }
    .premium-offre-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
      border-color: #93c5fd;
    }

    .card-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }
    .company-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .company-logo-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      color: #fff;
      font-size: 1.2rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 3px 8px rgba(0,0,0,0.12);
    }
    .company-text {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .company-name-tag {
      font-size: 0.85rem;
      font-weight: 800;
      color: #1e293b;
      letter-spacing: -0.01em;
    }
    .verified-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      font-size: 0.68rem;
      font-weight: 700;
      color: #059669;
      background: #ecfdf5;
      padding: 0.1rem 0.45rem;
      border-radius: 4px;
      width: fit-content;
    }
    .card-arrow-pill {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      transition: all 0.2s ease;
    }
    .premium-offre-card:hover .card-arrow-pill {
      background: #2563eb;
      color: #fff;
      border-color: #2563eb;
      transform: translateX(3px);
    }

    .offer-title {
      font-size: 1.18rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.6rem 0;
      line-height: 1.35;
      letter-spacing: -0.015em;
    }
    .premium-offre-card:hover .offer-title {
      color: #2563eb;
    }

    .offer-snippet {
      font-size: 0.86rem;
      color: #64748b;
      line-height: 1.6;
      margin: 0 0 1.25rem 0;
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Tags */
    .offer-tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
      margin-bottom: 1.25rem;
      padding-top: 0.85rem;
      border-top: 1px solid #f1f5f9;
    }
    .info-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.3rem 0.65rem;
      border-radius: 8px;
    }
    .tag-location {
      background: #f1f5f9;
      color: #475569;
    }
    .tag-duration {
      background: #eff6ff;
      color: #2563eb;
    }
    .tag-salary {
      background: #ecfdf5;
      color: #059669;
    }
    .tag-unpaid {
      background: #f8fafc;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }

    /* Card CTA Bottom */
    .card-bottom-cta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.82rem;
      font-weight: 800;
      color: #2563eb;
      padding-top: 0.75rem;
      border-top: 1px dashed #e2e8f0;
    }
    .cta-icon {
      font-size: 1.1rem;
      transition: transform 0.2s ease;
    }
    .premium-offre-card:hover .cta-icon {
      transform: translateX(4px);
    }

    /* ── BOTTOM CTA (Ultra Modern Mesh Glow) ── */
    .bottom-cta-section {
      background: #f8fafc;
      padding: 2rem 1.5rem 5rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .cta-box-modern {
      position: relative;
      background: radial-gradient(circle at 10% 20%, #1e3a8a 0%, #0f172a 70%, #020617 100%);
      border-radius: 24px;
      padding: 3.5rem 3.5rem;
      color: #fff;
      overflow: hidden;
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.14), 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .cta-glow-circle-1 {
      position: absolute;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%);
      top: -120px;
      right: -50px;
      pointer-events: none;
      filter: blur(60px);
    }
    .cta-glow-circle-2 {
      position: absolute;
      width: 350px;
      height: 350px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 70%);
      bottom: -100px;
      left: 10%;
      pointer-events: none;
      filter: blur(60px);
    }
    .cta-pattern-overlay {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 32px 32px;
      pointer-events: none;
    }

    .cta-content-inner {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 3rem;
      flex-wrap: wrap;
    }
    .cta-left-text {
      flex: 1;
      min-width: 300px;
    }
    .cta-pill-header {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.76rem;
      font-weight: 700;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.28);
      padding: 0.35rem 0.85rem;
      border-radius: 99px;
      margin-bottom: 1rem;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      backdrop-filter: blur(6px);
    }
    .pill-sparkle {
      font-size: 0.85rem;
    }
    .cta-title {
      font-size: 2.1rem;
      font-weight: 800;
      color: #ffffff !important;
      margin: 0 0 0.85rem 0;
      letter-spacing: -0.03em;
      line-height: 1.2;
    }
    .cta-subtitle {
      font-size: 0.95rem;
      color: #cbd5e1 !important;
      max-width: 540px;
      margin: 0 0 1.5rem 0;
      line-height: 1.65;
    }

    /* Metric Chips */
    .cta-metrics-mini {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .metric-chip {
      font-size: 0.76rem;
      font-weight: 700;
      color: #a7f3d0;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      padding: 0.3rem 0.75rem;
      border-radius: 8px;
    }

    /* Right Action Buttons */
    .cta-right-actions {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      min-width: 260px;
    }
    .btn-cta-glow-primary {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #ffffff !important;
      text-decoration: none;
      padding: 0.85rem 1.35rem;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
      transition: all 0.22s ease;
    }
    .btn-cta-glow-primary:hover {
      background: linear-gradient(135deg, #1d4ed8, #1e40af);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(37, 99, 235, 0.5);
    }
    .btn-cta-glow-secondary {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background: rgba(255, 255, 255, 0.06);
      color: #ffffff !important;
      text-decoration: none;
      padding: 0.85rem 1.35rem;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      backdrop-filter: blur(10px);
      transition: all 0.22s ease;
    }
    .btn-cta-glow-secondary:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
      transform: translateY(-2px);
    }

    .btn-icon {
      font-size: 1.4rem;
      flex-shrink: 0;
    }
    .btn-txt-wrap {
      display: flex;
      flex-direction: column;
      line-height: 1.25;
      flex: 1;
    }
    .btn-txt-wrap strong {
      font-size: 0.92rem;
      font-weight: 800;
      color: #ffffff;
    }
    .btn-txt-wrap small {
      font-size: 0.72rem;
      color: #cbd5e1;
      opacity: 0.85;
    }

    @media (max-width: 900px) {
      .cta-box-modern { padding: 2.5rem 1.75rem; }
      .cta-content-inner { flex-direction: column; align-items: stretch; gap: 2rem; }
      .cta-right-actions { width: 100%; }
    }
  `]
})
export class OffresListComponent implements OnInit {
  offres = signal<OffreStage[]>([]);
  loading = signal<boolean>(true);
  searchQuery = '';

  constructor(
    private offreService: OffreService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOffres();
  }

  get filteredOffres(): OffreStage[] {
    const list = this.offres();
    if (!this.searchQuery.trim()) return list;
    const q = this.searchQuery.toLowerCase();
    return list.filter(o =>
      (o.titre && o.titre.toLowerCase().includes(q)) ||
      (o.nomEntreprise && o.nomEntreprise.toLowerCase().includes(q)) ||
      (o.lieu && o.lieu.toLowerCase().includes(q)) ||
      (o.description && o.description.toLowerCase().includes(q))
    );
  }

  loadOffres(): void {
    this.loading.set(true);
    this.offreService.getOffresPubliees('').subscribe({
      next: (data) => {
        this.offres.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(): void {
    // Already reactive via filteredOffres getter
  }

  setFilter(kw: string): void {
    this.searchQuery = kw;
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  getCompanyGradient(name?: string): string {
    if (!name) return 'linear-gradient(135deg, #2563eb, #1d4ed8)';
    const gradients = [
      'linear-gradient(135deg, #2563eb, #3b82f6)',
      'linear-gradient(135deg, #059669, #10b981)',
      'linear-gradient(135deg, #d97706, #f59e0b)',
      'linear-gradient(135deg, #7c3aed, #8b5cf6)',
      'linear-gradient(135deg, #e11d48, #f43f5e)',
      'linear-gradient(135deg, #0891b2, #06b6d4)'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % gradients.length;
    return gradients[idx];
  }
}

