import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AuthStore } from '@core/stores/auth.store';
import { provideTranslateService } from '@ngx-translate/core';
import { DashboardPage } from './dashboard.page';

describe('DashboardPage', () => {
	let harness: RouterTestingHarness;
	let page: DashboardPage;
	let authStoreMock: { logout: ReturnType<typeof vi.fn> } & Record<
		string,
		unknown
	>;

	beforeEach(async () => {
		authStoreMock = {
			userName: () => 'Ada Lovelace',
			userEmail: () => 'ada@example.com',
			userRole: () => 'admin',
			logout: vi.fn(),
		};

		TestBed.configureTestingModule({
			providers: [
				provideRouter([{ path: 'dashboard', component: DashboardPage }]),
				provideTranslateService(),
				{ provide: AuthStore, useValue: authStoreMock },
			],
		});

		harness = await RouterTestingHarness.create();
		page = await harness.navigateByUrl('/dashboard', DashboardPage);
	});

	it('muestra los datos del usuario del store', () => {
		const text = harness.routeNativeElement?.textContent ?? '';

		expect(text).toContain('Ada Lovelace');
		expect(text).toContain('ada@example.com');
		expect(text).toContain('admin');
	});

	it('cierra sesión al pulsar el botón', () => {
		harness.routeNativeElement
			?.querySelector<HTMLButtonElement>('button')
			?.click();

		expect(authStoreMock.logout).toHaveBeenCalledTimes(1);
	});

	it('logout delega en el store sin lógica propia', () => {
		page.logout();

		expect(authStoreMock.logout).toHaveBeenCalledTimes(1);
	});
});
