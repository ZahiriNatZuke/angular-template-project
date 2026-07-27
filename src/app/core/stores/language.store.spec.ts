import { TestBed } from '@angular/core/testing';
import { LanguageStore } from '@core/stores/language.store';
import { Languages } from '@core/types/enums/languages';
import { CookieUtils } from '@core/utils/cookie.utils';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';

describe('LanguageStore', () => {
	let use: ReturnType<typeof vi.fn>;

	const configure = () => {
		use = vi.fn();
		TestBed.configureTestingModule({
			providers: [{ provide: TranslateService, useValue: { use } }],
		});
	};

	beforeEach(() => {
		CookieUtils.delete(environment.languageKey);
		document.documentElement.removeAttribute('lang');
		configure();
	});

	it('usa el idioma por defecto cuando no hay cookie', () => {
		const store = TestBed.inject(LanguageStore);

		expect(store.current()).toBe(environment.defaultLanguage);
		expect(use).toHaveBeenCalledWith(environment.defaultLanguage);
	});

	it('restaura el idioma guardado en cookie', () => {
		CookieUtils.set(environment.languageKey, Languages.Spanish);

		const store = TestBed.inject(LanguageStore);

		expect(store.current()).toBe(Languages.Spanish);
		expect(store.isSpanish()).toBe(true);
		expect(store.isEnglish()).toBe(false);
	});

	it('ignora una cookie con un idioma no soportado', () => {
		CookieUtils.set(environment.languageKey, 'fr');

		const store = TestBed.inject(LanguageStore);

		expect(store.current()).toBe(environment.defaultLanguage);
	});

	it('setLanguage persiste la cookie, el atributo lang y avisa a TranslateService', () => {
		const store = TestBed.inject(LanguageStore);

		store.setLanguage(Languages.Spanish);

		expect(store.current()).toBe(Languages.Spanish);
		expect(CookieUtils.get(environment.languageKey)).toBe(Languages.Spanish);
		expect(document.documentElement.getAttribute('lang')).toBe(
			Languages.Spanish
		);
		expect(use).toHaveBeenCalledWith(Languages.Spanish);
	});

	it('toggleLanguage alterna entre los dos idiomas disponibles', () => {
		const store = TestBed.inject(LanguageStore);

		store.setLanguage(Languages.English);
		store.toggleLanguage();
		expect(store.current()).toBe(Languages.Spanish);

		store.toggleLanguage();
		expect(store.current()).toBe(Languages.English);
	});
});
