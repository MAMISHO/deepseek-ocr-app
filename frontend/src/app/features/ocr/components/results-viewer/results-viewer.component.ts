// src/app/features/ocr/components/results-viewer/results-viewer.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { OcrResult } from '../../../../core/models/ocr.models';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-results-viewer',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="card results-viewer" [class.fullscreen]="isFullscreen()">
      <div class="card-header">
        <h4>OCR Results Viewer</h4>
        <div class="header-actions">
          @if (result) {
            <button class="btn btn-icon" (click)="copyToClipboard()" title="Copy to clipboard">
              📋
            </button>
            <button class="btn btn-icon" (click)="downloadResult('txt')" title="Download as TXT">
              📥
            </button>
            <button class="btn btn-icon" (click)="downloadResult('json')" title="Download as JSON">
              📄
            </button>
          }
          <button class="btn btn-icon" (click)="toggleFullscreen()" title="Toggle fullscreen">
            ⛶
          </button>
        </div>
      </div>
      <div class="card-body">
        @if (isLoading) {
          <app-loading-spinner [message]="'Processing document...'" />
        } @else if (result) {
          <div class="results-viewer-content">
            <pre>{{ result.text }}</pre>
          </div>
          @if (result.confidence) {
            <div class="result-meta">
              <span class="badge badge-info">
                Confidence: {{ (result.confidence * 100).toFixed(1) }}%
              </span>
              @if (result.processingTime) {
                <span class="badge badge-info">
                  Time: {{ result.processingTime }}ms
                </span>
              }
            </div>
          }
        } @else {
          <div class="results-viewer-placeholder">
            <span class="icon">📄</span>
            <span>Select file to preview results</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .results-viewer {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .results-viewer.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
      border-radius: 0;
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-xs);
    }

    .card-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .results-viewer-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-md);
      background-color: var(--color-bg);
      border-radius: var(--radius-md);
    }

    .results-viewer-content pre {
      margin: 0;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: var(--font-size-sm);
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .results-viewer-placeholder {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--color-text-secondary);
      gap: var(--spacing-md);
    }

    .results-viewer-placeholder .icon {
      font-size: 48px;
    }

    .result-meta {
      display: flex;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--color-border);
    }

    .fullscreen .results-viewer-content {
      max-height: calc(100vh - 150px);
    }
  `]
})
export class ResultsViewerComponent {
  @Input() result?: OcrResult;
  @Input() isLoading = false;
  @Input() filename = 'result';

  private readonly notifications = inject(NotificationService);
  readonly isFullscreen = signal(false);

  toggleFullscreen(): void {
    this.isFullscreen.update((v) => !v);
  }

  async copyToClipboard(): Promise<void> {
    if (!this.result?.text) return;

    try {
      await navigator.clipboard.writeText(this.result.text);
      this.notifications.success('Copied to clipboard');
    } catch {
      this.notifications.error('Failed to copy to clipboard');
    }
  }

  downloadResult(format: 'txt' | 'json'): void {
    if (!this.result) return;

    let content: string;
    let mimeType: string;
    let extension: string;

    if (format === 'json') {
      content = JSON.stringify(this.result, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      content = this.result.text;
      mimeType = 'text/plain';
      extension = 'txt';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.filename}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);

    this.notifications.success(`Downloaded as ${extension.toUpperCase()}`);
  }
}