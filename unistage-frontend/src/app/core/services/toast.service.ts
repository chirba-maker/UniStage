import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  private show(type: ToastType, title: string, message?: string, duration = 4000): void {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { id, type, title, message, duration };
    this.toasts.update(t => [...t, toast]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(title: string, message?: string, duration?: number): void {
    this.show('success', title, message, duration);
  }

  error(title: string, message?: string, duration?: number): void {
    this.show('error', title, message, duration ?? 6000);
  }

  warning(title: string, message?: string, duration?: number): void {
    this.show('warning', title, message, duration);
  }

  info(title: string, message?: string, duration?: number): void {
    this.show('info', title, message, duration);
  }

  dismiss(id: string): void {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
