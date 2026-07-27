import { Routes } from '@angular/router';
import { NotFoundPage } from './pages/not-found.page';

export default [
	{
		path: '',
		component: NotFoundPage,
		data: {
			title: 'routes.notFound.title',
			description: 'routes.notFound.description',
		},
	},
] as Routes;
