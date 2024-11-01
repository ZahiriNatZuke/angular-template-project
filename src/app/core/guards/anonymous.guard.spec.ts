import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { anonymousGuard } from './anonymous.guard';

describe('anonymousGuard', () => {
	const executeGuard: CanActivateFn = (...guardParameters) =>
		TestBed.runInInjectionContext(() => anonymousGuard(...guardParameters));

	beforeEach(() => {
		TestBed.configureTestingModule({});
	});

	it('should be created', () => {
		expect(executeGuard).toBeTruthy();
	});
});
