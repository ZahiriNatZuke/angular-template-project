import { effect, inject } from '@angular/core';
import { RouterStateService, SeoService } from '@core/services';

/**
 * Inicializa effectos de SEO basado en cambios de router.
 * Reemplaza RouterEffects de NgRx con enfoque más simple.
 */
export function initRouterSeoUpdates(): void {
	const routerState = inject(RouterStateService);
	const seoService = inject(SeoService);

	// Effect: Actualizar título cuando data cambia
	effect(() => {
		const data = routerState.data();
		const title = data['title'];

		if (title) {
			seoService.setTitle(String(title));
		}
	});

	// Effect: Actualizar meta description cuando data cambia
	effect(() => {
		const data = routerState.data();
		const description = data['description'];

		if (description) {
			seoService.updateTag({
				name: 'description',
				content: String(description),
			});
		}
	});
}
