import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  private _themeSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private renderer2: Renderer2;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private rendererFactory: RendererFactory2
  ) {
    this.renderer2 = rendererFactory.createRenderer(null, null);
  }

  get isDarkMode() {
    return this._themeSubject.getValue() === 'dark';
  }

  get currentTheme(): Observable<string> {
    return this._themeSubject.asObservable();
  }

  init = () => {
    if (localStorage.getItem('X-Theme-UI'))
      this._themeSubject = new BehaviorSubject<string>(<string>localStorage.getItem('X-Theme-UI'));
    else this._themeSubject = new BehaviorSubject<string>('light');

    if (this.isDarkMode) this.setDarkMode(); else this.setLightMode();
  };

  setDarkMode = () => {
    this.renderer2.addClass(this.document.body, 'dark');
    this.renderer2.setAttribute(
      this.document.getElementById('html'),
      'data-theme',
      'night'
    );
    localStorage.setItem('X-Theme-UI', 'dark');
    this._themeSubject.next('dark');
  };

  setLightMode = () => {
    this.renderer2.removeClass(this.document.body, 'dark');
    this.renderer2.setAttribute(
      this.document.getElementById('html'),
      'data-theme',
      'pastel'
    );
    localStorage.setItem('X-Theme-UI', 'light');
    this._themeSubject.next('light');
  };
}
