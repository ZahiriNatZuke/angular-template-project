import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { dependencies, devDependencies } from '../../../../../package.json';
import { TechStackComponent } from './tech-stack.component';

describe('TechStackComponent', () => {
	let fixture: ComponentFixture<TechStackComponent>;
	let component: TechStackComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideTranslateService()],
		});

		fixture = TestBed.createComponent(TechStackComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	const items = () => component.groups().flatMap(group => group.items);

	it('renderiza un grupo por área del stack', () => {
		const groups = fixture.nativeElement.querySelectorAll('dt');

		expect(groups.length).toBe(component.groups().length);
	});

	it('lista todas las herramientas de cada grupo', () => {
		const links = fixture.nativeElement.querySelectorAll('dd li a');

		expect(links.length).toBe(items().length);
	});

	it('cada herramienta enlaza a su documentación en otra pestaña', () => {
		const links: HTMLAnchorElement[] = Array.from(
			fixture.nativeElement.querySelectorAll('dd li a')
		);

		for (const link of links) {
			expect(link.href).toMatch(/^https:\/\//);
			expect(link.target).toBe('_blank');
			// Sin `noopener`, la pestaña nueva puede manipular la que la abrió.
			expect(link.rel).toContain('noopener');
		}
	});

	it('toma las versiones del package.json y no de una lista a mano', () => {
		// Regresión de algo que ya pasó: la landing anunciaba «42 tests» mucho
		// después de que fueran otros. Un dato escrito a mano en una plantilla
		// envejece sin que nadie se dé cuenta.
		const byName = (name: string) =>
			items().find(item => item.name === name)?.version;

		expect(byName('Angular')).toBe(
			dependencies['@angular/core'].replace(/^[^\d]+/, '')
		);
		expect(byName('TypeScript')).toBe(
			devDependencies.typescript.replace(/^[^\d]+/, '')
		);
		expect(byName('Playwright')).toBe(
			devDependencies['@playwright/test'].replace(/^[^\d]+/, '')
		);
	});

	it('muestra la versión sin el rango de semver', () => {
		for (const item of items()) {
			if (item.version) {
				expect(item.version).toMatch(/^\d/);
			}
		}
	});

	it('no inventa versión para lo que no es un paquete', () => {
		// Las signals vienen dentro de Angular: no tienen versión propia.
		const signals = items().find(item => item.name === 'Angular Signals');

		expect(signals).toBeDefined();
		expect(signals?.version).toBeUndefined();
	});
});
