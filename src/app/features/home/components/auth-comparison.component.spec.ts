import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { AuthComparisonComponent } from './auth-comparison.component';

describe('AuthComparisonComponent', () => {
	let fixture: ComponentFixture<AuthComparisonComponent>;
	let component: AuthComparisonComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideTranslateService()],
		});

		fixture = TestBed.createComponent(AuthComparisonComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('renderiza una fila de tabla por aspecto comparado', () => {
		const rows = fixture.nativeElement.querySelectorAll('tbody tr');

		expect(rows.length).toBe(component.rows().length);
	});

	it('repite la misma información como tarjetas para móvil', () => {
		// Tres columnas no caben en un móvil sin scroll horizontal, así que la
		// tabla y las tarjetas conviven y se alternan por breakpoint.
		const cards = fixture.nativeElement.querySelectorAll('article');

		expect(cards.length).toBe(component.rows().length);
	});

	it('marca con iconos qué opción es la insegura', () => {
		const root = fixture.nativeElement as HTMLElement;

		expect(root.querySelectorAll('.text-error').length).toBeGreaterThan(0);
		expect(root.querySelectorAll('.text-success').length).toBeGreaterThan(0);
	});
});
