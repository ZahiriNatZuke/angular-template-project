import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AngularLogoComponent } from '@core/components/angular-logo.component';
import { AuthStore } from '@core/stores/auth.store';
import { LanguageStore } from '@core/stores/language.store';
import { ThemeStore } from '@core/stores/theme.store';
import { Languages } from '@core/types/enums/languages';
import { APP_LINKS, releaseUrl } from '@core/utils/app-links';
import { MAIN_CONTENT_ID } from '@core/utils/route-focus.init';
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

	/** Se lee del `package.json`, así que no hay nada que actualizar a mano. */
	version = signal(version);
	/** Notas del release de esa misma versión. */
	releaseUrl = signal(releaseUrl(version));
	repoUrl = signal(APP_LINKS.repo);
	authorUrl = signal(APP_LINKS.author);

	/** Compartido con `initRouteFocusManagement`, que enfoca este landmark. */
	mainContentId = MAIN_CONTENT_ID;

	Languages = Languages;

	toggleLanguage(): void {
		this.languageStore.toggleLanguage();
	}

	toggleTheme(): void {
		this.themeStore.toggleTheme();
	}
}
