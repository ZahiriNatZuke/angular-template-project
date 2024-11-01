import { DOCUMENT } from '@angular/common';
import { Injectable, RendererFactory2, inject, signal } from '@angular/core';
import { environment } from '@core/environments';
import { Languages } from '@core/types/enums';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
	readonly #translateService = inject(TranslateService);
	readonly #document = inject(DOCUMENT);
	readonly #htmlElement = this.#document.querySelector('html');
	readonly #renderer2 = inject(RendererFactory2).createRenderer(
		this.#document,
		null
	);

	languageSignal = signal<Languages>(Languages.Spanish);

	init() {
		if (localStorage.getItem(environment.languageKey))
			this.setLang(<Languages>localStorage.getItem(environment.languageKey));
		else this.setLang(Languages.Spanish);
	}

	setLang(lang: Languages) {
		localStorage.setItem(environment.languageKey, lang);
		this.#translateService.use(lang);
		this.languageSignal.set(lang);
		this.#renderer2.setAttribute(this.#htmlElement, 'lang', lang);
	}
}
