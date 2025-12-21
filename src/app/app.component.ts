import { Component, inject, signal } from '@angular/core';
import { LanguageStore } from '@core/stores/language.store';
import { ThemeStore } from '@core/stores/theme.store';
import { Languages } from '@core/types/enums/languages';
import { environment } from '@environments/environment';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
	imports: [TranslatePipe],
})
export class AppComponent {
	languageStore = inject(LanguageStore);
	themeStore = inject(ThemeStore);

	version = signal(environment.version);
	repoUrl = signal('https://github.com/ZahiriNatZuke/angular-template-project');
	authorUrl = signal('https://github.com/ZahiriNatZuke');

	Languages = Languages;

	toggleLanguage(): void {
		this.languageStore.toggleLanguage();
	}

	toggleTheme(): void {
		this.themeStore.toggleTheme();
	}
}
