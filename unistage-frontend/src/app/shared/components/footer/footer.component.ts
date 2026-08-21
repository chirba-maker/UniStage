import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="footer-shell">
      <!-- Top Wave / Gradient Accent line -->
      <div class="footer-accent-bar"></div>

      <div class="footer-container">
        <!-- ── Main Grid ── -->
        <div class="footer-grid">

          <!-- Col 1: Brand & Identity -->
          <div class="footer-col brand-col">
            <a routerLink="/offres" class="footer-brand">
              <div class="brand-logo-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div class="brand-names">
                <span class="brand-title">Uni<span>Stage</span></span>
                <span class="brand-sub">Université de Labé</span>
              </div>
            </a>

            <p class="brand-tagline">
              Plateforme numérique d'excellence pour la gestion, l'attribution et la conventionnalisation tripartite des stages universitaires en République de Guinée.
            </p>

            <div class="republique-badge">
              <span class="flag-stripe red"></span>
              <span class="flag-stripe yellow"></span>
              <span class="flag-stripe green"></span>
              <span class="flag-text">République de Guinée • MESRSI</span>
            </div>
          </div>

          <!-- Col 2: Navigation Rapide -->
          <div class="footer-col">
            <h4 class="col-title">Navigation</h4>
            <ul class="footer-links">
              <li><a routerLink="/offres">💼 Offres de stage</a></li>
              <li><a routerLink="/auth/register-student">👨‍🎓 Espace Étudiants</a></li>
              <li><a routerLink="/auth/register-entreprise">🏢 Espace Entreprises</a></li>
              <li><a routerLink="/auth/login">🔐 Connexion sécurisée</a></li>
              <li><a routerLink="/conventions/mes-conventions">📜 Suivi des Conventions</a></li>
            </ul>
          </div>

          <!-- Col 3: Secteurs & Opportunités -->
          <div class="footer-col">
            <h4 class="col-title">Filières & Métiers</h4>
            <ul class="footer-links">
              <li><a routerLink="/offres" [queryParams]="{q: 'Informatique'}">💻 Génie Informatique & Télécoms</a></li>
              <li><a routerLink="/offres" [queryParams]="{q: 'Finance'}">📊 Banque, Finance & Économie</a></li>
              <li><a routerLink="/offres" [queryParams]="{q: 'Gestion'}">📈 Gestion & Administration</a></li>
              <li><a routerLink="/offres" [queryParams]="{q: 'Génie'}">⚙️ Sciences & Technologies</a></li>
              <li><a routerLink="/offres" [queryParams]="{q: 'Labé'}">📍 Opportunités Région de Labé</a></li>
            </ul>
          </div>

          <!-- Col 4: Université & Contact Officiel -->
          <div class="footer-col contact-col">
            <h4 class="col-title">Université de Labé</h4>
            <div class="contact-items">
              <div class="contact-item">
                <div class="contact-icon">📍</div>
                <div class="contact-txt">
                  <strong>Campus Universitaire de Hafia</strong>
                  <span>Labé, République de Guinée</span>
                </div>
              </div>

              <div class="contact-item">
                <div class="contact-icon">✉️</div>
                <div class="contact-txt">
                  <strong>Service des Stages & Insertion</strong>
                  <a href="mailto:stages@univ-labe.edu.gn">stages&#64;univ-labe.edu.gn</a>
                </div>
              </div>

              <div class="contact-item">
                <div class="contact-icon">📞</div>
                <div class="contact-txt">
                  <strong>Rectorat & Scolarité</strong>
                  <span>+224 620 00 00 00</span>
                </div>
              </div>
            </div>

            <div class="status-indicator">
              <span class="live-dot"></span>
              <span>Plateforme en ligne • Serveur Opérationnel</span>
            </div>
          </div>

        </div>

        <!-- ── Divider ── -->
        <div class="footer-bottom-divider"></div>

        <!-- ── Bottom Bar ── -->
        <div class="footer-bottom-bar">
          <div class="bottom-left">
            <p class="copyright-text">
              © {{ currentYear }} <strong>UniStage · Université de Labé</strong>. Tous droits réservés.
            </p>
            <p class="credits-sub">
              Conçu pour l'insertion professionnelle et l'excellence académique.
            </p>
          </div>

          <div class="bottom-right-links">
            <a href="javascript:void(0)" class="bottom-link">Conditions d'utilisation</a>
            <span class="dot-sep">•</span>
            <a href="javascript:void(0)" class="bottom-link">Politique de confidentialité</a>
            <span class="dot-sep">•</span>
            <a href="javascript:void(0)" class="bottom-link">Charte des stages</a>
            <span class="dot-sep">•</span>
            <a href="javascript:void(0)" class="bottom-link">Support & Aide</a>
          </div>
        </div>

      </div>
    </footer>
  `,
  styles: [`
    .footer-shell {
      background: #090d16;
      color: #94a3b8;
      font-size: 0.88rem;
      position: relative;
      overflow: hidden;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    /* Top Accent Line */
    .footer-accent-bar {
      height: 3px;
      width: 100%;
      background: linear-gradient(90deg, #2563eb 0%, #38bdf8 25%, #10b981 50%, #f59e0b 75%, #ef4444 100%);
    }

    .footer-container {
      max-width: 1240px;
      margin: 0 auto;
      padding: 4.5rem 1.5rem 2.5rem;
    }

    /* Grid */
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1.2fr 1.3fr 1.5fr;
      gap: 3rem;
      margin-bottom: 3.5rem;
    }

    /* Brand Column */
    .footer-brand {
      display: inline-flex;
      align-items: center;
      gap: 0.85rem;
      text-decoration: none;
      margin-bottom: 1.25rem;
    }
    .brand-logo-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
      flex-shrink: 0;
    }
    .brand-names {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      font-size: 1.35rem;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }
    .brand-title span {
      color: #38bdf8;
    }
    .brand-sub {
      font-size: 0.72rem;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-top: 0.15rem;
    }
    .brand-tagline {
      font-size: 0.88rem;
      line-height: 1.65;
      color: #94a3b8;
      margin-bottom: 1.5rem;
      max-width: 320px;
    }

    /* Guinea Flag Badge */
    .republique-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
    }
    .flag-stripe {
      width: 7px;
      height: 13px;
      border-radius: 2px;
    }
    .flag-stripe.red { background: #dc2626; }
    .flag-stripe.yellow { background: #facc15; }
    .flag-stripe.green { background: #16a34a; }
    .flag-text {
      font-size: 0.75rem;
      font-weight: 700;
      color: #cbd5e1;
      letter-spacing: 0.02em;
    }

    /* Titles */
    .col-title {
      font-size: 0.92rem;
      font-weight: 800;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin: 0 0 1.5rem 0;
      position: relative;
      padding-bottom: 0.6rem;
    }
    .col-title::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 24px;
      height: 2px;
      background: #2563eb;
      border-radius: 2px;
    }

    /* Links */
    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .footer-links li a {
      color: #94a3b8;
      text-decoration: none;
      transition: all 0.2s ease;
      display: inline-block;
      font-size: 0.88rem;
    }
    .footer-links li a:hover {
      color: #38bdf8;
      transform: translateX(3px);
    }

    /* Contact Column */
    .contact-items {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
      margin-bottom: 1.5rem;
    }
    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }
    .contact-icon {
      font-size: 1.1rem;
      flex-shrink: 0;
      margin-top: 0.1rem;
    }
    .contact-txt {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .contact-txt strong {
      color: #f1f5f9;
      font-size: 0.84rem;
      font-weight: 700;
    }
    .contact-txt span, .contact-txt a {
      color: #94a3b8;
      font-size: 0.8rem;
      text-decoration: none;
      transition: color 0.2s ease;
    }
    .contact-txt a:hover {
      color: #38bdf8;
    }

    /* Status Indicator */
    .status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.74rem;
      font-weight: 600;
      color: #34d399;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.2);
      padding: 0.35rem 0.75rem;
      border-radius: 99px;
    }
    .live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
      animation: blink 2s infinite;
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    /* Divider */
    .footer-bottom-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
      margin-bottom: 2rem;
    }

    /* Bottom Bar */
    .footer-bottom-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .bottom-left {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .copyright-text {
      color: #cbd5e1;
      font-size: 0.84rem;
      margin: 0;
    }
    .copyright-text strong {
      color: #ffffff;
    }
    .credits-sub {
      color: #64748b;
      font-size: 0.75rem;
      margin: 0;
    }

    .bottom-right-links {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .bottom-link {
      color: #64748b;
      text-decoration: none;
      font-size: 0.78rem;
      transition: color 0.2s ease;
    }
    .bottom-link:hover {
      color: #38bdf8;
    }
    .dot-sep {
      color: #334155;
      font-size: 0.7rem;
    }

    @media (max-width: 992px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 2.5rem;
      }
    }

    @media (max-width: 640px) {
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 2.5rem;
      }
      .footer-bottom-bar {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
