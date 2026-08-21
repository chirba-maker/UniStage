import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite" aria-label="Notifications">
      <div
        *ngFor="let toast of toastService.toasts(); trackBy: trackById"
        class="toast-card"
        [class]="'toast-' + toast.type"
        role="alert"
      >
        <!-- Icon -->
        <div class="toast-icon">
          <!-- Success -->
          <svg *ngIf="toast.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <!-- Error -->
          <svg *ngIf="toast.type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <!-- Warning -->
          <svg *ngIf="toast.type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <!-- Info -->
          <svg *ngIf="toast.type === 'info'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        <!-- Content -->
        <div class="toast-content">
          <p class="toast-title">{{ toast.title }}</p>
          <p class="toast-message" *ngIf="toast.message">{{ toast.message }}</p>
        </div>

        <!-- Progress bar -->
        <div class="toast-progress" [style.animation-duration]="toast.duration + 'ms'"></div>

        <!-- Close button -->
        <button class="toast-close" (click)="toastService.dismiss(toast.id)" aria-label="Fermer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 380px;
      width: calc(100vw - 40px);
      pointer-events: none;
    }

    .toast-card {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem 1rem 1rem 1rem;
      border-radius: 14px;
      border: 1px solid transparent;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
      overflow: hidden;
      pointer-events: all;
      animation: toast-slide-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      min-width: 280px;
    }

    @keyframes toast-slide-in {
      from { opacity: 0; transform: translateX(100%) scale(0.9); }
      to   { opacity: 1; transform: translateX(0) scale(1); }
    }

    /* Type colors */
    .toast-success {
      background: linear-gradient(135deg, rgba(240,253,244,0.97), rgba(220,252,231,0.97));
      border-color: #86efac;
      color: #14532d;
    }
    .toast-success .toast-icon { color: #16a34a; background: #dcfce7; }
    .toast-success .toast-progress { background: #16a34a; }

    .toast-error {
      background: linear-gradient(135deg, rgba(254,242,242,0.97), rgba(254,226,226,0.97));
      border-color: #fca5a5;
      color: #7f1d1d;
    }
    .toast-error .toast-icon { color: #dc2626; background: #fee2e2; }
    .toast-error .toast-progress { background: #dc2626; }

    .toast-warning {
      background: linear-gradient(135deg, rgba(255,251,235,0.97), rgba(254,243,199,0.97));
      border-color: #fde68a;
      color: #78350f;
    }
    .toast-warning .toast-icon { color: #d97706; background: #fef3c7; }
    .toast-warning .toast-progress { background: #d97706; }

    .toast-info {
      background: linear-gradient(135deg, rgba(239,246,255,0.97), rgba(219,234,254,0.97));
      border-color: #93c5fd;
      color: #1e3a5f;
    }
    .toast-info .toast-icon { color: #2563eb; background: #dbeafe; }
    .toast-info .toast-progress { background: #2563eb; }

    .toast-icon {
      flex-shrink: 0;
      width: 34px;
      height: 34px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .toast-icon svg { width: 18px; height: 18px; }

    .toast-content {
      flex: 1;
      min-width: 0;
      padding-right: 1.5rem;
    }
    .toast-title {
      font-size: 0.875rem;
      font-weight: 700;
      line-height: 1.3;
      margin: 0 0 0.15rem;
    }
    .toast-message {
      font-size: 0.78rem;
      opacity: 0.8;
      line-height: 1.4;
      margin: 0;
    }

    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      width: 100%;
      border-radius: 0 0 14px 14px;
      animation: toast-progress linear forwards;
      transform-origin: left;
    }
    @keyframes toast-progress {
      from { transform: scaleX(1); }
      to   { transform: scaleX(0); }
    }

    .toast-close {
      position: absolute;
      top: 0.6rem;
      right: 0.6rem;
      width: 22px;
      height: 22px;
      border: none;
      background: transparent;
      cursor: pointer;
      opacity: 0.5;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: opacity 0.2s;
    }
    .toast-close:hover { opacity: 1; }
    .toast-close svg { width: 14px; height: 14px; }

    @media (max-width: 480px) {
      .toast-container { right: 12px; top: 72px; width: calc(100vw - 24px); }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);

  trackById(_: number, t: Toast): string {
    return t.id;
  }
}
