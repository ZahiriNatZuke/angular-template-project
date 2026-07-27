import { Routes } from '@angular/router';
import { anonymousGuard } from '@core/guards/anonymous.guard';
import { LoginPage } from './pages/login.page';

export default [
	{
		path: 'login',
		component: LoginPage,
		canActivate: [anonymousGuard],
		data: {
			title: 'routes.login.title',
			description: 'routes.login.description',
		},
	},
	{
		path: '',
		redirectTo: 'login',
		pathMatch: 'full',
	},
] as Routes;
