// src/app/app.component.ts
import { Component } from '@angular/core';
import { OcrPageComponent } from './features/ocr/pages/ocr-page/ocr-page.component';
import { NotificationsComponent } from './shared/components/notifications/notifications.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [OcrPageComponent, NotificationsComponent],
  template: `
    <app-ocr-page />
    <app-notifications />
  `,
  styles: []
})
export class AppComponent {}