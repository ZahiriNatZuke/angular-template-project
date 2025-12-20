import { computed, inject, PLATFORM_ID } from '@angular/core';
import {
	patchState,
	signalStore,
	withComputed,
	withHooks,
	withMethods,
	withState,
} from '@ngrx/signals';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Languages } from '@core/types';
import { environment } from '@core/environments';

interface LanguageState {
	current: Languages;
	available: Languages[];
}

const LANGUAGE_STORAGE_KEY = environment.languageKey;

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
				if (!isPlatformBrowser(platformId)) return;

				const htmlElement = document.querySelector('html');

				// Update localStorage
				localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);

				// Update translate service
				translate.use(lang);

				// Update HTML lang attribute
				if (htmlElement) {
					htmlElement.setAttribute('lang', lang);
				}

				// Update state
				patchState(store, { current: lang });
			},

			toggleLanguage() {
				const newLang =
					store.current() === Languages.English
						? Languages.Spanish
						: Languages.English;
				this.setLanguage(newLang);
			},

			initLanguage() {
				if (!isPlatformBrowser(platformId)) return;

				// Load from localStorage on init
				const savedLang = localStorage.getItem(
					LANGUAGE_STORAGE_KEY
				) as Languages;
				if (savedLang && store.available().includes(savedLang)) {
					this.setLanguage(savedLang);
				} else {
					this.setLanguage(environment.defaultLanguage);
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
