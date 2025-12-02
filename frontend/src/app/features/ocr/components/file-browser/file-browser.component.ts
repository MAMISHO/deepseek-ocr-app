// src/app/features/ocr/components/file-browser/file-browser.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FileWithPreview } from '../../../../core/models/ocr.models';
import { FileUtilsService } from '../../../../core/services/file-utils.service';

@Component({
  selector: 'app-file-browser',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card file-browser">
      <div class="card-header">
        <h4>File Browser</h4>
        @if (files.length > 0) {
          <button class="btn btn-icon" (click)="onClearAll()" title="Clear all">
            🗑️
          </button>
        }
      </div>
      <div class="card-body">
        @if (files.length === 0) {
          <div class="empty-state">
            <span class="icon">📁</span>
            <span>Waiting for files...</span>
          </div>
        } @else {
          <ul class="file-list">
            @for (file of files; track file.id) {
              <li
                class="file-list-item"
                [class.active]="selectedFileId === file.id"
                [class.processing]="file.status === 'processing'"
                [class.completed]="file.status === 'completed'"
                [class.error]="file.status === 'error'"
                (click)="onSelectFile(file)"
              >
                <span class="file-list-icon">{{ getFileIcon(file.file.type) }}</span>
                <span class="file-list-name">{{ file.file.name }}</span>
                <span class="file-list-status">
                  @switch (file.status) {
                    @case ('pending') { ⏳ }
                    @case ('uploading') { ⬆️ }
                    @case ('uploaded') { ✓ }
                    @case ('processing') { 🔄 }
                    @case ('completed') { ✅ }
                    @case ('error') { ❌ }
                  }
                </span>
                <button
                  class="btn btn-icon btn-sm"
                  (click)="onRemoveFile(file, $event)"
                  title="Remove"
                >
                  ✕
                </button>
              </li>
            }
          </ul>
        }
      </div>
    </div>
  `,
  styles: [`
    .file-browser {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .card-body {
      flex: 1;
      overflow-y: auto;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 120px;
      color: var(--color-text-secondary);
      gap: var(--spacing-sm);
    }

    .empty-state .icon {
      font-size: 32px;
    }

    .file-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .file-list-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }

    .file-list-item:hover {
      background-color: var(--color-bg);
    }

    .file-list-item.active {
      background-color: var(--color-primary-light);
    }

    .file-list-item.processing {
      animation: pulse 1.5s infinite;
    }

    .file-list-item.completed .file-list-name {
      color: var(--color-success);
    }

    .file-list-item.error .file-list-name {
      color: var(--color-error);
    }

    .file-list-icon {
      font-size: 20px;
    }

    .file-list-name {
      flex: 1;
      font-size: var(--font-size-sm);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .file-list-status {
      font-size: 14px;
    }

    .btn-sm {
      width: 24px;
      height: 24px;
      padding: 0;
      font-size: 12px;
      opacity: 0;
      transition: opacity var(--transition-fast);
    }

    .file-list-item:hover .btn-sm {
      opacity: 1;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  `]
})
export class FileBrowserComponent {
  @Input() files: FileWithPreview[] = [];
  @Input() selectedFileId?: string;
  @Output() fileSelect = new EventEmitter<FileWithPreview>();
  @Output() fileRemove = new EventEmitter<FileWithPreview>();
  @Output() clearAll = new EventEmitter<void>();

  private readonly fileUtils = inject(FileUtilsService);

  getFileIcon(mimeType: string): string {
    return this.fileUtils.getFileIcon(mimeType);
  }

  onSelectFile(file: FileWithPreview): void {
    this.fileSelect.emit(file);
  }

  onRemoveFile(file: FileWithPreview, event: Event): void {
    event.stopPropagation();
    this.fileRemove.emit(file);
  }

  onClearAll(): void {
    this.clearAll.emit();
  }
}