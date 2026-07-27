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

describe('route guards', () => {
	let isAuthenticated: ReturnType<typeof signal<boolean>>;
	let navigate: ReturnType<typeof vi.spyOn>;

	const route = {} as ActivatedRouteSnapshot;
	const stateFor = (url: string) => ({ url }) as RouterStateSnapshot;

	beforeEach(() => {
		isAuthenticated = signal(false);

		TestBed.configureTestingModule({
			providers: [
				provideRouter([]),
				{
					provide: AuthStore,
					useValue: {
						isAuthenticated,
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
		it('deja pasar a un usuario autenticado', () => {
			isAuthenticated.set(true);

			const result = TestBed.runInInjectionContext(() =>
				authGuard(route, stateFor('/dashboard'))
			);

			expect(result).toBe(true);
			expect(navigate).not.toHaveBeenCalled();
		});

		it('redirige al login conservando la URL de destino', () => {
			const result = TestBed.runInInjectionContext(() =>
				authGuard(route, stateFor('/dashboard/reports'))
			);

			expect(result).toBe(false);
			expect(navigate).toHaveBeenCalledWith(['/auth/login'], {
				queryParams: { returnUrl: '/dashboard/reports' },
			});
		});
	});

	describe('anonymousGuard', () => {
		it('deja pasar a un usuario anónimo', () => {
			const result = TestBed.runInInjectionContext(() =>
				anonymousGuard(route, stateFor('/auth/login'))
			);

			expect(result).toBe(true);
		});

		it('bloquea a un usuario ya autenticado', () => {
			isAuthenticated.set(true);

			const result = TestBed.runInInjectionContext(() =>
				anonymousGuard(route, stateFor('/auth/login'))
			);

			expect(result).toBe(false);
		});
	});
});
