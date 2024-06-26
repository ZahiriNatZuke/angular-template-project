import { inject, Injectable } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { TitleCasePipe } from '@angular/common';
import { Seo } from '@core/types/interfaces';
import { environment } from '@core/environments';

@Injectable({ providedIn: 'root' })
export class SeoService {

  readonly #meta = inject(Meta);
  readonly #title = inject(Title);
  readonly #translateService = inject(TranslateService);

  setTitle(title: string) {
    const translation = this.#translateService.instant(title);
    const titleCase = new TitleCasePipe().transform(String(translation));
    this.#title.setTitle(`${ environment.defaultTitle } | ${ titleCase }`);
  };

  addTag(tag: MetaDefinition) {
    this.#meta.addTag(tag, true);
  };

  updateTag(tag: MetaDefinition) {
    this.#meta.updateTag(tag);
  };

  setMetaData(seo: Seo) {
    this.#meta.updateTag({ name: 'description', content: seo?.metaDescription ?? '' });
    this.#meta.updateTag({ name: 'keywords', content: seo?.keywords ?? '' });
  }

}
