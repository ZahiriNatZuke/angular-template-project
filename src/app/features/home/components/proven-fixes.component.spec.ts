import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ProvenFixesComponent } from './proven-fixes.component';

describe('ProvenFixesComponent', () => {
	let fixture: ComponentFixture<ProvenFixesComponent>;
	let component: ProvenFixesComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideTranslateService()],
		});

		fixture = TestBed.createComponent(ProvenFixesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('renderiza un caso por fallo documentado', () => {
		const cases = fixture.nativeElement.querySelectorAll('ol > li');

		expect(cases.length).toBe(component.cases().length);
	});

	it('cada caso cuenta el síntoma y la causa', () => {
		const first = fixture.nativeElement.querySelector('ol > li');

		// Un síntoma sin causa es una anécdota; la causa es lo que enseña algo.
		expect(first.querySelectorAll('p').length).toBe(2);
	});

	it('usa una lista ordenada, que es lo que esto es', () => {
		expect(fixture.nativeElement.querySelector('ol')).not.toBeNull();
	});
});
