// src/app/features/ocr/components/prompt-input/prompt-input.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-prompt-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card prompt-input">
      <div class="card-header">
        <h4>Prompt Input</h4>
      </div>
      <div class="card-body">
        <textarea
          class="form-textarea"
          [(ngModel)]="promptValue"
          (ngModelChange)="onPromptChange($event)"
          [placeholder]="placeholder"
          rows="6"
        ></textarea>
        
        <div class="prompt-templates">
          <span class="label">Quick prompts:</span>
          <div class="template-buttons">
            @for (template of templates; track template.label) {
              <button
                class="btn btn-secondary btn-sm"
                (click)="applyTemplate(template.value)"
              >
                {{ template.label }}
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .prompt-input {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .card-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .form-textarea {
      flex: 1;
      resize: none;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: var(--font-size-sm);
    }

    .prompt-templates {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .label {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .template-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
    }

    .btn-sm {
      padding: 4px 8px;
      font-size: var(--font-size-xs);
    }
  `]
})
export class PromptInputComponent {
  @Input() set prompt(value: string) {
    this.promptValue = value;
  }
  @Output() promptChange = new EventEmitter<string>();

  promptValue = '';
  placeholder = '<image>\n<|grounding|>Convert the document to text, preserving the structure and formatting as much as possible.';

  templates = [
    { label: 'Extract Text', value: '<image>\nExtract the text in the image.' },
    { label: 'To Markdown', value: '<image>\n<|grounding|>Convert the document to markdown.' },
    { label: 'Parse Figure', value: '<image>\nParse the figure.' },
    { label: 'Free OCR', value: '<image>\nFree OCR.' },
    { label: 'Layout Analysis', value: '<image>\n<|grounding|>Given the layout of the image.' },
  ];

  onPromptChange(value: string): void {
    this.promptChange.emit(value);
  }

  applyTemplate(value: string): void {
    this.promptValue = value;
    this.promptChange.emit(value);
  }
}