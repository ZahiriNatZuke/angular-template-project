import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotifyService } from '@core/services/notify.service';
import { AuthStore } from '@core/stores/auth.store';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
	selector: 'app-dashboard-page',
	templateUrl: './dashboard.page.html',
	imports: [TranslatePipe],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
	authStore = inject(AuthStore);

	readonly #notify = inject(NotifyService);

	logout(): void {
		this.authStore.logout();

		// El aviso sale aquí y no en el store: cerrar sesión lleva al login, y una
		// pantalla de login sin más contexto no distingue entre «me fui yo» y «me
		// echaron». El toast sobrevive a la navegación porque Notiflix lo monta
		// fuera del árbol de la aplicación.
		//
		// `void`: Notiflix se carga bajo demanda, y el cierre de sesión no espera.
		void this.#notify.info('notify.session.closed');
	}
}
