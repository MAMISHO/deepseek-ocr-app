// src/app/shared/components/file-preview/file-preview.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-file-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="file-preview">
      @if (previewUrl) {
        @if (isPdf) {
          <div class="pdf-preview">
            <span class="pdf-icon">📄</span>
            <span class="pdf-label">PDF Document</span>
          </div>
        } @else {
          <img [src]="previewUrl" [alt]="filename" class="image-preview" />
        }
      } @else {
        <div class="no-preview">
          <span class="icon">📁</span>
          <span>No preview available</span>
        </div>
      }
      
      @if (showActions) {
        <div class="preview-actions">
          <button class="btn btn-icon" (click)="onRemove.emit()" title="Remove">
            🗑️
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .file-preview {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--color-bg);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .image-preview {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .pdf-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-sm);
      color: var(--color-text-secondary);
    }

    .pdf-icon {
      font-size: 64px;
    }

    .pdf-label {
      font-size: var(--font-size-sm);
    }

    .no-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-sm);
      color: var(--color-text-secondary);
    }

    .no-preview .icon {
      font-size: 48px;
    }

    .preview-actions {
      position: absolute;
      top: var(--spacing-sm);
      right: var(--spacing-sm);
      display: flex;
      gap: var(--spacing-xs);
    }
  `]
})
export class FilePreviewComponent {
  @Input() previewUrl?: string;
  @Input() filename = '';
  @Input() mimeType = '';
  @Input() showActions = true;
  @Output() onRemove = new EventEmitter<void>();

  get isPdf(): boolean {
    return this.mimeType === 'application/pdf';
  }
}