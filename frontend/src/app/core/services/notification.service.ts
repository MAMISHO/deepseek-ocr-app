// src/app/core/services/notification.service.ts
import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly _notifications = signal<Notification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  show(type: Notification['type'], message: string, duration = 5000): void {
    const id = crypto.randomUUID();
    const notification: Notification = { id, type, message, duration };

    this._notifications.update((notifications) => [...notifications, notification]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show('success', message, duration);
  }

  error(message: string, duration?: number): void {
    this.show('error', message, duration ?? 8000);
  }

  warning(message: string, duration?: number): void {
    this.show('warning', message, duration);
  }

  info(message: string, duration?: number): void {
    this.show('info', message, duration);
  }

  dismiss(id: string): void {
    this._notifications.update((notifications) => notifications.filter((n) => n.id !== id));
  }

  clear(): void {
    this._notifications.set([]);
  }
}