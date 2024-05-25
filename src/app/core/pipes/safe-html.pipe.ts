import { inject, Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'safeHtml', standalone: true })
export class SafeHtmlPipe implements PipeTransform {

  readonly #domSanitizer = inject(DomSanitizer);

  transform(html: string | null | undefined): string | null {
    return ( html === undefined )
      ? ''
      : this.#domSanitizer.sanitize(SecurityContext.HTML, html);
  }

}
