import { DOCUMENT } from '@angular/common';
import { effect, inject } from '@angular/core';
import { RouterStateService } from '@core/services/router-state.service';

/**
 * Id del landmark principal del shell. Lo apunta el enlace de salto del navbar y
 * es donde se deja el foco tras cada navegación.
 */
export const MAIN_CONTENT_ID = 'main-content';

/**
 * Devuelve el foco al contenido principal en cada cambio de ruta.
 *
 * En una aplicación de una sola página el navegador no mueve el foco al navegar:
 * queda donde estaba —en el enlace que se pulsó, o en el `body`— así que quien usa
 * un lector de pantalla no se entera de que la página cambió, y quien navega con
 * teclado sigue tabulando desde el navbar en lugar de desde el contenido nuevo.
 *
 * No se anuncia además el título con `LiveAnnouncer`: al enfocar el landmark, el
 * lector ya lee su contenido, y el título lo escribe `initRouterSeoUpdates` de
 * forma asíncrona —espera a que carguen las traducciones—, así que un anuncio
 * aquí llegaría con el título anterior.
 */
export function initRouteFocusManagement(): void {
	const routerState = inject(RouterStateService);
	const document = inject(DOCUMENT);

	// La primera navegación es la carga de la página: ahí el foco ya está donde
	// el navegador lo pone, y moverlo pisaría el salto a un `#fragmento`.
	let isFirstNavigation = true;

	effect(
		() => {
			const url = routerState.url();

			// Estado inicial del servicio, antes de que haya navegado nada.
			if (!url) {
				return;
			}

			if (isFirstNavigation) {
				isFirstNavigation = false;
				return;
			}

			// `preventScroll`: el desplazamiento lo gobierna el router con
			// `withInMemoryScrolling`, y enfocar no debe competir con él.
			document.getElementById(MAIN_CONTENT_ID)?.focus({ preventScroll: true });
		},
		{ debugName: 'Route Focus Management' }
	);
}
