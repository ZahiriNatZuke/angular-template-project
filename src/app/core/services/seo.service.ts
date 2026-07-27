import { Injectable, inject } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { Seo } from '@core/types/interfaces/seo';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class SeoService {
	readonly #meta = inject(Meta);
	readonly #title = inject(Title);
	readonly #translateService = inject(TranslateService);

	setTitle(title: string) {
		const translation = this.#translateService.instant(title);
		this.#title.setTitle(`${translation} | ${environment.defaultTitle}`);
	}

	addTag(tag: MetaDefinition) {
		this.#meta.addTag(tag, true);
	}

	updateTag(tag: MetaDefinition) {
		this.#meta.updateTag(tag);
	}

	/**
	 * Elimina una etiqueta meta por selector, por ejemplo `name="robots"`.
	 *
	 * Necesario para las etiquetas que solo aplican a una ruta: sin esto, un
	 * `noindex` puesto en una página se quedaría activo el resto de la sesión.
	 */
	removeTag(selector: string) {
		this.#meta.removeTag(selector);
	}

	setMetaData(seo: Seo) {
		this.#meta.updateTag({
			name: 'description',
			content: seo?.metaDescription ?? '',
		});
		this.#meta.updateTag({ name: 'keywords', content: seo?.keywords ?? '' });
	}
}
