import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AngularLogoComponent } from '@core/components/angular-logo.component';
import { AuthStore } from '@core/stores/auth.store';
import { LanguageStore } from '@core/stores/language.store';
import { ThemeStore } from '@core/stores/theme.store';
import { Languages } from '@core/types/enums/languages';
import { APP_LINKS } from '@core/utils/app-links';
import { TranslatePipe } from '@ngx-translate/core';
import { version } from '../../package.json';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
	imports: [TranslatePipe, RouterOutlet, RouterLink, AngularLogoComponent],
})
export class AppComponent {
	authStore = inject(AuthStore);
	languageStore = inject(LanguageStore);
	themeStore = inject(ThemeStore);

	version = signal(version);
	repoUrl = signal(APP_LINKS.repo);
	authorUrl = signal(APP_LINKS.author);

	Languages = Languages;

	toggleLanguage(): void {
		this.languageStore.toggleLanguage();
	}

	toggleTheme(): void {
		this.themeStore.toggleTheme();
	}
}
