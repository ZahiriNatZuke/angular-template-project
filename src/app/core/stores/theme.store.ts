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
import { MediaMatcher } from '@angular/cdk/layout';
import { Themes } from '@core/types';
import { environment } from '@core/environments';

interface ThemeState {
	current: Themes;
	prefersDark: boolean;
}

const THEME_STORAGE_KEY = environment.themeKey;

export const ThemeStore = signalStore(
	{ providedIn: 'root' },
	withState<ThemeState>({
		current: Themes.Light,
		prefersDark: false,
	}),

	withComputed(store => ({
		isDarkMode: computed(() => store.current() === Themes.Dark),
		isLightMode: computed(() => store.current() === Themes.Light),
	})),

	withMethods(
		(
			store,
			document = inject(DOCUMENT),
			platformId = inject(PLATFORM_ID),
			mediaMatcher = inject(MediaMatcher)
		) => ({
			setTheme(theme: Themes) {
				if (!isPlatformBrowser(platformId)) return;

				const htmlElement = document.querySelector('html');
				const body = document.body;

				// Update data-theme attribute
				htmlElement?.setAttribute('data-theme', theme);

				// Update body classes
				body.classList.remove(Themes.Light, Themes.Dark);
				body.classList.add(theme);

				// Persist to localStorage
				localStorage.setItem(THEME_STORAGE_KEY, theme);

				// Update state
				patchState(store, { current: theme });
			},

			toggleTheme() {
				const newTheme =
					store.current() === Themes.Dark ? Themes.Light : Themes.Dark;
				this.setTheme(newTheme);
			},

			initTheme() {
				if (!isPlatformBrowser(platformId)) return;

				// Check localStorage first
				const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Themes;
				if (savedTheme) {
					this.setTheme(savedTheme);
					return;
				}

				// Otherwise, check system preference
				const darkModeQuery = mediaMatcher.matchMedia(
					'(prefers-color-scheme: dark)'
				);
				const preferredTheme = darkModeQuery.matches
					? Themes.Dark
					: Themes.Light;

				patchState(store, { prefersDark: darkModeQuery.matches });
				this.setTheme(preferredTheme);
			},
		})
	),

	withHooks({
		onInit(store) {
			store.initTheme();
		},
	})
);
