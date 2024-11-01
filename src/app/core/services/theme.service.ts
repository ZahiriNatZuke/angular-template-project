import { MediaMatcher } from '@angular/cdk/layout';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
	Injectable,
	PLATFORM_ID,
	RendererFactory2,
	computed,
	inject,
	signal,
} from '@angular/core';
import { environment } from '@core/environments';
import { Themes } from '@core/types';

@Injectable({ providedIn: 'root' })
export class ThemeService {
	#document: Document = inject(DOCUMENT);
	#htmlElement = this.#document.querySelector('html');
	#renderer2 = inject(RendererFactory2).createRenderer(this.#document, null);
	#mediaMatcher = inject(MediaMatcher);
	#theme = signal<Themes>(Themes.Light);
	#platform = inject(PLATFORM_ID);

	isDarkMode = computed(() => this.#theme() === Themes.Dark);

	get theme() {
		return this.#theme.asReadonly();
	}

	init() {
		if (isPlatformBrowser(this.#platform)) {
			if (localStorage.getItem(environment.themeKey)) {
				this.#theme.set(localStorage.getItem(environment.themeKey) as Themes);
			} else {
				const themeQuery = this.#mediaMatcher.matchMedia(
					'(prefers-color-scheme: dark)'
				);
				this.#theme.set(themeQuery.matches ? Themes.Dark : Themes.Light);
				localStorage.setItem(environment.themeKey, this.#theme());
			}
			this.#renderer2.setAttribute(
				this.#htmlElement,
				'data-theme',
				this.#theme()
			);
			this.#renderer2.removeClass(
				this.#document.body,
				this.#theme() === Themes.Dark ? Themes.Light : Themes.Dark
			);
			this.#renderer2.addClass(this.#document.body, this.#theme());
		}
	}

	setTheme(theme: Themes) {
		if (isPlatformBrowser(this.#platform)) {
			this.#renderer2.setAttribute(this.#htmlElement, 'data-theme', theme);
			this.#renderer2.removeClass(this.#document.body, this.#theme());
			this.#renderer2.addClass(this.#document.body, theme);
			localStorage.setItem(environment.themeKey, theme);
			this.#theme.set(theme);
		}
	}
}
