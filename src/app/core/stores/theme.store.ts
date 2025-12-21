import { MediaMatcher } from '@angular/cdk/layout';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, inject, PLATFORM_ID } from '@angular/core';
import { environment } from '@core/environments';
import { Themes } from '@core/types';
import { CookieUtils } from '@core/utils';
import {
	patchState,
	signalStore,
	withComputed,
	withHooks,
	withMethods,
	withState,
} from '@ngrx/signals';

interface ThemeState {
	current: Themes;
	prefersDark: boolean;
}

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
				if (isPlatformBrowser(platformId)) {
					const htmlElement = document.querySelector('html');
					const body = document.body;

					// Update data-theme attribute
					htmlElement?.setAttribute('data-theme', theme);

					// Update body classes
					body.classList.remove(Themes.Light, Themes.Dark);
					body.classList.add(theme);

					// Save to cookie (expires in 1 year, accessible by JavaScript)
					CookieUtils.set(environment.themeKey, theme, {
						expires: 365,
						path: '/',
						sameSite: 'Lax',
					});

					// Update state
					patchState(store, { current: theme });
				}
			},

			toggleTheme() {
				const newTheme =
					store.current() === Themes.Dark ? Themes.Light : Themes.Dark;
				this.setTheme(newTheme);
			},

			initTheme() {
				if (isPlatformBrowser(platformId)) {
					// Check cookie first
					const savedTheme = CookieUtils.get(environment.themeKey) as Themes;
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
				}
			},
		})
	),

	withHooks({
		onInit(store) {
			store.initTheme();
		},
	})
);
