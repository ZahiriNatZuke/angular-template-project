import { Pipe, PipeTransform, SecurityContext, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'safeUrl', standalone: true })
export class SafeUrlPipe implements PipeTransform {
	readonly #domSanitizer = inject(DomSanitizer);

	transform(url: string | null | undefined): string | null {
		return url === undefined
			? ''
			: this.#domSanitizer.sanitize(SecurityContext.URL, url);
	}
}
