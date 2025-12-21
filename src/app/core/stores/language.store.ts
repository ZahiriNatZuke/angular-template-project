import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, inject, PLATFORM_ID } from '@angular/core';
import { Languages } from '@core/types/enums/languages';
import { CookieUtils } from '@core/utils/cookie.utils';
import { environment } from '@environments/environment';
import {
	patchState,
	signalStore,
	withComputed,
	withHooks,
	withMethods,
	withState,
} from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';

interface LanguageState {
	current: Languages;
	available: Languages[];
}

export const LanguageStore = signalStore(
	{ providedIn: 'root' },
	withState<LanguageState>({
		current: Languages.Spanish,
		available: [Languages.English, Languages.Spanish],
	}),

	withComputed(store => ({
		isEnglish: computed(() => store.current() === Languages.English),
		isSpanish: computed(() => store.current() === Languages.Spanish),
	})),

	withMethods(
		(
			store,
			translate = inject(TranslateService),
			document = inject(DOCUMENT),
			platformId = inject(PLATFORM_ID)
		) => ({
			setLanguage(lang: Languages) {
				if (isPlatformBrowser(platformId)) {
					const htmlElement = document.querySelector('html');

					// Save to cookie (expires in 1 year, accessible by JavaScript)
					CookieUtils.set(environment.languageKey, lang, {
						expires: 365,
						path: '/',
						sameSite: 'Lax',
					});

					// Update translate service
					translate.use(lang);

					// Update HTML lang attribute
					if (htmlElement) {
						htmlElement.setAttribute('lang', lang);
					}

					// Update state
					patchState(store, { current: lang });
				}
			},

			toggleLanguage() {
				const newLang =
					store.current() === Languages.English
						? Languages.Spanish
						: Languages.English;
				this.setLanguage(newLang);
			},

			initLanguage() {
				if (isPlatformBrowser(platformId)) {
					// Load from cookie on init
					const savedLang = CookieUtils.get(
						environment.languageKey
					) as Languages;
					if (savedLang && store.available().includes(savedLang)) {
						this.setLanguage(savedLang);
					} else {
						this.setLanguage(environment.defaultLanguage);
					}
				}
			},
		})
	),

	withHooks({
		onInit(store) {
			store.initLanguage();
		},
	})
);
