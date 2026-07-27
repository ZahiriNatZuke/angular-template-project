import { Routes } from '@angular/router';

// El orden importa: las rutas con prefijo concreto van antes que la ruta vacía,
// porque `path: ''` con `loadChildren` hace coincidencia por prefijo y
// capturaría cualquier URL.
export const routes: Routes = [
	{
		path: 'auth',
		loadChildren: () => import('./features/auth/auth.routes'),
	},
	{
		path: 'dashboard',
		loadChildren: () => import('./features/dashboard/dashboard.routes'),
	},
	{
		path: '',
		loadChildren: () => import('./features/home/home.routes'),
	},
	// El comodín muestra una 404 en lugar de redirigir en silencio al inicio:
	// una redirección esconde los enlaces rotos en vez de señalarlos.
	{
		path: '**',
		loadChildren: () => import('./features/not-found/not-found.routes'),
	},
];
