import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService, LanguageService, ThemeService } from '@core/services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ RouterOutlet ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = signal('angular-template-project');

  constructor() {
    inject(AuthService).init();
    inject(LanguageService).init();
    inject(ThemeService).init();
  }

}
