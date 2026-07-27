import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AuthStore } from '@core/stores/auth.store';
import { provideTranslateService } from '@ngx-translate/core';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
	let harness: RouterTestingHarness;
	let page: LoginPage;
	let authStoreMock: {
		error: ReturnType<typeof signal<string | null>>;
		isLoading: ReturnType<typeof signal<boolean>>;
		login: ReturnType<typeof vi.fn>;
		clearError: ReturnType<typeof vi.fn>;
	};

	/**
	 * Se navega de verdad en lugar de instanciar el componente a mano: el input
	 * `returnUrl` lo puebla `withComponentInputBinding()`, que solo actúa cuando
	 * es el router quien crea el componente.
	 */
	const navigateTo = async (url: string) => {
		// `RouterTestingHarness.create()` solo admite una llamada por test, pero
		// el harness sí puede navegar varias veces.
		harness ??= await RouterTestingHarness.create();
		page = await harness.navigateByUrl(url, LoginPage);
		return page;
	};

	beforeEach(async () => {
		harness = undefined as unknown as RouterTestingHarness;

		authStoreMock = {
			error: signal<string | null>(null),
			isLoading: signal(false),
			login: vi.fn(),
			clearError: vi.fn(),
		};

		TestBed.configureTestingModule({
			providers: [
				provideRouter(
					[{ path: 'auth/login', component: LoginPage }],
					withComponentInputBinding()
				),
				provideTranslateService(),
				{ provide: AuthStore, useValue: authStoreMock },
			],
		});

		await navigateTo('/auth/login');
	});

	const fill = (email: string, password: string) => {
		page.form.setValue({ email, password, rememberMe: false });
	};

	it('arranca con el formulario inválido y vacío', () => {
		expect(page.form.valid).toBe(false);
		expect(page.form.getRawValue()).toEqual({
			email: '',
			password: '',
			rememberMe: false,
		});
	});

	it('no envía nada si el formulario es inválido', () => {
		page.submit();

		expect(authStoreMock.login).not.toHaveBeenCalled();
	});

	it('marca los campos como tocados al intentar enviar vacío', () => {
		expect(page.form.controls.email.touched).toBe(false);

		page.submit();

		// Sin esto los mensajes de error no aparecerían: la plantilla los
		// condiciona a `touched`.
		expect(page.form.controls.email.touched).toBe(true);
		expect(page.form.controls.password.touched).toBe(true);
	});

	it('rechaza un correo mal formado', () => {
		fill('no-es-un-correo', 'contraseña-larga');

		expect(page.form.controls.email.hasError('email')).toBe(true);
		expect(page.form.valid).toBe(false);
	});

	it('rechaza una contraseña de menos de 8 caracteres', () => {
		fill('ada@example.com', 'corta');

		expect(page.form.controls.password.hasError('minlength')).toBe(true);
	});

	it('envía las credenciales cuando el formulario es válido', () => {
		fill('ada@example.com', 'secret123');

		page.submit();

		expect(authStoreMock.login).toHaveBeenCalledWith({
			email: 'ada@example.com',
			password: 'secret123',
			rememberMe: false,
			returnUrl: undefined,
		});
	});

	it('propaga el returnUrl que escribió el guard', async () => {
		await navigateTo('/auth/login?returnUrl=%2Fdashboard%2Freports');
		fill('ada@example.com', 'secret123');

		page.submit();

		expect(authStoreMock.login).toHaveBeenCalledWith(
			expect.objectContaining({ returnUrl: '/dashboard/reports' })
		);
	});

	it('alterna la visibilidad de la contraseña', () => {
		expect(page.showPassword()).toBe(false);

		page.togglePassword();
		expect(page.showPassword()).toBe(true);

		page.togglePassword();
		expect(page.showPassword()).toBe(false);
	});

	it('muestra el error del store y permite descartarlo', () => {
		authStoreMock.error.set('Credenciales inválidas');
		harness.detectChanges();

		expect(harness.routeNativeElement?.textContent).toContain(
			'Credenciales inválidas'
		);

		harness.routeNativeElement
			?.querySelector<HTMLButtonElement>('[role="alert"] button')
			?.click();

		expect(authStoreMock.clearError).toHaveBeenCalled();
	});

	it('deshabilita el botón de envío mientras carga', () => {
		const submitButton = () =>
			harness.routeNativeElement?.querySelector<HTMLButtonElement>(
				'button[type="submit"]'
			);

		expect(submitButton()?.disabled).toBe(false);

		authStoreMock.isLoading.set(true);
		harness.detectChanges();

		expect(submitButton()?.disabled).toBe(true);
	});
});
