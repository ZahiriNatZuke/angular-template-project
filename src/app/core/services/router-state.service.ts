import { computed, Injectable, inject, signal } from '@angular/core';
import {
	ActivatedRoute,
	Data,
	NavigationEnd,
	Params,
	PRIMARY_OUTLET,
	Router,
} from '@angular/router';
import { filter } from 'rxjs/operators';

export interface RouterStateSnapshot {
	url: string;
	params: Params;
	queryParams: Params;
	data: Data;
}

/**
 * Servicio que mantiene el estado del router sin NgRx.
 * Usa Angular Signals para reactividad nativa.
 * Compatible con zoneless change detection.
 */
@Injectable({
	providedIn: 'root',
})
export class RouterStateService {
	#router = inject(Router);
	#activatedRoute = inject(ActivatedRoute);

	// Estado primitivo del router
	#routerState = signal<RouterStateSnapshot>({
		url: '',
		params: {},
		queryParams: {},
		data: {},
	});

	// Selectores computados (reemplazan NgRx selectors)
	readonly state = computed(() => this.#routerState());
	readonly url = computed(() => this.#routerState().url);
	readonly params = computed(() => this.#routerState().params);
	readonly queryParams = computed(() => this.#routerState().queryParams);
	readonly data = computed(() => this.#routerState().data);

	constructor() {
		this.#initializeRouterTracking();
	}

	/**
	 * Inicializa la captura de eventos de navegación
	 */
	#initializeRouterTracking(): void {
		// Escuchar NavigationEnd para mantener estado sincronizado
		this.#router.events
			.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe(() => {
				this.#updateRouterState();
			});

		// Inicializar con estado actual
		this.#updateRouterState();
	}

	/**
	 * Actualiza el estado del router extrayendo datos del ActivatedRoute
	 */
	#updateRouterState(): void {
		const root = this.#activatedRoute.root;

		const newState: RouterStateSnapshot = {
			url: this.#router.url,
			// Se leen del `snapshot`: `route.params` y `route.queryParams` son
			// Observables, y esparcirlos copiaba las propiedades internas del
			// Subject (`_value`, `closed`, `observers`…) en lugar de los valores.
			params: this.#mergeRouteParams(root, route => route.snapshot.params),
			queryParams: this.#mergeRouteParams(
				root,
				route => route.snapshot.queryParams
			),
			data: this.#mergeRouteData(root),
		};

		this.#routerState.set(newState);
	}

	/**
	 * Mergea parámetros de todas las rutas anidadas
	 */
	#mergeRouteParams(
		route: ActivatedRoute | null,
		getter: (route: ActivatedRoute) => Params
	): Params {
		let params: Params = {};

		while (route) {
			params = { ...params, ...getter(route) };

			const child =
				route.children.find(r => r.outlet === PRIMARY_OUTLET) ||
				(route.firstChild as ActivatedRoute);

			route = child;
		}

		return params;
	}

	/**
	 * Mergea data de todas las rutas anidadas
	 */
	#mergeRouteData(route: ActivatedRoute | null): Data {
		let data: Data = {};

		while (route) {
			data = { ...data, ...route.snapshot.data };

			const child =
				route.children.find(r => r.outlet === PRIMARY_OUTLET) ||
				(route.firstChild as ActivatedRoute);

			route = child;
		}

		return data;
	}

	/**
	 * Utilidad para testing: resetear estado
	 */
	reset(): void {
		this.#routerState.set({
			url: '',
			params: {},
			queryParams: {},
			data: {},
		});
	}
}
