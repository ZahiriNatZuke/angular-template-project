import { inject, Injectable, RendererFactory2, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MediaMatcher } from '@angular/cdk/layout';
import { Themes } from '@core/types/enums';
import { environment } from '@core/environments';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  #document: Document = inject(DOCUMENT);
  #htmlElement = this.#document.querySelector('html');
  #bodyElement = this.#document.body;
  #renderer2 = inject(RendererFactory2).createRenderer(this.#document, null);
  #mediaMatcher = inject(MediaMatcher);
  #theme = signal(Themes.Light);

  get isDarkMode() {
    return this.#theme() === Themes.Dark;
  }

  get currentTheme(): Themes {
    return this.#theme();
  }

  init() {
    if ( localStorage.getItem(environment.themeKey) ) {
      this.#theme.set(localStorage.getItem(environment.themeKey) as Themes);
      this.#renderer2.setAttribute(this.#htmlElement, 'data-theme', this.#theme());
    } else {
      const themeQuery = this.#mediaMatcher.matchMedia('(prefers-color-scheme: dark)');
      this.#theme.set(themeQuery.matches ? Themes.Dark : Themes.Light);
      localStorage.setItem(environment.themeKey, this.#theme());
      this.#renderer2.setAttribute(this.#htmlElement, 'data-theme', this.#theme());
    }
    this.#renderer2.addClass(this.#bodyElement, this.currentTheme);
  }

  setTheme(theme: Themes) {
    this.#renderer2.setAttribute(this.#htmlElement, 'data-theme', theme);
    this.#renderer2.removeClass(this.#bodyElement, this.currentTheme);
    this.#renderer2.addClass(this.#bodyElement, theme);
    localStorage.setItem(environment.themeKey, theme);
    this.#theme.set(theme);
  }

}
