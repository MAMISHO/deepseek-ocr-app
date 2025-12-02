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
  placeholder = 'Extract all text from this image.';

  templates = [
    // Prompts probados y efectivos
    { label: 'Extract Text', value: 'Extract all text from this image.' },
    { label: 'Perform OCR', value: 'Perform OCR and output the text.' },
    { label: 'To Markdown', value: 'Convert the entire document to clean markdown, using appropriate headings and lists. Exclude any non-textual elements or coordinates.' },
    { label: 'Handwritten', value: 'Transcribe the handwritten text exactly as it appears.' },
    { label: 'Numbers & Dates', value: 'Extract all text, with a focus on numerical data and dates.' },
    { label: 'Names & Emails', value: 'Find and list all names and email addresses in the document.' },
    { label: 'Extract Table', value: 'Extract the table data and format it as a markdown table.' },
    { label: 'Receipt/Invoice', value: 'Extract all text from this receipt, including item names, quantities, prices, and total.' },
  ];

  onPromptChange(value: string): void {
    this.promptChange.emit(value);
  }

  applyTemplate(value: string): void {
    this.promptValue = value;
    this.promptChange.emit(value);
  }
}