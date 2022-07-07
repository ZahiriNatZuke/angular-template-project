import { Injectable } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class SeoService {

  constructor(
    private meta: Meta,
    private title: Title,
    private translateService: TranslateService
  ) {

  }

  public setTitle(title: string) {
    this.translateService.get(title)
      .subscribe(value => this.title.setTitle(`AngularTemplateProject | ${ value }`));
  };

  public addTag(tag: MetaDefinition) {
    this.meta.addTag(tag, true);
  };
}
