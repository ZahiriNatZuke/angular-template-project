import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { TechStackComponent } from './tech-stack.component';

describe('TechStackComponent', () => {
	let fixture: ComponentFixture<TechStackComponent>;
	let component: TechStackComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideTranslateService()],
		});

		fixture = TestBed.createComponent(TechStackComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('renderiza un grupo por área del stack', () => {
		const groups = fixture.nativeElement.querySelectorAll('dt');

		expect(groups.length).toBe(component.groups().length);
	});

	it('lista todas las herramientas de cada grupo', () => {
		const items = fixture.nativeElement.querySelectorAll('dd li');
		const expected = component
			.groups()
			.reduce((total, group) => total + group.items.length, 0);

		expect(items.length).toBe(expected);
	});
});
