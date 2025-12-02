// src/app/features/ocr/components/upload-panel/upload-panel.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FileWithPreview } from '../../../../core/models/ocr.models';
import { FileUtilsService } from '../../../../core/services/file-utils.service';
import { FilePreviewComponent } from '../../../../shared/components/file-preview/file-preview.component';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-upload-panel',
  standalone: true,
  imports: [CommonModule, FileUploadComponent, FilePreviewComponent, LoadingSpinnerComponent],
  template: `
    <div class="card upload-panel">
      <div class="card-header">
        <h4>📤 Upload File</h4>
        @if (selectedFile) {
          <button class="btn btn-icon" (click)="onClearFile()" title="Remove file">
            🗑️
          </button>
        }
      </div>
      <div class="card-body">
        @if (!selectedFile) {
          <app-file-upload (filesSelected)="onFilesSelected($event)" />
        } @else {
          <div class="preview-container">
            @if (selectedFile.status === 'uploading') {
              <div class="upload-progress">
                <app-loading-spinner [message]="'Uploading...'" />
                <div class="progress-bar">
                  <div class="progress-bar-fill" [style.width.%]="selectedFile.progress"></div>
                </div>
                <span class="progress-text">{{ selectedFile.progress }}%</span>
              </div>
            } @else {
              <app-file-preview
                [previewUrl]="selectedFile.preview"
                [filename]="selectedFile.file.name"
                [mimeType]="selectedFile.file.type"
                [showActions]="false"
              />
              <div class="file-info">
                <span class="file-name">{{ selectedFile.file.name }}</span>
                <span class="file-size">{{ formatFileSize(selectedFile.file.size) }}</span>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .upload-panel {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .card-body {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .preview-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    app-file-preview {
      flex: 1;
      min-height: 200px;
    }

    .file-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm);
      background-color: var(--color-bg);
      border-radius: var(--radius-md);
    }

    .file-name {
      font-size: var(--font-size-sm);
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .file-size {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .upload-progress {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-md);
      padding: var(--spacing-xl);
    }

    .progress-bar {
      width: 100%;
      max-width: 200px;
    }

    .progress-text {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }
  `]
})
export class UploadPanelComponent {
  @Input() selectedFile?: FileWithPreview;
  @Output() fileSelected = new EventEmitter<File>();
  @Output() fileClear = new EventEmitter<void>();

  private readonly fileUtils = inject(FileUtilsService);

  onFilesSelected(files: File[]): void {
    if (files.length > 0) {
      this.fileSelected.emit(files[0]);
    }
  }

  onClearFile(): void {
    this.fileClear.emit();
  }

  formatFileSize(bytes: number): string {
    return this.fileUtils.formatFileSize(bytes);
  }
}