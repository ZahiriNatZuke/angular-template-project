import { Routes } from '@angular/router';
import { AppComponent } from '@app/app.component';

export const routes: Routes = [
	{
		path: '',
		component: AppComponent,
		data: {
			title: 'Home',
			description: 'Home page',
		},
	},
];
