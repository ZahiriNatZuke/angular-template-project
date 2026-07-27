import { provideLocationMocks } from '@angular/common/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterStateService } from '@core/services/router-state.service';

@Component({ template: 'padre <router-outlet />', imports: [] })
class ParentStub {}

@Component({ template: 'hijo' })
class ChildStub {}

describe('RouterStateService', () => {
	let service: RouterStateService;
	let router: Router;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([
					{
						path: 'padre/:padreId',
						component: ParentStub,
						data: { seccion: 'padre', title: 'del-padre' },
						children: [
							{
								path: 'hijo/:hijoId',
								component: ChildStub,
								data: { title: 'del-hijo' },
							},
						],
					},
				]),
				provideLocationMocks(),
			],
		});

		service = TestBed.inject(RouterStateService);
		router = TestBed.inject(Router);
	});

	it('captura el estado inicial al construirse, sin esperar a una navegación', () => {
		// El constructor llama a `#updateRouterState()`, así que la URL ya es la
		// raíz y no el string vacío del estado inicial.
		expect(service.url()).toBe('/');
		expect(service.params()).toEqual({});
	});

	it('refleja la URL tras navegar', async () => {
		await router.navigateByUrl('/padre/7');

		expect(service.url()).toBe('/padre/7');
	});

	it('mezcla los parámetros de las rutas anidadas', async () => {
		await router.navigateByUrl('/padre/7/hijo/42');

		expect(service.params()).toEqual({ padreId: '7', hijoId: '42' });
	});

	it('expone los query params', async () => {
		await router.navigateByUrl('/padre/7?buscar=algo&pagina=2');

		expect(service.queryParams()).toEqual({ buscar: 'algo', pagina: '2' });
	});

	it('la data del hijo pisa la del padre al mezclarse', async () => {
		await router.navigateByUrl('/padre/7/hijo/42');

		// `seccion` solo la define el padre y sobrevive; `title` la definen ambos
		// y gana el hijo, que es lo que permite que cada ruta fije su propio SEO.
		expect(service.data().seccion).toBe('padre');
		expect(service.data().title).toBe('del-hijo');
	});

	it('reset vacía el estado', async () => {
		await router.navigateByUrl('/padre/7');
		expect(service.url()).not.toBe('');

		service.reset();

		expect(service.url()).toBe('');
		expect(service.params()).toEqual({});
		expect(service.data()).toEqual({});
	});
});
