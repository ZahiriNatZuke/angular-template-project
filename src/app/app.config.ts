import {
  ApplicationConfig,
  importProvidersFrom,
  LOCALE_ID,
  provideExperimentalZonelessChangeDetection
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withRouterConfig,
  withViewTransitions
} from '@angular/router';

import { routes } from './app.routes';
import { HttpClient, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { DATE_PIPE_DEFAULT_OPTIONS, registerLocaleData } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { environment } from '@core/environments';
import { authInterceptor } from '@core/interceptors';
import { LanguageService } from '@core/services';

import localeEN from '@angular/common/locales/en';
import localeES from '@angular/common/locales/es';

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
        urlUpdateStrategy: 'eager'
      }),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      }),
      withViewTransitions()
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,
      ])
    ),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: environment.defaultLanguage,
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [ HttpClient ]
        }
      })
    ),
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: {
        dateFormat: 'medium',
        timezone: 'America\\Havana',
      }
    },
    {
      provide: LOCALE_ID,
      deps: [ LanguageService ],
      useFactory: (languageService: LanguageService) => languageService.languageSignal(),
    }
  ]
};

registerLocaleData(localeEN);
registerLocaleData(localeES);
