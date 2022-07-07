import { EventEmitter, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageType } from '@core/enums';
import { LangChangeEvent } from '@ngx-translate/core/lib/translate.service';

@Injectable({ providedIn: 'root' })
export class LangService {

  constructor(private translateService: TranslateService) {
  }

  public get langUpdated(): EventEmitter<LangChangeEvent> {
    return this.translateService.onLangChange;
  }

  public loadLang() {
    if (localStorage.getItem('X-Language')) {
      this.translateService.use(<string>localStorage.getItem('X-Language'));
    } else {
      localStorage.setItem('X-Language', LanguageType.Spain);
      this.translateService.use(LanguageType.Spain)
    }
  }

  public setLang(lang: LanguageType) {
    localStorage.setItem('X-Language', lang);
    this.translateService.use(lang);
  }
}
