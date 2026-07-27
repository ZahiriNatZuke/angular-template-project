import { Routes } from '@angular/router';
import { HomePage } from './pages/home.page';

export default [
	{
		path: '',
		component: HomePage,
		data: {
			title: 'routes.home.title',
			description: 'routes.home.description',
		},
	},
] as Routes;
