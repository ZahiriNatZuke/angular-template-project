import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { DashboardPage } from './pages/dashboard.page';

export default [
	{
		path: '',
		component: DashboardPage,
		canActivate: [authGuard],
		data: {
			title: 'routes.dashboard.title',
			description: 'routes.dashboard.description',
		},
	},
] as Routes;
