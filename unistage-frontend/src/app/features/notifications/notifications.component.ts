import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrap">
      
      <!-- Header -->
      <div class="page-header">
        <div class="header-inner">
          <div class="header-text">
            <div class="sub-badge">Centre de notifications</div>
            <h1>Mes Notifications</h1>
            <p>Retrouvez toutes les alertes relatives à vos candidatures et offres.</p>
          </div>
          <div class="header-actions-right">
            <div class="header-badge" *ngIf="!loading() && unreadCount > 0">
              <span class="count-num">{{ unreadCount }}</span>
              <span class="count-label">non lue{{ unreadCount > 1 ? 's' : '' }}</span>
            </div>
            <button
              *ngIf="!loading() && unreadCount > 0"
              class="btn-mark-all"
              (click)="markAllAsRead()"
            >
              ✓ Tout marquer comme lu
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-container">

        <!-- Loading -->
        <div *ngIf="loading()" class="loading-state">
          <div class="spinner"></div>
          <p>Chargement des notifications…</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && notifications().length === 0" class="empty-state">
          <div class="empty-icon-wrap">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
          <h3>Aucune notification</h3>
          <p>Vous êtes à jour ! Aucune nouvelle notification pour le moment.</p>
        </div>

        <!-- Notification list -->
        <div class="notif-list" *ngIf="!loading() && notifications().length > 0">
          <div 
            *ngFor="let notif of notifications()" 
            class="notif-card"
            [class.unread]="!notif.lue"
          >
            <div class="notif-icon-col">
              <div class="notif-icon" [class.icon-unread]="!notif.lue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
            </div>

            <div class="notif-content-col">
              <div class="notif-meta">
                <h4 class="notif-title">{{ notif.titre }}</h4>
                <span class="notif-time">{{ notif.createdAt | date:'dd/MM/yyyy à HH:mm' }}</span>
              </div>
              <p class="notif-desc">{{ notif.message }}</p>
              
              <div class="notif-action" *ngIf="!notif.lue">
                <button class="btn-mark-read" (click)="markAsRead(notif)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Marquer comme lue
                </button>
              </div>
            </div>

            <div class="unread-indicator" *ngIf="!notif.lue"></div>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .page-wrap {
      min-height: calc(100vh - 64px);
      background: #f8fafc;
    }

    /* ── Header ── */
    .page-header {
      background: #fff;
      border-bottom: 1.5px solid #e2e8f0;
      padding: 2.25rem 2rem 1.5rem;
    }
    .header-inner {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .sub-badge {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #2563eb;
      background: #eff6ff;
      padding: 0.2rem 0.6rem;
      border-radius: 99px;
      margin-bottom: 0.5rem;
      display: inline-block;
    }
    .header-text h1 {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin-bottom: 0.35rem;
    }
    .header-text p {
      font-size: 0.9rem;
      color: #64748b;
    }
    .header-actions-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .header-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #eff6ff;
      border: 1.5px solid #bfdbfe;
      border-radius: 14px;
      padding: 0.6rem 1.1rem;
      text-align: center;
    }
    .btn-mark-all {
      background: #fff;
      color: #2563eb;
      border: 1.5px solid #bfdbfe;
      padding: 0.6rem 1.1rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .btn-mark-all:hover {
      background: #eff6ff;
      border-color: #93c5fd;
      transform: translateY(-1px);
    }
    .count-num {
      font-size: 1.6rem;
      font-weight: 800;
      color: #2563eb;
      line-height: 1;
    }
    .count-label {
      font-size: 0.7rem;
      font-weight: 600;
      color: #60a5fa;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* ── Content ── */
    .content-container {
      max-width: 900px;
      margin: 2.25rem auto 5rem;
      padding: 0 1.5rem;
    }

    /* Loading / Empty */
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
      animation: spin 0.7s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state {
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      padding: 4rem 2rem;
      text-align: center;
    }
    .empty-icon-wrap { margin-bottom: 1rem; }
    .empty-state h3 {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.4rem;
    }
    .empty-state p {
      font-size: 0.875rem;
      color: #64748b;
    }

    /* Notification cards */
    .notif-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .notif-card {
      position: relative;
      display: flex;
      gap: 1.25rem;
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 14px;
      padding: 1.25rem 1.5rem;
      transition: all 0.2s ease;
    }
    .notif-card:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
      border-color: #cbd5e1;
    }
    .notif-card.unread {
      background: #fafcff;
      border-color: #bfdbfe;
    }
    .unread-indicator {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #2563eb;
    }

    .notif-icon-col {
      flex-shrink: 0;
    }
    .notif-icon {
      width: 38px; height: 38px;
      border-radius: 10px;
      background: #f1f5f9;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .notif-icon.icon-unread {
      background: #eff6ff;
      color: #2563eb;
    }

    .notif-content-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .notif-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }
    .notif-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    .notif-time {
      font-size: 0.75rem;
      color: #94a3b8;
      white-space: nowrap;
      margin-right: 1rem;
    }
    .notif-desc {
      font-size: 0.85rem;
      color: #475569;
      line-height: 1.5;
      margin: 0;
    }

    .notif-action {
      margin-top: 0.4rem;
    }
    .btn-mark-read {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: transparent;
      border: 1px solid #bfdbfe;
      color: #2563eb;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.3rem 0.65rem;
      border-radius: 6px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }
    .btn-mark-read:hover {
      background: #eff6ff;
      border-color: #93c5fd;
    }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications = signal<Notification[]>([]);
  loading = signal<boolean>(true);

  get unreadCount(): number {
    return this.notifications().filter(n => !n.lue).length;
  }

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.notificationService.getMyNotifications().subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.loading.set(false);
        // Sync the navbar badge
        this.notificationService.fetchUnreadCount().subscribe();
      },
      error: () => this.loading.set(false)
    });
  }

  markAsRead(notif: Notification): void {
    if (notif.lue) return;
    this.notificationService.markAsRead(notif.id).subscribe({
      next: () => {
        // Update the notification in place
        this.notifications.update(list =>
          list.map(n => n.id === notif.id ? { ...n, lue: true } : n)
        );
        // Sync navbar badge count
        this.notificationService.fetchUnreadCount().subscribe();
      }
    });
  }

  markAllAsRead(): void {
    const unread = this.notifications().filter(n => !n.lue);
    unread.forEach(n => {
      this.notificationService.markAsRead(n.id).subscribe();
    });
    this.notifications.update(list => list.map(n => ({ ...n, lue: true })));
    this.notificationService.unreadCount.set(0);
  }
}

