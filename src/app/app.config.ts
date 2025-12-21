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
import { environment } from '@core/environments';
import { authInterceptor } from '@core/interceptors';
import { LanguageStore, ThemeStore } from '@core/stores';
import { initRouterSeoUpdates } from '@core/utils/router-seo.init';
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
