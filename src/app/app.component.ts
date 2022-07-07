import { Component } from '@angular/core';
import { AuthService, LangService, ThemeService } from '@core/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-template-project';

  constructor(private themeService: ThemeService, private langService: LangService, private authService: AuthService) {
    if (this.authService.isAuth) this.authService.checkSession();
  }

  ngOnInit(): void {
    this.langService.loadLang();
    this.themeService.init();
  }
}
