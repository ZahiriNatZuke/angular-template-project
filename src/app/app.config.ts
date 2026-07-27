import { DATE_PIPE_DEFAULT_OPTIONS, registerLocaleData } from '@angular/common';
import {
	provideHttpClient,
	withFetch,
	withInterceptors,
} from '@angular/common/http';
import localeEN from '@angular/common/locales/en';
import localeES from '@angular/common/locales/es';
import {
	ApplicationConfig,
	inject,
	LOCALE_ID,
	provideAppInitializer,
	provideZonelessChangeDetection,
} from '@angular/core';
import {
	provideRouter,
	withComponentInputBinding,
	withInMemoryScrolling,
	withRouterConfig,
	withViewTransitions,
} from '@angular/router';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { AuthStore } from '@core/stores/auth.store';
import { LanguageStore } from '@core/stores/language.store';
import { ThemeStore } from '@core/stores/theme.store';
import { initRouterSeoUpdates } from '@core/utils/router-seo.init';
import { environment } from '@environments/environment';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';

registerLocaleData(localeEN);
registerLocaleData(localeES);

export const appConfig: ApplicationConfig = {
	providers: [
		provideZonelessChangeDetection(),
		provideRouter(
			routes,
			withComponentInputBinding(),
			withRouterConfig({
				onSameUrlNavigation: 'reload',
			}),
			withInMemoryScrolling({
				anchorScrolling: 'enabled',
				scrollPositionRestoration: 'enabled',
			}),
			withViewTransitions()
		),
		provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
		provideTranslateService({
			fallbackLang: environment.defaultLanguage,
			lang: environment.defaultLanguage,
		}),
		provideTranslateHttpLoader({
			prefix: './assets/i18n/',
			suffix: '.json',
		}),
		provideAppInitializer(() => {
			inject(LanguageStore);
			inject(ThemeStore);

			// La sesión se arranca aquí y no en `withHooks({ onInit })` del store:
			// hacer HTTP durante su construcción provoca una dependencia circular
			// con `authInterceptor`, que inyecta ese mismo store. Aquí ya está
			// completamente construido.
			//
			// No se espera a la respuesta: los guards aguardan a
			// `isSessionChecked`, así que la aplicación puede pintar mientras la
			// sesión se valida.
			const authStore = inject(AuthStore);
			authStore.fetchCsrfToken();
			authStore.checkAuth();

			initRouterSeoUpdates();
		}),
		{
			provide: DATE_PIPE_DEFAULT_OPTIONS,
			useValue: {
				dateFormat: 'medium',
				timezone: environment.timeZone,
			},
		},
		{
			provide: LOCALE_ID,
			useFactory: () => {
				return inject(LanguageStore).current();
			},
		},
	],
};
