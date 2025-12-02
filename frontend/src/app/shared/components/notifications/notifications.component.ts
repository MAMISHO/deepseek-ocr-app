// src/app/shared/components/notifications/notifications.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      @for (notification of notificationService.notifications(); track notification.id) {
        <div class="toast toast-{{ notification.type }}">
          <span class="toast-icon">
            @switch (notification.type) {
              @case ('success') { ✓ }
              @case ('error') { ✕ }
              @case ('warning') { ⚠ }
              @case ('info') { ℹ }
            }
          </span>
          <span class="toast-message">{{ notification.message }}</span>
          <button class="toast-close" (click)="notificationService.dismiss(notification.id)">
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: var(--spacing-lg);
      right: var(--spacing-lg);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      background-color: var(--color-bg-card);
      box-shadow: var(--shadow-card-hover);
      animation: slideIn 0.3s ease;
    }

    .toast-success { border-left: 4px solid var(--color-success); }
    .toast-error { border-left: 4px solid var(--color-error); }
    .toast-warning { border-left: 4px solid var(--color-warning); }
    .toast-info { border-left: 4px solid var(--color-info); }

    .toast-icon {
      font-weight: bold;
    }

    .toast-success .toast-icon { color: var(--color-success); }
    .toast-error .toast-icon { color: var(--color-error); }
    .toast-warning .toast-icon { color: var(--color-warning); }
    .toast-info .toast-icon { color: var(--color-info); }

    .toast-message {
      flex: 1;
      font-size: var(--font-size-sm);
    }

    .toast-close {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-text-secondary);
      padding: var(--spacing-xs);
    }

    .toast-close:hover {
      color: var(--color-text-primary);
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `]
})
export class NotificationsComponent {
  readonly notificationService = inject(NotificationService);
}