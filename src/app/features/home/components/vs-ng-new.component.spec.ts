import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { VsNgNewComponent } from './vs-ng-new.component';

describe('VsNgNewComponent', () => {
	let fixture: ComponentFixture<VsNgNewComponent>;
	let component: VsNgNewComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideTranslateService()],
		});

		fixture = TestBed.createComponent(VsNgNewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('renderiza una fila por asunto comparado', () => {
		const rows = fixture.nativeElement.querySelectorAll('tbody tr');

		expect(rows.length).toBe(component.rows().length);
	});

	it('repite la comparación como tarjetas para móvil', () => {
		// Tres columnas no caben en un móvil sin scroll horizontal, así que la tabla
		// y las tarjetas conviven y se alternan por breakpoint.
		const cards = fixture.nativeElement.querySelectorAll('article');

		expect(cards.length).toBe(component.rows().length);
	});

	it('cada fila compara las dos columnas', () => {
		const cells = fixture.nativeElement.querySelectorAll(
			'tbody tr:first-child td'
		);

		// Asunto, lo que trae el CLI y lo que trae la plantilla.
		expect(cells.length).toBe(3);
	});
});
