import {
	ApplicationConfig,
	LOCALE_ID,
	importProvidersFrom,
	inject,
	provideZonelessChangeDetection,
} from '@angular/core';
import {
	provideRouter,
	withComponentInputBinding,
	withInMemoryScrolling,
	withRouterConfig,
	withViewTransitions,
} from '@angular/router';

import { DATE_PIPE_DEFAULT_OPTIONS, registerLocaleData } from '@angular/common';
import {
	provideHttpClient,
	withFetch,
	withInterceptors,
} from '@angular/common/http';
import { environment } from '@core/environments';
import { authInterceptor } from '@core/interceptors';
import { LanguageStore } from '@core/stores';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';

import localeEN from '@angular/common/locales/en';
import localeES from '@angular/common/locales/es';
import { CustomRouterStateSerializer, RouterEffects } from '@core/router-store';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { provideStore } from '@ngrx/store';

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
				urlUpdateStrategy: 'eager',
			}),
			withInMemoryScrolling({
				anchorScrolling: 'enabled',
				scrollPositionRestoration: 'enabled',
			}),
			withViewTransitions()
		),
		provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
		provideTranslateService({
			defaultLanguage: environment.defaultLanguage,
		}),
		provideTranslateHttpLoader({
			prefix: './assets/i18n/',
			suffix: '.json',
		}),
		provideStore({ router: routerReducer }),
		provideRouterStore({ serializer: CustomRouterStateSerializer }),
		provideEffects(RouterEffects),
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
				const languageStore = inject(LanguageStore);
				return languageStore.current();
			},
		},
	],
};
