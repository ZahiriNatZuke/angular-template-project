import { TestBed } from '@angular/core/testing';
import { SafeHtmlPipe } from '@core/pipes/safe-html.pipe';

describe('SafeHtmlPipe', () => {
	let pipe: SafeHtmlPipe;

	beforeEach(() => {
		TestBed.configureTestingModule({ providers: [SafeHtmlPipe] });
		pipe = TestBed.inject(SafeHtmlPipe);
	});

	it('conserva el marcado inocuo', () => {
		expect(pipe.transform('<p>Hola <strong>mundo</strong></p>')).toBe(
			'<p>Hola <strong>mundo</strong></p>'
		);
	});

	it('elimina las etiquetas script', () => {
		const result = pipe.transform('<p>ok</p><script>alert(1)</script>');

		expect(result).not.toContain('script');
		expect(result).toContain('<p>ok</p>');
	});

	it('elimina los manejadores de eventos en línea', () => {
		const result = pipe.transform('<img src="x" onerror="alert(1)">');

		expect(result).not.toContain('onerror');
	});

	it('devuelve cadena vacía para undefined', () => {
		expect(pipe.transform(undefined)).toBe('');
	});

	it('devuelve null para null', () => {
		// Asimetría deliberadamente fijada: `undefined` da '' y `null` da null,
		// porque solo `undefined` se intercepta antes de llamar al sanitizador.
		// Si algún día se unifica, que sea una decisión y no un descuido.
		expect(pipe.transform(null)).toBeNull();
	});
});
