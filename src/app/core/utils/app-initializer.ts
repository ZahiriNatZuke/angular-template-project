import { AuthService, LanguageService, ThemeService } from '@core/services';

export function appInitializer(
	language: LanguageService,
	theme: ThemeService,
	auth: AuthService
) {
	return () => {
		return new Promise<void>(resolve => {
			language.init();
			theme.init();
			auth.init();
			resolve();
		});
	};
}
