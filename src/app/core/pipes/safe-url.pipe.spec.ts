import { TestBed } from '@angular/core/testing';
import { SafeUrlPipe } from '@core/pipes/safe-url.pipe';

describe('SafeUrlPipe', () => {
	let pipe: SafeUrlPipe;

	beforeEach(() => {
		TestBed.configureTestingModule({ providers: [SafeUrlPipe] });
		pipe = TestBed.inject(SafeUrlPipe);
	});

	it('deja pasar una URL https', () => {
		expect(pipe.transform('https://example.com/a?b=1')).toBe(
			'https://example.com/a?b=1'
		);
	});

	it('deja pasar una ruta relativa', () => {
		expect(pipe.transform('/dashboard')).toBe('/dashboard');
	});

	it('marca como unsafe un javascript:', () => {
		// Angular no borra el valor: lo prefija con `unsafe:` para que el
		// navegador no lo ejecute al asignarlo a href o src.
		expect(pipe.transform('javascript:alert(1)')).toBe(
			'unsafe:javascript:alert(1)'
		);
	});

	it('devuelve cadena vacía para undefined', () => {
		expect(pipe.transform(undefined)).toBe('');
	});

	it('devuelve null para null', () => {
		expect(pipe.transform(null)).toBeNull();
	});
});
