// src/app/features/ocr/pages/ocr-page/ocr-page.component.ts
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FileWithPreview } from '../../../../core/models/ocr.models';
import { FileUtilsService } from '../../../../core/services/file-utils.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { OcrService } from '../../../../core/services/ocr.service';
import { FileBrowserComponent } from '../../components/file-browser/file-browser.component';
import { PromptInputComponent } from '../../components/prompt-input/prompt-input.component';
import { ResultsViewerComponent } from '../../components/results-viewer/results-viewer.component';
import { UploadPanelComponent } from '../../components/upload-panel/upload-panel.component';

@Component({
  selector: 'app-ocr-page',
  standalone: true,
  imports: [
    CommonModule,
    UploadPanelComponent,
    PromptInputComponent,
    FileBrowserComponent,
    ResultsViewerComponent,
  ],
  template: `
    <div class="ocr-page">
      <!-- Header -->
      <header class="header">
        <div class="header-brand">
          <span class="logo">🔍</span>
          <h1 class="title">DeepSeek OCR Detection</h1>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          class="btn btn-secondary"
        >
          Get Source Code
        </a>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Left Panel - Upload -->
        <section class="left-panel">
          <app-upload-panel
            [selectedFile]="selectedFile()"
            (fileSelected)="onFileSelected($event)"
            (fileClear)="onFileClear()"
          />
        </section>

        <!-- Right Panel -->
        <section class="right-panel">
          <!-- Top Row - Prompt & File Browser -->
          <div class="top-row">
            <app-prompt-input
              [prompt]="prompt()"
              (promptChange)="onPromptChange($event)"
            />
            <app-file-browser
              [files]="files()"
              [selectedFileId]="selectedFile()?.id"
              (fileSelect)="onFileSelect($event)"
              (fileRemove)="onFileRemove($event)"
              (clearAll)="onClearAll()"
            />
          </div>

          <!-- Start Analysis Button -->
          <div class="action-bar">
            <button
              class="btn btn-primary btn-lg"
              [disabled]="!canAnalyze()"
              (click)="startAnalysis()"
            >
              ✨ Start Analysis
            </button>
          </div>

          <!-- Results Viewer -->
          <app-results-viewer
            [result]="currentResult()"
            [isLoading]="isProcessing()"
            [filename]="selectedFile()?.file?.name || 'result'"
          />
        </section>
      </main>
    </div>
  `,
  styles: [`
    .ocr-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--color-bg);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-md) var(--spacing-lg);
      background-color: var(--color-bg-card);
      border-bottom: 1px solid var(--color-border);
    }

    .header-brand {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .logo {
      font-size: 32px;
    }

    .title {
      font-size: var(--font-size-xl);
      font-weight: 600;
      margin: 0;
    }

    .main-content {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: var(--spacing-lg);
      padding: var(--spacing-lg);
      max-width: 1600px;
      margin: 0 auto;
      width: 100%;
    }

    .left-panel {
      display: flex;
      flex-direction: column;
    }

    .right-panel {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .top-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-lg);
    }

    .action-bar {
      display: flex;
      justify-content: center;
    }

    .btn-lg {
      padding: var(--spacing-md) var(--spacing-xl);
      font-size: var(--font-size-md);
    }

    app-results-viewer {
      flex: 1;
      min-height: 300px;
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .main-content {
        grid-template-columns: 1fr;
      }

      .top-row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: var(--spacing-md);
        text-align: center;
      }

      .main-content {
        padding: var(--spacing-md);
      }
    }
  `]
})
export class OcrPageComponent {
  private readonly ocrService = inject(OcrService);
  private readonly fileUtils = inject(FileUtilsService);
  private readonly notifications = inject(NotificationService);

  // State
  readonly files = signal<FileWithPreview[]>([]);
  readonly selectedFileId = signal<string | null>(null);
  readonly prompt = signal<string>('<image>\n<|grounding|>Convert the document to text, preserving the structure and formatting as much as possible.');
  readonly isProcessing = signal(false);

  // Computed
  readonly selectedFile = computed(() => {
    const id = this.selectedFileId();
    return this.files().find((f) => f.id === id);
  });

  readonly currentResult = computed(() => {
    return this.selectedFile()?.result;
  });

  readonly canAnalyze = computed(() => {
    const file = this.selectedFile();
    return file && (file.status === 'uploaded' || file.status === 'completed') && !this.isProcessing();
  });

  async onFileSelected(file: File): Promise<void> {
    const fileWithPreview: FileWithPreview = {
      file,
      id: this.fileUtils.generateId(),
      status: 'pending',
      progress: 0,
    };

    // Generate preview
    if (file.type.startsWith('image/')) {
      fileWithPreview.preview = await this.fileUtils.readAsDataURL(file);
    }

    // Add to list and select
    this.files.update((files) => [...files, fileWithPreview]);
    this.selectedFileId.set(fileWithPreview.id);

    // Start upload
    this.uploadFile(fileWithPreview);
  }

  private uploadFile(fileWithPreview: FileWithPreview): void {
    this.updateFileStatus(fileWithPreview.id, 'uploading');

    this.ocrService.uploadFile(fileWithPreview.file).subscribe({
      next: (event) => {
        this.updateFileProgress(fileWithPreview.id, event.progress);
        if (event.file) {
          this.files.update((files) =>
            files.map((f) =>
              f.id === fileWithPreview.id
                ? { ...f, status: 'uploaded' as const, uploadedFile: event.file }
                : f
            )
          );
          this.notifications.success('File uploaded successfully');
        }
      },
      error: (error) => {
        this.updateFileStatus(fileWithPreview.id, 'error', error.message);
        this.notifications.error(`Upload failed: ${error.message}`);
      },
    });
  }

  onFileClear(): void {
    const file = this.selectedFile();
    if (file) {
      this.onFileRemove(file);
    }
  }

  onFileSelect(file: FileWithPreview): void {
    this.selectedFileId.set(file.id);
  }

  onFileRemove(file: FileWithPreview): void {
    // Delete from server if uploaded
    if (file.uploadedFile) {
      this.ocrService.deleteFile(file.uploadedFile.id).subscribe();
    }

    this.files.update((files) => files.filter((f) => f.id !== file.id));

    // Clear selection if this was selected
    if (this.selectedFileId() === file.id) {
      const remaining = this.files();
      this.selectedFileId.set(remaining.length > 0 ? remaining[0].id : null);
    }
  }

  onClearAll(): void {
    // Delete all from server
    this.files().forEach((file) => {
      if (file.uploadedFile) {
        this.ocrService.deleteFile(file.uploadedFile.id).subscribe();
      }
    });

    this.files.set([]);
    this.selectedFileId.set(null);
  }

  onPromptChange(prompt: string): void {
    this.prompt.set(prompt);
  }

  async startAnalysis(): Promise<void> {
    const file = this.selectedFile();
    if (!file?.uploadedFile) return;

    this.isProcessing.set(true);
    this.updateFileStatus(file.id, 'processing');

    try {
      // Process the file
      const job = await this.ocrService
        .processFile(file.uploadedFile.id, this.prompt())
        .toPromise();

      if (!job) {
        throw new Error('No job returned');
      }

      // Poll for result (simple polling, could be improved with WebSocket)
      await this.pollForResult(job.id, file.id);
    } catch (error: any) {
      this.updateFileStatus(file.id, 'error', error.message);
      this.notifications.error(`Analysis failed: ${error.message}`);
    } finally {
      this.isProcessing.set(false);
    }
  }

  private async pollForResult(jobId: string, fileId: string): Promise<void> {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const job = await this.ocrService.getJobStatus(jobId).toPromise();

        if (job?.status === 'completed' && job.result) {
          this.files.update((files) =>
            files.map((f) =>
              f.id === fileId
                ? { ...f, status: 'completed' as const, result: job.result }
                : f
            )
          );
          this.notifications.success('Analysis completed');
          return;
        }

        if (job?.status === 'failed') {
          throw new Error(job.error || 'Processing failed');
        }

        // Wait before polling again
        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempts++;
      } catch (error: any) {
        throw error;
      }
    }

    throw new Error('Processing timeout');
  }

  private updateFileStatus(fileId: string, status: FileWithPreview['status'], error?: string): void {
    this.files.update((files) =>
      files.map((f) => (f.id === fileId ? { ...f, status, error } : f))
    );
  }

  private updateFileProgress(fileId: string, progress: number): void {
    this.files.update((files) =>
      files.map((f) => (f.id === fileId ? { ...f, progress } : f))
    );
  }
}