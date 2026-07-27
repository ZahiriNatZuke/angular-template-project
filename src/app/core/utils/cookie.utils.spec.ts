import { CookieUtils } from '@core/utils/cookie.utils';

describe('CookieUtils', () => {
	const NAME = 'X-Test-Cookie';

	beforeEach(() => {
		CookieUtils.delete(NAME);
	});

	it('guarda y lee un valor', () => {
		CookieUtils.set(NAME, 'dark');

		expect(CookieUtils.get(NAME)).toBe('dark');
	});

	it('devuelve null cuando la cookie no existe', () => {
		expect(CookieUtils.get('X-Missing-Cookie')).toBeNull();
	});

	it('codifica nombres y valores con caracteres especiales', () => {
		CookieUtils.set(NAME, 'a b;c=d');

		expect(CookieUtils.get(NAME)).toBe('a b;c=d');
	});

	it('no confunde cookies cuyo nombre es prefijo de otra', () => {
		CookieUtils.set(NAME, 'uno');
		CookieUtils.set(`${NAME}-Extra`, 'dos');

		expect(CookieUtils.get(NAME)).toBe('uno');
		expect(CookieUtils.get(`${NAME}-Extra`)).toBe('dos');

		CookieUtils.delete(`${NAME}-Extra`);
	});

	it('acepta domain y secure sin romper el valor guardado', () => {
		// `secure` impide que jsdom (http://localhost) persista la cookie, así que
		// aquí solo se comprueba que la ruta de código no lanza.
		expect(() =>
			CookieUtils.set(NAME, 'light', { domain: 'localhost', secure: true })
		).not.toThrow();
	});

	it('exists refleja la presencia de la cookie', () => {
		expect(CookieUtils.exists(NAME)).toBe(false);

		CookieUtils.set(NAME, 'light');
		expect(CookieUtils.exists(NAME)).toBe(true);

		CookieUtils.delete(NAME);
		expect(CookieUtils.exists(NAME)).toBe(false);
	});
});
