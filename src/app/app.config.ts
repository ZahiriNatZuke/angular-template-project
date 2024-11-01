import {
	APP_INITIALIZER,
	ApplicationConfig,
	LOCALE_ID,
	importProvidersFrom,
	provideExperimentalZonelessChangeDetection,
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
	HttpClient,
	provideHttpClient,
	withFetch,
	withInterceptors,
} from '@angular/common/http';
import { environment } from '@core/environments';
import { authInterceptor } from '@core/interceptors';
import { AuthService, LanguageService, ThemeService } from '@core/services';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';

import localeEN from '@angular/common/locales/en';
import localeES from '@angular/common/locales/es';
import { CustomRouterStateSerializer, RouterEffects } from '@core/router-store';
import { appInitializer } from '@core/utils';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { provideStore } from '@ngrx/store';

registerLocaleData(localeEN);
registerLocaleData(localeES);

export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
	providers: [
		provideExperimentalZonelessChangeDetection(),
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
		importProvidersFrom(
			TranslateModule.forRoot({
				defaultLanguage: environment.defaultLanguage,
				loader: {
					provide: TranslateLoader,
					useFactory: createTranslateLoader,
					deps: [HttpClient],
				},
			})
		),
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
			deps: [LanguageService],
			useFactory: (languageService: LanguageService) =>
				languageService.languageSignal(),
		},
		{
			provide: APP_INITIALIZER,
			useFactory: appInitializer,
			deps: [LanguageService, ThemeService, AuthService],
			multi: true,
		},
	],
};
