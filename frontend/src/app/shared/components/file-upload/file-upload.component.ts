// src/app/shared/components/file-upload/file-upload.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { FileUtilsService } from '../../../core/services/file-utils.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="upload-zone"
      [class.drag-over]="isDragOver()"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
      (click)="fileInput.click()"
    >
      <input
        #fileInput
        type="file"
        [accept]="acceptedTypes"
        [multiple]="multiple"
        (change)="onFileSelected($event)"
        hidden
      />
      
      <div class="upload-zone-icon">📤</div>
      <div class="upload-zone-text">
        <p><strong>Click to upload</strong> or drag and drop</p>
        <p class="text-secondary">PDF, PNG, JPG (max. {{ maxFileSizeLabel }})</p>
      </div>
    </div>
  `,
  styles: [`
    .upload-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      padding: var(--spacing-xl);
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-lg);
      background-color: var(--color-bg);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .upload-zone:hover,
    .upload-zone.drag-over {
      border-color: var(--color-primary);
      background-color: var(--color-primary-light);
    }

    .upload-zone-icon {
      font-size: 48px;
      margin-bottom: var(--spacing-md);
    }

    .upload-zone-text {
      text-align: center;
    }

    .upload-zone-text p {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .upload-zone-text strong {
      color: var(--color-primary);
    }
  `]
})
export class FileUploadComponent {
  @Output() filesSelected = new EventEmitter<File[]>();
  
  private readonly fileUtils = inject(FileUtilsService);
  private readonly notifications = inject(NotificationService);
  
  readonly isDragOver = signal(false);
  readonly multiple = true;
  readonly acceptedTypes = environment.allowedMimeTypes.join(',');
  readonly maxFileSizeLabel = this.fileUtils.formatFileSize(environment.maxFileSize);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
      input.value = ''; // Reset input
    }
  }

  private handleFiles(files: File[]): void {
    const validFiles: File[] = [];

    for (const file of files) {
      if (!this.fileUtils.isValidFileType(file)) {
        this.notifications.warning(`"${file.name}" is not a supported file type`);
        continue;
      }

      if (!this.fileUtils.isValidFileSize(file)) {
        this.notifications.warning(`"${file.name}" exceeds the maximum file size`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      this.filesSelected.emit(validFiles);
    }
  }
}