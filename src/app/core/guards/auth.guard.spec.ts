import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
	ActivatedRouteSnapshot,
	provideRouter,
	Router,
	RouterStateSnapshot,
} from '@angular/router';
import { anonymousGuard } from '@core/guards/anonymous.guard';
import { authGuard } from '@core/guards/auth.guard';
import { AuthStore } from '@core/stores/auth.store';
import { firstValueFrom, isObservable, type Observable } from 'rxjs';

describe('route guards', () => {
	let isAuthenticated: ReturnType<typeof signal<boolean>>;
	let isSessionChecked: ReturnType<typeof signal<boolean>>;
	let navigate: ReturnType<typeof vi.spyOn>;

	const route = {} as ActivatedRouteSnapshot;
	const stateFor = (url: string) => ({ url }) as RouterStateSnapshot;

	/** Los guards devuelven un Observable; esto resuelve su primer valor. */
	const resolve = (result: unknown) =>
		firstValueFrom(result as Observable<boolean>);

	beforeEach(() => {
		isAuthenticated = signal(false);
		// Por defecto la sesión ya está comprobada: cada test que necesite la
		// carrera la pone en falso explícitamente.
		isSessionChecked = signal(true);

		TestBed.configureTestingModule({
			providers: [
				provideRouter([]),
				{
					provide: AuthStore,
					useValue: {
						isAuthenticated,
						isSessionChecked,
						isAnonymous: () => !isAuthenticated(),
					},
				},
			],
		});

		navigate = vi
			.spyOn(TestBed.inject(Router), 'navigate')
			.mockResolvedValue(true);
	});

	describe('authGuard', () => {
		it('deja pasar a un usuario autenticado', async () => {
			isAuthenticated.set(true);

			const result = TestBed.runInInjectionContext(() =>
				authGuard(route, stateFor('/dashboard'))
			);

			await expect(resolve(result)).resolves.toBe(true);
			expect(navigate).not.toHaveBeenCalled();
		});

		it('redirige al login conservando la URL de destino', async () => {
			const result = TestBed.runInInjectionContext(() =>
				authGuard(route, stateFor('/dashboard/reports'))
			);

			await expect(resolve(result)).resolves.toBe(false);
			expect(navigate).toHaveBeenCalledWith(['/auth/login'], {
				queryParams: { returnUrl: '/dashboard/reports' },
			});
		});

		it('no decide nada hasta que la sesión se ha comprobado', async () => {
			isSessionChecked.set(false);

			const result = TestBed.runInInjectionContext(() =>
				authGuard(route, stateFor('/dashboard'))
			);
			expect(isObservable(result)).toBe(true);

			let decided = false;
			(result as Observable<boolean>).subscribe(() => {
				decided = true;
			});

			// Mientras la validación sigue en vuelo el guard no debe resolver,
			// y sobre todo no debe redirigir.
			expect(decided).toBe(false);
			expect(navigate).not.toHaveBeenCalled();

			// Cuando termina y hay sesión, deja pasar en lugar de expulsar.
			isAuthenticated.set(true);
			isSessionChecked.set(true);
			// `toObservable` se apoya en un effect: en modo zoneless hay que
			// vaciar la cola para que emita.
			TestBed.tick();
			await Promise.resolve();

			expect(decided).toBe(true);
			expect(navigate).not.toHaveBeenCalled();
		});
	});

	describe('anonymousGuard', () => {
		it('deja pasar a un usuario anónimo', async () => {
			const result = TestBed.runInInjectionContext(() =>
				anonymousGuard(route, stateFor('/auth/login'))
			);

			await expect(resolve(result)).resolves.toBe(true);
		});

		it('bloquea a un usuario ya autenticado', async () => {
			isAuthenticated.set(true);

			const result = TestBed.runInInjectionContext(() =>
				anonymousGuard(route, stateFor('/auth/login'))
			);

			await expect(resolve(result)).resolves.toBe(false);
		});

		it('espera también a que la sesión se haya comprobado', async () => {
			isSessionChecked.set(false);
			isAuthenticated.set(true);

			const result = TestBed.runInInjectionContext(() =>
				anonymousGuard(route, stateFor('/auth/login'))
			);

			let value: boolean | undefined;
			(result as Observable<boolean>).subscribe(v => {
				value = v;
			});
			expect(value).toBeUndefined();

			isSessionChecked.set(true);
			TestBed.tick();
			await Promise.resolve();

			expect(value).toBe(false);
		});
	});
});
