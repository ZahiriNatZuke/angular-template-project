import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import type { INotifyOptions } from 'notiflix';

/** Los cuatro tonos de aviso de Notiflix. */
type NotifyKind = 'success' | 'info' | 'warning' | 'failure';

/**
 * Avisos al usuario, sobre Notiflix.
 *
 * Notiflix se carga **bajo demanda** con `import()`, no al arrancar la
 * aplicación. Pesa unos 100 kB en bruto —15 kB transferidos— y la mayoría de las
 * visitas no llegan a ver un solo aviso, así que no tiene por qué viajar en el
 * bundle inicial: el compilador le da su propio chunk. `INotifyOptions` entra con
 * `import type`, que TypeScript borra al compilar y no crea dependencia en tiempo
 * de ejecución.
 *
 * El precio es una espera la primera vez que se muestra algo, mientras baja el
 * chunk. Los métodos devuelven la promesa para quien necesite aguardarla —los
 * tests, sobre todo—, pero están pensados para llamarse y olvidarse: ningún aviso
 * debería bloquear el flujo que lo dispara.
 */
@Injectable({ providedIn: 'root' })
export class NotifyService {
	readonly #translate = inject(TranslateService);
	#defaultOptions = signal<INotifyOptions>({
		cssAnimationStyle: 'from-right',
		clickToClose: true,
		cssAnimationDuration: 300,
		cssAnimation: true,
		pauseOnHover: true,
		timeout: 2000,
		fontSize: '16px',
	}).asReadonly();

	/**
	 * El módulo se pide una sola vez: la promesa queda guardada, así que del
	 * segundo aviso en adelante ya no hay espera.
	 */
	#notiflix?: Promise<typeof import('notiflix')>;

	#load(): Promise<typeof import('notiflix')> {
		this.#notiflix ??= import('notiflix');
		return this.#notiflix;
	}

	async #notify(kind: NotifyKind, translateKey: string): Promise<void> {
		const { Notify } = await this.#load();

		// La traducción se resuelve después de cargar el módulo, no antes: si el
		// idioma cambió mientras bajaba el chunk, el aviso sale en el que el usuario
		// tiene delante.
		Notify[kind](this.#translate.instant(translateKey), this.#defaultOptions());
	}

	success(translateKey: string): Promise<void> {
		return this.#notify('success', translateKey);
	}

	/**
	 * Para lo que ha salido mal y el usuario necesita saber. Faltaba, que era
	 * justamente el caso más frecuente.
	 */
	failure(translateKey: string): Promise<void> {
		return this.#notify('failure', translateKey);
	}

	info(translateKey: string): Promise<void> {
		return this.#notify('info', translateKey);
	}

	warning(translateKey: string): Promise<void> {
		return this.#notify('warning', translateKey);
	}

	async loading(): Promise<void> {
		const { Loading } = await this.#load();

		Loading.dots({ svgColor: '#fff', backgroundColor: 'rgba(0,0,0,0.5)' });
	}

	async removeLoading(delay?: number): Promise<void> {
		const { Loading } = await this.#load();

		Loading.remove(delay);
	}
}
