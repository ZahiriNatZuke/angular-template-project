import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from '@core/services/seo.service';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';

describe('SeoService', () => {
	let service: SeoService;
	let meta: Meta;
	let title: Title;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: TranslateService,
					// `setTitle` usa `instant`; el doble devuelve un valor reconocible
					// para comprobar que la traducción se aplica antes de componer.
					useValue: { instant: (key: string) => `traducido:${key}` },
				},
			],
		});

		service = TestBed.inject(SeoService);
		meta = TestBed.inject(Meta);
		title = TestBed.inject(Title);

		meta.removeTag('name="description"');
		meta.removeTag('name="keywords"');
		meta.removeTag('name="robots"');
	});

	it('traduce el título y le añade el nombre de la aplicación', () => {
		service.setTitle('routes.home.title');

		expect(title.getTitle()).toBe(
			`traducido:routes.home.title | ${environment.defaultTitle}`
		);
	});

	it('actualiza una etiqueta existente en lugar de duplicarla', () => {
		service.updateTag({ name: 'description', content: 'primera' });
		service.updateTag({ name: 'description', content: 'segunda' });

		expect(meta.getTags('name="description"')).toHaveLength(1);
		expect(meta.getTag('name="description"')?.content).toBe('segunda');
	});

	it('removeTag retira la etiqueta', () => {
		service.updateTag({ name: 'robots', content: 'noindex' });
		expect(meta.getTag('name="robots"')).not.toBeNull();

		service.removeTag('name="robots"');

		expect(meta.getTag('name="robots"')).toBeNull();
	});

	it('setMetaData escribe descripción y keywords', () => {
		service.setMetaData({
			metaDescription: 'una descripción',
			keywords: 'angular, plantilla',
		} as never);

		expect(meta.getTag('name="description"')?.content).toBe('una descripción');
		expect(meta.getTag('name="keywords"')?.content).toBe('angular, plantilla');
	});

	it('setMetaData tolera un objeto incompleto escribiendo cadenas vacías', () => {
		service.setMetaData({} as never);

		expect(meta.getTag('name="description"')?.content).toBe('');
		expect(meta.getTag('name="keywords"')?.content).toBe('');
	});
});
