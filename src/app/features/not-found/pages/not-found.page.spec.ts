import { provideLocationMocks } from '@angular/common/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { NotFoundPage } from './not-found.page';

/** Ruta real cuyo enlace debe seguir funcionando desde la 404. */
@Component({ template: 'home' })
class HomeStub {}

describe('NotFoundPage', () => {
	let meta: Meta;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([
					{ path: '', component: HomeStub },
					{ path: '**', component: NotFoundPage },
				]),
				provideLocationMocks(),
				// Sin loader las claves se devuelven tal cual, que es justo lo que
				// hace falta aquí: se comprueba la estructura, no las traducciones.
				provideTranslateService(),
			],
		});

		meta = TestBed.inject(Meta);
		meta.removeTag('name="robots"');
	});

	const navigateTo = async (url: string) => {
		const router = TestBed.inject(Router);
		await router.navigateByUrl(url);

		const fixture = TestBed.createComponent(NotFoundPage);
		await fixture.whenStable();
		return fixture;
	};

	it('muestra la URL que el usuario intentó abrir', async () => {
		const fixture = await navigateTo('/ruta/que/no/existe');

		expect(fixture.componentInstance.attemptedUrl()).toBe(
			'/ruta/que/no/existe'
		);
		expect(fixture.nativeElement.textContent).toContain('/ruta/que/no/existe');
	});

	it('marca la página como noindex', async () => {
		await navigateTo('/otra/ruta-rota');

		expect(meta.getTag('name="robots"')?.content).toBe('noindex, follow');
	});

	it('retira el noindex al destruir el componente', async () => {
		const fixture = await navigateTo('/otra/ruta-rota');
		expect(meta.getTag('name="robots"')).not.toBeNull();

		fixture.destroy();

		// Sin esto, el noindex seguiría activo en el resto de la navegación.
		expect(meta.getTag('name="robots"')).toBeNull();
	});

	it('el comodín resuelve a la página 404 en lugar de redirigir', async () => {
		const router = TestBed.inject(Router);
		await router.navigateByUrl('/no-existe');

		expect(router.url).toBe('/no-existe');
	});
});
