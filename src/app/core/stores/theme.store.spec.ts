import { TestBed } from '@angular/core/testing';
import { ThemeStore } from '@core/stores/theme.store';
import { Themes } from '@core/types/enums/themes';
import { CookieUtils } from '@core/utils/cookie.utils';
import { environment } from '@environments/environment';

describe('ThemeStore', () => {
	beforeEach(() => {
		CookieUtils.delete(environment.themeKey);
		document.documentElement.removeAttribute('data-theme');
		document.body.classList.remove(Themes.Light, Themes.Dark);
		TestBed.resetTestingModule();
	});

	it('inicializa desde la cookie guardada', () => {
		CookieUtils.set(environment.themeKey, Themes.Dark);

		const store = TestBed.inject(ThemeStore);

		expect(store.current()).toBe(Themes.Dark);
		expect(store.isDarkMode()).toBe(true);
		expect(store.isLightMode()).toBe(false);
	});

	it('cae a la preferencia del sistema cuando no hay cookie', () => {
		const store = TestBed.inject(ThemeStore);

		// jsdom reporta `matches: false` para prefers-color-scheme: dark
		expect(store.current()).toBe(Themes.Light);
	});

	it('setTheme persiste el tema en cookie y en el DOM', () => {
		const store = TestBed.inject(ThemeStore);

		store.setTheme(Themes.Dark);

		expect(store.current()).toBe(Themes.Dark);
		expect(CookieUtils.get(environment.themeKey)).toBe(Themes.Dark);
		expect(document.documentElement.getAttribute('data-theme')).toBe(
			Themes.Dark
		);
		expect(document.body.classList.contains(Themes.Dark)).toBe(true);
		expect(document.body.classList.contains(Themes.Light)).toBe(false);
	});

	it('toggleTheme alterna entre claro y oscuro', () => {
		const store = TestBed.inject(ThemeStore);

		store.setTheme(Themes.Light);
		store.toggleTheme();
		expect(store.current()).toBe(Themes.Dark);

		store.toggleTheme();
		expect(store.current()).toBe(Themes.Light);
	});
});
