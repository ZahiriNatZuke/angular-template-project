import { effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterStateService, SeoService } from '@core/services';
import { TranslateService } from '@ngx-translate/core';
import { startWith } from 'rxjs/operators';

/**
 * Inicializa effectos de SEO basado en cambios de router.
 * Reemplaza RouterEffects de NgRx con enfoque más simple.
 * Soporta traducciones con i18n.
 * Espera a que las traducciones estén cargadas antes de actualizar el SEO.
 */
export function initRouterSeoUpdates(): void {
	const routerState = inject(RouterStateService);
	const seoService = inject(SeoService);
	const translateService = inject(TranslateService);

	// Convertir onTranslationChange a signal para reactividad
	// Este evento se emite cuando las traducciones se cargan o actualizan
	const translationChange = toSignal(
		translateService.onLangChange.pipe(startWith(null)),
		{ requireSync: true, debugName: 'Translation Change' }
	);

	// Effect para actualizar título y meta descripción en cambios de ruta o traducciones
	effect(
		() => {
			const data = routerState.data();
			const titleKey = data['title'];
			const descriptionKey = data['description'];

			// Acceder a translationChange para que el effect se ejecute cuando cambien las traducciones
			translationChange();

			// Verificar que hay traducciones disponibles antes de proceder
			const currentLang = translateService.getCurrentLang;
			if (!currentLang || !titleKey) {
				return;
			}

			// Verificar si las traducciones están cargadas comparando instant() con la key
			const translatedTitle = translateService.instant(String(titleKey));
			if (translatedTitle === titleKey) {
				// Traducciones aún no cargadas
				return;
			}

			// Las traducciones están disponibles, proceder con actualización SEO
			if (titleKey) {
				seoService.setTitle(String(titleKey));
			}
			if (descriptionKey) {
				seoService.updateTag({
					name: 'description',
					content: String(descriptionKey),
				});
			}
		},
		{ debugName: 'Router SEO Updates' }
	);
}
