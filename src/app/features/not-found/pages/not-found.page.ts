import { Location } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	DestroyRef,
	inject,
	signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SeoService } from '@core/services/seo.service';
import { LucideArrowLeft, LucideHouse } from '@lucide/angular';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
	selector: 'app-not-found-page',
	templateUrl: './not-found.page.html',
	imports: [TranslatePipe, RouterLink, LucideHouse, LucideArrowLeft],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {
	readonly #location = inject(Location);
	readonly #seoService = inject(SeoService);

	/**
	 * La URL que el usuario intentó abrir. Se captura al construir el componente
	 * porque es la ruta que acaba de resolver el comodín.
	 */
	attemptedUrl = signal(inject(Router).url);

	constructor() {
		// Una SPA responde 200 incluso en una ruta inexistente, así que sin esto
		// los buscadores indexarían la página de error como si fuera contenido.
		this.#seoService.updateTag({ name: 'robots', content: 'noindex, follow' });

		inject(DestroyRef).onDestroy(() => {
			this.#seoService.removeTag('name="robots"');
		});
	}

	goBack(): void {
		this.#location.back();
	}
}
